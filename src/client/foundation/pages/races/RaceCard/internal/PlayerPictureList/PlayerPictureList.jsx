/* eslint-disable react/display-name */
import React from "react"
import styled from "styled-components"

import { Stack } from "../../../../../components/layouts/Stack"
import { Color, FontSize, Space } from "../../../../../styles/variables"

const PlayerNumber = styled.span`
  border: 1px solid ${Color.mono[900]};
  font-weight: bold;
  height: 24px;
  text-align: center;
  width: 24px;
`

const PlayerName = styled.span`
  font-size: ${FontSize.SMALL};
`

/**
 * @typedef ItemProps
 * @property {number} number
 * @property {string} image
 * @property {string} name
 */

/** @type {React.VFC<ItemProps>} */
const Item = React.memo(({ image, name, number }) => {
  const match = image.match(/([0-9]+)\.jpg$/)
  return (
    <Stack gap={Space * 1}>
      <img
        alt={`${name}選手のプロフィール写真`}
        height={100}
        src={match ? `/assets/images/players/${match[1]}.webp` : image}
        width={100}
      />

      <Stack horizontal alignItems="center" gap={Space / 2} wrap="wrap">
        <PlayerNumber>{number}</PlayerNumber>
        <PlayerName>{name}</PlayerName>
      </Stack>
    </Stack>
  )
})

export const PlayerPictureList = ({ children }) => {
  return (
    <Stack horizontal gap={Space * 2} wrap="wrap">
      {children}
    </Stack>
  )
}
PlayerPictureList.Item = Item
