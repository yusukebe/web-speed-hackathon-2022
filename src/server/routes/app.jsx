import { join } from "path"

import fastifyStatic from "@fastify/static"
import React from 'react'
import { renderToNodeStream } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'

import { Race } from "../../model/index.js"
import { App } from '../App.jsx'
import { createConnection } from "../typeorm/connection.js"

const SSR = true

export const appRoute = async (fastify) => {

  fastify.get("/favicon.ico", () => {
    throw fastify.httpErrors.notFound()
  })

  const topHandler = async (req, res) => {
    res.raw.setHeader("Content-Type", "text/html; charset=utf-8")

    const sheet = new ServerStyleSheet()
    const jsx = sheet.collectStyles(<App location={req.url.toString()} />)
    const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx))

    const imageURL = '/assets/images/hero-small.webp'

    let hero = `<link rel="preload" href="${imageURL}" as="image" />`
    res.raw.setHeader("Link", `<${imageURL}>; rel=preload; as=image`)

    const top = `${getHead(hero)}<body><div id="root">`

    if (SSR) {
      res.raw.write(top)
      stream.on('end', () => res.raw.end(getBottom()))
      return res.send(stream)
    }
    res.send(top + getBottom())
  }

  fastify.get("/", topHandler)
  fastify.get("/:date", topHandler)

  fastify.get("/races/:raceId/*", async (req, res) => {
    res.raw.setHeader("Content-Type", "text/html; charset=utf-8")
    const repo = (await createConnection()).getRepository(Race)
    const race = await repo.findOne(req.params.raceId)
    const match = race.image.match(/([0-9]+)\.jpg$/)
    const imageURL = `/assets/images/races/400x225/${match[1]}.webp`

    if (req.url.toString().match(/.+odds$/)) {
      res.raw.setHeader("Link", `<${imageURL}>; rel=preload; as=image, </assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Bold.woff>; rel=preload; as=font; crossorigin`)
    } else {
      res.raw.setHeader("Link", `<${imageURL}>; rel=preload; as=image`)
    }

    const top = `${getHead()}<body><div id="root" data-react=${JSON.stringify(race)}>`

    if (SSR) {
      const sheet = new ServerStyleSheet()
      const jsx = sheet.collectStyles(<App location={req.url.toString()} serverData={race} />)
      const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx))
      res.raw.write(top)
      stream.on('end', () => res.raw.end(getBottom()))
      return res.send(stream)
    }
    res.send(top + getBottom())
  })

  await fastify.register(fastifyStatic, {
    cacheControl: false,
    prefix: "/assets/",
    root: join(__dirname, "public/assets"),
    wildcard: false
  })

}

const getHead = (hero) => {
  if (hero === undefined) hero = ''
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />${hero}<title>CyberTicket</title><style>${getCSS()}</style></head>`
}

const getBottom = () => {
  return `</div><script src="/assets/js/main.bundle.js" defer></script></body></html>`
}

const getCSS = () => {
  return (
    '*,*::before,*::after{box-sizing:border-box}body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}ul[role="list"],ol[role="list"]{list-style:none}html:focus-within{scroll-behavior:smooth}body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5}a:not([class]){text-decoration-skip-ink:auto}img,picture{max-width:100%;display:block}input,button,textarea,select{font:inherit}@media(prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}' +
    `body{color:#1c1917;background:#f5f5f4;font-family:sans-serif}a{color:inherit;text-decoration:none}ol,ul{padding:0;list-style:none;margin:0}@font-face{font-family:Senobi-Gothic;font-weight:400;font-display:block;font-display:block;src:url("/assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Bold.woff") format("woff")}`
  )
}
