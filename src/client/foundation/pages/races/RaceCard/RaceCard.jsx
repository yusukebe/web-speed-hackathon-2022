import React from "react"
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
import { jsonFetcher } from "../../../utils/HttpUtils"

import EntryTable from './internal/EntryTable'
import PlayerPictureList from "./internal/PlayerPictureList"

const LiveBadge = styled.span`
  background: ${Color.red};
  border-radius: ${Radius.SMALL};
  color: ${Color.mono[0]};
  font-weight: bold;
  padding: ${Space * 1}px;
  text-transform: uppercase;
`

const entries = [...Array(6)].map((_, i) => ({
  id: i,
  "player": {
    "id": i,
    "image": "https://wsh2022-cdn.yusukebe.com/assets/images/races/100x100/gray.webp",
    "name": "loading...",
  },
}))

let preData = {
  "entries": entries,
  "image": "https://wsh2022-cdn.yusukebe.com/assets/images/races/400x225/gray.webp",
  "name": "loading...",
}

let rendered = false

/** @type {React.VFC} */
export const RaceCard = ({ serverData }) => {

  const { raceId } = useParams()

  let { data } = useFetch(`/api/races/${raceId}`, jsonFetcher)

  if (typeof document !== "undefined") {
    if (data === null) {
      if (!rendered) {
        const elem = document.getElementById("root")
        const dataPool = elem.dataset.react
        if (dataPool) {
          const initialData = JSON.parse(dataPool)
          data = initialData
          data.entries = entries
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
  }

  const match = data ? data.image.match(/([0-9]+)\.jpg$/) : null

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
          <TabNav.Item aria-current to={`/races/${raceId}/race-card`}>
            出走表
          </TabNav.Item>
          <TabNav.Item to={`/races/${raceId}/odds`}>オッズ</TabNav.Item>
          <TabNav.Item to={`/races/${raceId}/result`}>結果</TabNav.Item>
        </TabNav>

        <Spacer mt={Space * 2} />


        <PlayerPictureList>
          {data && data.entries.map((entry) => (
            <PlayerPictureList.Item
              key={entry.id}
              image={entry.player.image}
              name={entry.player.name}
              number={entry.number}
            />
          ))}
        </PlayerPictureList>



        <Spacer mt={Space * 4} />
        {data.entries && data.entries[0]['first'] ? <EntryTable entries={data.entries} /> : <></>}

      </Section>

    </Container >
  )
}
