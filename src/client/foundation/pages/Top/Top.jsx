/* eslint-disable react/display-name */
import dayjs from 'dayjs'
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import styled from "styled-components"

import { difference } from '../../../../../common/utils'
import { Container } from "../../components/layouts/Container"
import { Spacer } from "../../components/layouts/Spacer"
import { Stack } from "../../components/layouts/Stack"
import { Heading } from "../../components/typographies/Heading"
import { useAuthorizedFetch } from "../../hooks/useAuthorizedFetch"
import { useFetch } from "../../hooks/useFetch"
import { Color, Radius, Space } from "../../styles/variables"
import { isSameDay } from "../../utils/DateUtils"
import { authorizedJsonFetcher } from "../../utils/HttpUtils"

import { HeroImage } from "./internal/HeroImage"
import { BlankItem, RecentRaceList } from "./internal/RecentRaceList"

const ChargeDialog = React.lazy(() => import("./internal/ChargeDialog"))

function useTodayRacesWithAnimation(races) {
  const [isRacesUpdate, setIsRacesUpdate] = useState(false)
  const [racesToShow, setRacesToShow] = useState([])
  const numberOfRacesToShow = useRef(0)
  const prevRaces = useRef(races)
  const timer = useRef(null)

  useEffect(() => {
    const a = races.map((e) => e.id)
    const b = prevRaces.current.map((e) => e.id)
    const isRacesUpdate =
      difference([a, b]).length !== 0
    prevRaces.current = races
    setIsRacesUpdate(isRacesUpdate)
  }, [races])


  useEffect(() => {
    if (!isRacesUpdate) {
      return
    }
    // 視覚効果 off のときはアニメーションしない
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRacesToShow(races)
      return
    }

    numberOfRacesToShow.current = 0

    timer.current = setInterval(() => {
      if (numberOfRacesToShow.current === races.length) {
        clearInterval(timer.current)
        timer.current = null
        return
      }

      numberOfRacesToShow.current++
      setRacesToShow(races.slice(0, numberOfRacesToShow.current))
    }, 100)
  }, [isRacesUpdate, races])

  useEffect(() => {
    return () => {
      clearInterval(timer.current)
    }
  }, [])

  return racesToShow
}

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

/* API叩かなくてもいいのだろうか */
const heroImageUrl = "/assets/images/hero.webp" // useHeroImage(todayRaces)
const heroSmallImageUrl = "/assets/images/hero-small.webp"

/** @type {React.VFC} */
export const Top = () => {
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
    const dateStr = searchParams.toString()
    return `/api/races?${dateStr}`
  }, [location])

  let { data: raceData } = useFetch(url)

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
    useMemo(() => {
      return (raceData != null
        ? [...raceData.races]
          .sort(
            (/** @type {Model.Race} */ a, /** @type {Model.Race} */ b) =>
              dayjs(a.startAt) - dayjs(b.startAt),
          )
          .filter((/** @type {Model.Race} */ race) =>
            isSameDay(race.startAt, date),
          )
        : [])
    }, [date, raceData])

  const todayRacesToShow = useTodayRacesWithAnimation(todayRaces)

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

          <Suspense fallback="">
            <ChargeDialog ref={chargeDialogRef} onComplete={handleCompleteCharge} />
          </Suspense>
        </>
      )}

      <Spacer mt={Space * 2} />
      <section>
        <Heading as="h1">本日のレース</Heading>

        <RecentRaceList>
          {<Lists races={todayRacesToShow} />}
        </RecentRaceList>

      </section>

    </Container>
  )
}

const Lists = React.memo(({ races }) => {
  return [...Array(24)].map((_, i) => {
    const race = races ? races[i] : null
    if (race) {
      return <RecentRaceList.Item key={`list-${i}`} race={race} />
    } else {
      return <BlankItem key={`list-${i}`} ></BlankItem>
    }
  })
})
