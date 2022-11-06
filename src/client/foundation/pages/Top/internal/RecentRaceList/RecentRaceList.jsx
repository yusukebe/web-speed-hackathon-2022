import React, { useEffect, useState } from "react"
import styled from "styled-components"

import { LinkButton } from "../../../../components/buttons/LinkButton"
import { Spacer } from "../../../../components/layouts/Spacer"
import { Stack } from "../../../../components/layouts/Stack"
import { easeOutCubic, useAnimation } from "../../../../hooks/useAnimation"
import { Color, FontSize, Radius, Space } from "../../../../styles/variables"
import { formatCloseAt } from "../../../../utils/DateUtils"

export const RecentRaceList = ({ children }) => {
  return (
    <Stack as="ul" gap={Space * 2}>
      {children}
    </Stack>
  )
}

/*
const ItemWrapper = styled.li`
  background: ${Color.mono[0]};
  border-radius: ${Radius.MEDIUM};
  opacity: ${({ $opacity }) => $opacity};
  padding: ${Space * 3}px;
`
*/

const ItemWrapper = styled.li.attrs(() => ({
  style: {
  }
}))`
  background: ${Color.mono[0]};
  border-radius: ${Radius.MEDIUM};
  padding: ${Space * 3}px;
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

export const BlankItem = () => {
  return <ItemWrapper>
    <Stack horizontal alignItems="center" justifyContent="space-between">
      <Stack gap={Space * 1}>
      </Stack>

      <Spacer mr={Space * 2} />

      <Stack.Item grow={0} shrink={0}>
        <Stack horizontal alignItems="center" gap={Space * 2}>
          <img height={100} src={'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='} width={100} />

        </Stack>
      </Stack.Item>
    </Stack>
  </ItemWrapper>
}



/**
 * @typedef ItemProps
 * @property {Model.Race} race
 */

/** @type {React.VFC<ItemProps>} */
const Item = ({ race }) => {

  if (!race || typeof race['closeAt'] === 'undefined') {
    return (
      <ItemWrapper>
        <Stack horizontal alignItems="center" justifyContent="space-between">
          <Stack gap={Space * 1}>
          </Stack>

          <Spacer mr={Space * 2} />

          <Stack.Item grow={0} shrink={0}>
            <Stack horizontal alignItems="center" gap={Space * 2}>
              <img height={100} src={'http://localhost:3000/assets/images/races/100x100/gray.webp'} width={100} />
              <RaceButton to={``}>投票</RaceButton>
            </Stack>
          </Stack.Item>
        </Stack>
      </ItemWrapper>)
  }

  const [closeAtText, setCloseAtText] = useState(formatCloseAt(race.closeAt))

  // 締切はリアルタイムで表示したい
  useEffect(() => {
    const timer = setInterval(() => {
      setCloseAtText(formatCloseAt(race.closeAt))
    }, 0)

    return () => {
      clearInterval(timer)
    }
  }, [race.closeAt])

  const {
    abortAnimation,
    resetAnimation,
    startAnimation,
    value: opacity,
  } = useAnimation({
    duration: 500,
    end: 1,
    start: 0,
    timingFunction: easeOutCubic,
  })

  useEffect(() => {
    resetAnimation()
    startAnimation()

    return () => {
      abortAnimation()
    }
  }, [race.id, startAnimation, abortAnimation, resetAnimation])

  const match = race.image.match(/([0-9]+)\.jpg/)
  const id = match[1]
  const src = `/assets/images/races/100x100/${id}.webp`

  return (
    <ItemWrapper $opacity={opacity}>
      <Stack horizontal alignItems="center" justifyContent="space-between">
        <Stack gap={Space * 1}>
          <RaceTitle>{race.name}</RaceTitle>
          <p>{closeAtText}</p>
        </Stack>

        <Spacer mr={Space * 2} />

        <Stack.Item grow={0} shrink={0}>
          <Stack horizontal alignItems="center" gap={Space * 2}>
            <img height={100} loading={'lazy'} src={src} width={100} />
            <RaceButton to={`/races/${race.id}/race-card`}>投票</RaceButton>
          </Stack>
        </Stack.Item>
      </Stack>
    </ItemWrapper>
  )
}
RecentRaceList.Item = Item
