import dayjs from 'dayjs'
import React, { Suspense, useCallback, useRef } from "react"
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

let preData = null

/** @type {React.VFC} */
export const Top = () => {
  const { date = dayjs().format("YYYY-MM-DD") } = useParams()

  const chargeDialogRef = useRef(null)

  const { data: userData, revalidate } = useAuthorizedFetch(
    "/api/users/me",
    authorizedJsonFetcher,
  )

  const location = useLocation()

  const match = location.pathname.match(/^\/([0-9]{4}-[0-9]{2}-[0-9]{2})$/)

  const d = match ? new Date(match[1]) : new Date()

  const searchParam = new URLSearchParams({
    since: todayUnixTime(d),
    until: lastUnixTime(d),
  })

  const url = `/api/races?${searchParam.toString()}`

  const { data: raceData } = useFetch(url, jsonFetcher)

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
    preData = [...Array(10)].map((_, i) => ({
      id: `${i}`,
      name: "loading..."
    }))
    todayRaces = preData
  }

  /* API叩かなくてもいいのだろうか */
  const heroImageUrl = "/assets/images/hero.webp" // useHeroImage(todayRaces)
  const heroSmallImageUrl = "/assets/images/hero-small.webp"

  return (
    <Container>
      <HeroImage url={heroImageUrl} urlSmall={heroSmallImageUrl} />

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

          <Suspense fallback="">
            <ChargeDialog ref={chargeDialogRef} onComplete={handleCompleteCharge} />
          </Suspense>
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
