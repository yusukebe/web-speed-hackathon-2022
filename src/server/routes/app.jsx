import { join } from "path"

import fastifyStatic from "@fastify/static"
import dayjs from 'dayjs'
import React from 'react'
import { renderToNodeStream } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm"


import { Race } from "../../model/index.js"
import { App } from '../App.jsx'
import { IS_PRODUCTION } from "../index.js"
import { createConnection } from "../typeorm/connection.js"

const todayUnixTime = (d) => {
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  return Math.floor(d.getTime() / 1000)
}

const lastUnixTime = (d) => {
  d.setHours(23)
  d.setMinutes(59)
  d.setSeconds(59)
  return Math.floor(d.getTime() / 1000)
}


/**
 * @type {import('fastify').FastifyPluginCallback}
 */
export const appRoute = async (fastify) => {
  if (!IS_PRODUCTION) {
    fastify.register(import("@fastify/compress"), {
      encodings: ["gzip"],
    })
  }

  fastify.register(fastifyStatic, {
    prefix: "/assets/",
    root: join(__dirname, "public/assets"),
    wildcard: false,
  })

  fastify.get("/favicon.ico", () => {
    throw fastify.httpErrors.notFound()
  })



  fastify.get("/", async (req, res) => {

    const d = new Date()
    const since = dayjs.unix(todayUnixTime(d))
    const until = dayjs.unix(lastUnixTime(d))

    const where = {}
    Object.assign(where, {
      startAt: MoreThanOrEqual(since.utc().format("YYYY-MM-DD HH:mm:ss")),
    })
    Object.assign(where, {
      startAt: LessThanOrEqual(until.utc().format("YYYY-MM-DD HH:mm:ss")),
    })

    const repo = (await createConnection()).getRepository(Race)

    const races = {
      races: await repo.find({
        where,
      })
    }

    res.raw.setHeader("Content-Type", "text/html; charset=utf-8")
    const sheet = new ServerStyleSheet()
    const jsx = sheet.collectStyles(<App location={req.url.toString()} serverData={races} />)
    const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx))

    const top = `${getHead('')}<body><div id="root" data-react=${JSON.stringify(races)}>`
    res.raw.write(top)
    stream.on('end', () => res.raw.end(getBottom()))

    res.send(stream)
  })

  fastify.get("/:date", async (req, res) => {
    res.raw.setHeader("Content-Type", "text/html; charset=utf-8")
    res.raw.setHeader("Link", `</assets/images/hero-small.webp>; rel="preload"`)
    res.raw.write(getHead(`<link rel="preload" href="/assets/images/hero-small.webp" as="image" />`))
    const stream = getStream(req.url.toString())
    stream.on('end', () => res.raw.end(getBottom()))
    res.send(stream)
  })

  fastify.get("/races/:raceId/*", async (req, res) => {
    const repo = (await createConnection()).getRepository(Race)

    const race = await repo.findOne(req.params.raceId, {
      relations: ["entries", "entries.player", "trifectaOdds"],
    })

    const match = race.image.match(/([0-9]+)\.jpg$/)
    const imageURL = `/assets/images/races/400x225/${match[1]}.webp`
    const hero = `<link rel="preload" href="${imageURL}" as="image" />`
    res.raw.setHeader("Link", `<${imageURL}>; rel="preload"`)

    res.raw.setHeader("Content-Type", "text/html; charset=utf-8")
    const sheet = new ServerStyleSheet()
    const jsx = sheet.collectStyles(<App location={req.url.toString()} serverData={race} />)
    const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx))

    const top = `${getHead(hero)}<body><div id="root" data-react=${JSON.stringify(race)}>`
    res.raw.write(top)
    stream.on('end', () => res.raw.end(getBottom()))

    res.send(stream)
  })

}

const getStream = (location) => {
  const sheet = new ServerStyleSheet()
  const jsx = sheet.collectStyles(<App location={location} />)
  const stream = sheet.interleaveWithNodeStream(renderToNodeStream(jsx))
  return stream
}

const getHead = (hero) => {
  return `<!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${hero}
      <title>CyberTicket</title>
      <style>${getCSS()}</style>
    </head>`
}

const getBottom = () => {
  return `</div><script src="/assets/js/main.bundle.js"></script></body></html>`
}


const getCSS = () => {
  return (
    '*,*::before,*::after{box-sizing:border-box}body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}ul[role="list"],ol[role="list"]{list-style:none}html:focus-within{scroll-behavior:smooth}body{min-height:100vh;text-rendering:optimizeSpeed;line-height:1.5}a:not([class]){text-decoration-skip-ink:auto}img,picture{max-width:100%;display:block}input,button,textarea,select{font:inherit}@media(prefers-reduced-motion:reduce){html:focus-within{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}' +
    `body{color:#1c1917;background:#f5f5f4;font-family:sans-serif}a{color:inherit;text-decoration:none}ol,ul{padding:0;list-style:none;margin:0}@font-face{font-family:Senobi-Gothic;font-weight:400;font-display:block;src:url("/assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Regular.woff") format("woff")}@font-face{font-family:Senobi-Gothic;font-weight:700;font-display:block;src:url("/assets/fonts/MODI_Senobi-Gothic_2017_0702/Senobi-Gothic-Bold.woff") format("woff")}`
  )
}
