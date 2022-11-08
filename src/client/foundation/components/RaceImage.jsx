import React from 'react'

export const RaceImage = ({ src }) => {
  return (
    <figure>
      <img height={225} src={src} style={{
        aspectRatio: '16 / 9',
        height: 'auto',
        maxWidth: '100%'
      }} width={400} />
    </figure>
  )
}