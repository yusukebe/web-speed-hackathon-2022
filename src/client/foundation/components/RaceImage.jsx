import React from 'react'

// eslint-disable-next-line react/display-name
export const RaceImage = React.memo(({ src }) => {
  return (
    <figure>
      <img height={225} src={src} style={{
        aspectRatio: '16 / 9',
        height: 'auto',
        maxWidth: '100%'
      }} width={400} />
    </figure>
  )
})