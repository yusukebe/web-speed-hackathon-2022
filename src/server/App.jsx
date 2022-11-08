import React from "react"
import { StaticRouter } from 'react-router-dom/server'

import { Routes } from "../client/foundation/routes"

export const App = ({ location, serverData }) => {
  return (
    <StaticRouter location={location}>
      <Routes serverData={serverData} />
    </StaticRouter>
  )
}
