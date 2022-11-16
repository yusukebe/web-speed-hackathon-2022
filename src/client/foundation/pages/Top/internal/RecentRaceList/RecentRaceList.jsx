/* eslint-disable react/display-name */
import dayjs from 'dayjs'
import React, { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"

import { LinkButton } from "../../../../components/buttons/LinkButton"
import { Spacer } from "../../../../components/layouts/Spacer"
import { Stack } from "../../../../components/layouts/Stack"
import { easeOutCubic, useAnimation } from "../../../../hooks/useAnimation"
import { Color, FontSize, Radius, Space } from "../../../../styles/variables"
//import { formatCloseAt } from "../../../../utils/DateUtils"

export const RecentRaceList = React.memo(({ children }) => {
  return (
    <Stack as="ul" gap={Space * 2}>
      {children}
    </Stack>
  )
})

const ItemWrapper = styled.div`
  @keyframes fadeInOpacity {
    0% {
      opacity: 0;
    }
  100% {
		  opacity: 1;
    }
  }
  opacity: 1;
  animation-name: fadeInOpacity;
  animation-iteration-count: 1;
  animation-timing-function: ease-in;
  animation-duration: 0.5s;

  background: ${Color.mono[0]};
  border-radius: ${Radius.MEDIUM};
  padding: ${Space * 3}px;
  list-style-type: none;
`

const RaceButton = styled(LinkButton)`
  background: ${Color.mono[700]};
  border-radius: ${Radius.MEDIUM};
  color: ${Color.mono[0]};
  padding: ${Space * 1}px ${Space * 2}px;
  &:hover {
    background: ${Color.mono[800]};
  }
`

const RaceTitle = styled.h2`
  font-size: ${FontSize.LARGE};
  font-weight: bold;
`

/**
 * @typedef ItemProps
 * @property {Model.Race} race
 */


/** @type {React.VFC<ItemProps>} */
const Item = React.memo(({ race }) => {

  const timer = useRef(null)

  const [closeAtText, setCloseAtText] = useState('loading...')

  const formatCloseAt = useCallback((closeAt, now) => {
    if (dayjs(closeAt).isBefore(now)) {
      clearInterval(timer.current)
      return "投票締切"
    }

    if (dayjs(closeAt).isAfter(dayjs(now).add(2, "hours"))) {
      return "投票受付中"
    }

    return `締切${dayjs(closeAt).diff(now, "minutes")}分前`
  }, [])

  // 締切はリアルタイムで表示したい

  useEffect(() => {
    if (!timer.current) {
      timer.current = setInterval(() => {
        setCloseAtText(formatCloseAt(race.closeAt, new Date()))
      }, 500)
    }
    return () => {
      clearInterval(timer.current)
    }
  }, [formatCloseAt, race.closeAt])


  const match = race.image.match(/([0-9]+)\.jpg/)
  const url = match ? `https://wsh2022-cdn.yusukebe.com/assets/images/races/100x100/${match[1]}.webp` : `https://wsh2022-cdn.yusukebe.com/assets/images/races/100x100/gray.webp`

  return (
    <ItemWrapper>
      <Stack horizontal alignItems="center" justifyContent="space-between">
        <Stack gap={Space * 1}>
          <RaceTitle>{race.name}</RaceTitle>
          <p>{closeAtText}</p>
        </Stack>

        <Spacer mr={Space * 2} />

        <Stack.Item grow={0} shrink={0}>
          <Stack horizontal alignItems="center" gap={Space * 2}>
            <img height={100} loading="lazy" src={url} width={100} />
            <RaceButton to={`/races/${race.id}/race-card`}>投票</RaceButton>
          </Stack>
        </Stack.Item>
      </Stack>
    </ItemWrapper>
  )
})

RecentRaceList.Item = Item


export const BlankItem = React.memo(() => {
  return (
    <ItemWrapper>
      <Stack horizontal alignItems="center" justifyContent="space-between">
        <Stack gap={Space * 1}>
          <RaceTitle>&nbsp;</RaceTitle>
          <p>&nbsp;</p>
        </Stack>

        <Spacer mr={Space * 2} />

        <Stack.Item grow={0} shrink={0}>
          <Stack horizontal alignItems="center" gap={Space * 2}>
            <img height={100} src={'data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7'} width={100} />
          </Stack>
        </Stack.Item>
      </Stack>
    </ItemWrapper>
  )
})
