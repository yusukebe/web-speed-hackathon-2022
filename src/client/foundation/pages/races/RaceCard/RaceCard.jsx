import React from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"

import { Container } from "../../../components/layouts/Container"
import { Section } from "../../../components/layouts/Section"
import { Spacer } from "../../../components/layouts/Spacer"
import { TabNav } from "../../../components/navs/TabNav"
import { Heading } from "../../../components/typographies/Heading"
import { useFetch } from "../../../hooks/useFetch"
import { Color, Radius, Space } from "../../../styles/variables"
import { formatTime } from "../../../utils/DateUtils"
import { jsonFetcher } from "../../../utils/HttpUtils"

import { EntryTable } from "./internal/EntryTable"
import { PlayerPictureList } from "./internal/PlayerPictureList"

const LiveBadge = styled.span`
  background: ${Color.red};
  border-radius: ${Radius.SMALL};
  color: ${Color.mono[0]};
  font-weight: bold;
  padding: ${Space * 1}px;
  text-transform: uppercase;
`

/** @type {React.VFC} */
export const RaceCard = () => {
  const { raceId } = useParams()
  let { data } = useFetch(`/api/races/${raceId}`, jsonFetcher)

  if (data == null) {

    const entries = [...Array(10)].map((_, i) => ({
      id: i,
      "player": {
        "id": i,
        "image": "/assets/images/races/400x225/gray.webp",
        "name": "loading...",
      },
    }))
    const preData = {
      "entries": entries,
      "image": "/assets/images/races/400x225/gray.webp",
      "name": "loading...",
    }

    data = preData

  }

  const match = data.image.match(/([0-9]+)\.jpg$/)

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
        <img height={225} src={match ? `/assets/images/races/400x225/${match[1]}.webp` : data.image} style={{ height: 'auto', width: '100%' }} width={400} />
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
          {data.entries.map((entry) => (
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
    </Container>
  )
}
