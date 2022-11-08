import React from 'react'

export const RaceImage = ({ src }) => {
  return (
    <figure style={{ aspectRatio: '16 / 9' }}>
      <img height={225} src={src} width={400} />
    </figure>
  )
}