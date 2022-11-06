import React from "react"

/**
 * @typedef Props
 * @type {object}
 * @property {string} url
 */

/** @type {React.VFC<Props>} */
export const HeroImage = ({ url, urlSmall }) => {
  return (
    <picture >
      <source media="(min-width: 480px)"
        srcSet={`${url}`} />
      <img height={735} src={urlSmall} style={{ height: 'auto', width: '100%' }} width={1024} />
    </picture >
  )
}
