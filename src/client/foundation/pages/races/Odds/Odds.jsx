/* eslint-disable react/display-name */
import dayjs from 'dayjs'
import React, { useCallback, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"

import { RaceImage } from '../../../components/RaceImage'
import { Container } from "../../../components/layouts/Container"
import { Section } from "../../../components/layouts/Section"
import { Spacer } from "../../../components/layouts/Spacer"
import { TabNav } from "../../../components/navs/TabNav"
import { Heading } from "../../../components/typographies/Heading"
import { useFetch } from "../../../hooks/useFetch"
import { Color, Radius, Space } from "../../../styles/variables"
import { formatTime } from "../../../utils/DateUtils"

import OddsRankingList from './internal/OddsRankingList'
import OddsTable from './internal/OddsTable'
import { TicketVendingModal } from "./internal/TicketVendingModal"

const LiveBadge = styled.span`
  background: ${Color.red};
  border-radius: ${Radius.SMALL};
  color: ${Color.mono[0]};
  font-weight: bold;
  padding: ${Space * 1}px;
  text-transform: uppercase;
`

const Callout = styled.aside`
  align-items: center;
  background: ${({ $closed }) =>
    $closed ? Color.mono[200] : Color.green[100]};
  color: ${({ $closed }) => ($closed ? Color.mono[600] : Color.green[500])};
  display: flex;
  font-weight: bold;
  gap: ${Space * 2}px;
  justify-content: left;
  padding: ${Space * 1}px ${Space * 2}px;
`

const entries = [...Array(6)].map((_, i) => ({
  "id": `${i}`,
  "number": `${i}`,
  "player": {
    "id": `${i}`,
    "name": `loading...`
  },
}))

const odds = [...Array(10)].map((_, i) => ({
  "id": `${i}`,
  "key": [
    i,
  ],
  "odds": 100,
  "type": "trifecta"
}))

let preData = {
  "entries": entries,
  "image": "/assets/images/races/400x225/gray.webp",
  "name": "loading...",
  "trifectaOdds": odds
}

const SVG = React.memo(() => <svg aria-hidden="true" className="svg-inline--fa fa-info-circle fa-w-16" data-fa-i2svg="" data-icon="info-circle" data-prefix="fas" focusable="false" role="img" style={{
  height: '1em', verticalAlign:
    '-0.125em', width: '1.125em'
}} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z" fill="currentColor"></path></svg>)

let rendered = false

/** @type {React.VFC} */
export const Odds = React.memo(({ serverData }) => {
  const { raceId } = useParams()

  let { data } = useFetch(`/api/races/${raceId}`)

  const [oddsKeyToBuy, setOddsKeyToBuy] = useState(null)
  const modalRef = useRef(null)

  const handleClickOdds = useCallback(
    /**
     * @param {Model.OddsItem} odds
     */
    (odds) => {
      setOddsKeyToBuy(odds.key)
      modalRef.current?.showModal()
    },
    [],
  )

  if (typeof document !== "undefined") {
    if (data === null) {
      if (!rendered) {
        const elem = document.getElementById("root")
        const dataPool = elem.dataset.react
        if (dataPool) {
          const initialData = JSON.parse(dataPool)
          data = initialData
          data.entries = entries
          data.trifectaOdds = odds
        } else {
          data = preData
        }
      } else {
        data = preData
      }
    } else {
      rendered = true
    }
  } else {
    data = serverData
    data.entries = entries
    data.trifectaOdds = odds
  }

  const match = data ? data.image.match(/([0-9]+)\.jpg$/) : null

  const isRaceClosed = dayjs(data.closeAt).isBefore(new Date())

  return (
    <Container>
      <Spacer mt={Space * 2} />
      <Heading as="h1">{data.name}</Heading>
      <p>
        開始 {formatTime(data.startAt)} 締切 {formatTime(data.closeAt)}
      </p>

      <Spacer mt={Space * 2} />

      <Section dark shrink>
        <LiveBadge>Live</LiveBadge>
        <Spacer mt={Space * 2} />
        <RaceImage src={match ? `/assets/images/races/400x225/${match[1]}.webp` : "/assets/images/races/400x225/gray.webp"} />
      </Section>

      <Spacer mt={Space * 2} />

      <Section>
        <TabNav>
          <TabNav.Item to={`/races/${raceId}/race-card`}>出走表</TabNav.Item>
          <TabNav.Item aria-current to={`/races/${raceId}/odds`}>
            オッズ
          </TabNav.Item>
          <TabNav.Item to={`/races/${raceId}/result`}>結果</TabNav.Item>
        </TabNav>

        <Spacer mt={Space * 4} />

        <Callout $closed={isRaceClosed}>
          <SVG />
          {isRaceClosed
            ? "このレースの投票は締め切られています"
            : "オッズをクリックすると拳券が購入できます"}
        </Callout>

        <Spacer mt={Space * 4} />
        <Heading as="h2">オッズ表</Heading>

        <Spacer mt={Space * 2} />
        <OddsTable
          entries={data.entries}
          isRaceClosed={isRaceClosed}
          odds={data.trifectaOdds}
          onClickOdds={handleClickOdds}
        />

        <Spacer mt={Space * 4} />
        <Heading as="h2">人気順</Heading>

        <Spacer mt={Space * 2} />
        <OddsRankingList
          isRaceClosed={isRaceClosed}
          odds={data.trifectaOdds}
          onClickOdds={handleClickOdds}
        />
      </Section>

      <TicketVendingModal ref={modalRef} odds={oddsKeyToBuy} raceId={raceId} />
    </Container>
  )
})
