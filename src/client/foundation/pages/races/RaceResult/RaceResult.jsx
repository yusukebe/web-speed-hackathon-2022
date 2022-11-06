import React from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"

import { Container } from "../../../components/layouts/Container"
import { Section } from "../../../components/layouts/Section"
import { Spacer } from "../../../components/layouts/Spacer"
import { TabNav } from "../../../components/navs/TabNav"
import { Heading } from "../../../components/typographies/Heading"
import { useAuthorizedFetch } from "../../../hooks/useAuthorizedFetch"
import { useFetch } from "../../../hooks/useFetch"
import { Color, Radius, Space } from "../../../styles/variables"
import { formatTime } from "../../../utils/DateUtils"
import { authorizedJsonFetcher, jsonFetcher } from "../../../utils/HttpUtils"

import { BettingTicketList } from "./internal/BettingTicketList"
import { RaceResultSection } from "./internal/RaceResultSection"

const LiveBadge = styled.span`
  background: ${Color.red};
  border-radius: ${Radius.SMALL};
  color: ${Color.mono[0]};
  font-weight: bold;
  padding: ${Space * 1}px;
  text-transform: uppercase;
`

let preData = null

/** @type {React.VFC} */
export const RaceResult = () => {
  const { raceId } = useParams()
  let { data } = useFetch(`/api/races/${raceId}`, jsonFetcher)
  const { data: ticketData } = useAuthorizedFetch(
    `/api/races/${raceId}/betting-tickets`,
    authorizedJsonFetcher,
  )

  if (data === null && preData === null) {
    preData = {
      "entries": [
      ],
      "id": "1",
      "image": "/assets/images/races/400x225/gray.webp",
      "name": "loading...",
    }

    data = preData
  }
  if (data === null) data = preData

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
        <img height={225} src={match ? `/assets/images/races/400x225/${match[1]}.webp` : "/assets/images/races/400x225/gray.webp"} style={{ height: 'auto', width: '100%' }} width={400} />
      </Section>

      <Spacer mt={Space * 2} />

      <Section>
        <TabNav>
          <TabNav.Item to={`/races/${raceId}/race-card`}>出走表</TabNav.Item>
          <TabNav.Item to={`/races/${raceId}/odds`}>オッズ</TabNav.Item>
          <TabNav.Item aria-current to={`/races/${raceId}/result`}>
            結果
          </TabNav.Item>
        </TabNav>

        <Spacer mt={Space * 4} />
        <Heading as="h2">購入した買い目</Heading>

        <Spacer mt={Space * 2} />
        <BettingTicketList>
          {(ticketData?.bettingTickets ?? []).map((ticket) => (
            <BettingTicketList.Item key={ticket.id} ticket={ticket} />
          ))}
        </BettingTicketList>

        <Spacer mt={Space * 4} />
        <Heading as="h2">勝負結果</Heading>

        <Spacer mt={Space * 2} />
        <RaceResultSection />
      </Section>
    </Container>
  )
}
