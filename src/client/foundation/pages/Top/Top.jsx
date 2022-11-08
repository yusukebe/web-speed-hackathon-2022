import dayjs from 'dayjs'
import React, { useCallback, useMemo, useRef } from "react"
import { useLocation, useParams } from "react-router-dom"
import styled from "styled-components"

import { Container } from "../../components/layouts/Container"
import { Spacer } from "../../components/layouts/Spacer"
import { Stack } from "../../components/layouts/Stack"
import { Heading } from "../../components/typographies/Heading"
import { useAuthorizedFetch } from "../../hooks/useAuthorizedFetch"
import { useFetch } from "../../hooks/useFetch"
import { Color, Radius, Space } from "../../styles/variables"
import { isSameDay } from "../../utils/DateUtils"
import { authorizedJsonFetcher, jsonFetcher } from "../../utils/HttpUtils"

//import ChargeDialog from './internal/ChargeDialog'
import { HeroImage } from "./internal/HeroImage"
import { RecentRaceList } from "./internal/RecentRaceList"


const ChargeDialog = React.lazy(() => import("./internal/ChargeDialog"))


const ChargeButton = styled.button`
background: ${Color.mono[700]};
border-radius: ${Radius.MEDIUM};
color: ${Color.mono[0]};
padding: ${Space * 1}px ${Space * 2}px;

&:hover {
  background: ${Color.mono[800]};
}
`

const todayUnixTime = (d) => {
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  return Math.floor(d.getTime() / 1000)
}

const lastUnixTime = (d) => {
  d.setHours(23)
  d.setMinutes(59)
  d.setSeconds(59)
  return Math.floor(d.getTime() / 1000)
}

const preData = [...Array(10)].map((_, i) => ({
  id: `${i}`,
  name: "loading..."
}))
/* API叩かなくてもいいのだろうか */
const heroImageUrl = "https://wsh2022-cdn.yusukebe.com/assets/images/hero.webp" // useHeroImage(todayRaces)
const heroSmallImageUrl = "https://wsh2022-cdn.yusukebe.com/assets/images/hero-small.webp"

/** @type {React.VFC} */
export const Top = ({ serverData }) => {
  const { date = dayjs().format("YYYY-MM-DD") } = useParams()

  const chargeDialogRef = useRef(null)

  const { data: userData, revalidate } = useAuthorizedFetch(
    "/api/users/me",
    authorizedJsonFetcher,
  )

  const location = useLocation()
  const url = useMemo(() => {
    const match = location.pathname.match(/^\/([0-9]{4}-[0-9]{2}-[0-9]{2})$/)
    const d = match ? new Date(match[1]) : new Date()
    const searchParams = new URLSearchParams({
      since: todayUnixTime(d),
      until: lastUnixTime(d),
    })
    return `/api/races?${searchParams.toString()}`
  }, [location])

  let { data: raceData } = useFetch(url, jsonFetcher)

  if (typeof document !== "undefined") {
    if (raceData == null) {
      const dataPool = (document.getElementById("root")).dataset
        .react
      const elem = document.getElementById("root")
      const initialData = dataPool ? JSON.parse(dataPool) : null
      elem.dataset.react = ""
      raceData = initialData
    }
  } else if (raceData == null) {
    raceData = serverData
  }

  const handleClickChargeButton = useCallback(() => {
    if (chargeDialogRef.current === null) {
      return
    }
    chargeDialogRef.current.showModal()
  }, [])

  const handleCompleteCharge = useCallback(() => {
    revalidate()
  }, [revalidate])

  let todayRaces =
    raceData != null
      ? [...raceData.races]
        .sort(
          (/** @type {Model.Race} */ a, /** @type {Model.Race} */ b) =>
            dayjs(a.startAt) - dayjs(b.startAt),
        )
        .filter((/** @type {Model.Race} */ race) =>
          isSameDay(race.startAt, date),
        )
      : []

  if (todayRaces.length === 0) {
    todayRaces = preData
  }

  const hero = useMemo(() => {
    return <HeroImage url={heroImageUrl} urlSmall={heroSmallImageUrl} />
  }, [])

  return (
    <Container>
      {hero}
      <Spacer mt={Space * 2} />
      {userData && (
        <>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <div>
              <p>ポイント残高: {userData.balance}pt</p>
              <p>払戻金: {userData.payoff}Yeen</p>
            </div>

            <ChargeButton onClick={handleClickChargeButton}>
              チャージ
            </ChargeButton>
          </Stack>

          <ChargeDialog ref={chargeDialogRef} onComplete={handleCompleteCharge} />
        </>
      )}

      <Spacer mt={Space * 2} />
      <section>
        <Heading as="h1">本日のレース</Heading>

        <RecentRaceList>
          {todayRaces.map((race, _) => (
            <RecentRaceList.Item key={race.id} race={race} />
          ))}
        </RecentRaceList>

      </section>

    </Container>
  )
}
