import React, { lazy, Suspense } from "react"
import { Route, Routes as RouterRoutes } from "react-router-dom"

const Top = lazy(() => import('./pages/Top'))
const Odds = lazy(() => import('./pages/races/Odds'))
const RaceCard = lazy(() => import('./pages/races/RaceCard'))
const RaceResult = lazy(() => import('./pages/races/RaceResult'))

import CommonLayout from './layouts/CommonLayout'

/** @type {React.VFC} */
export const Routes = ({ serverData }) => {
  return (
    <Suspense fallback="">
      <RouterRoutes>
        <Route element={<CommonLayout />}>
          <Route index element={<Top serverData={serverData} />} />
          <Route element={<Top serverData={serverData} />} path=":date" />
          <Route path="races/:raceId">
            <Route element={<RaceCard serverData={serverData} />} path="race-card" />
            <Route element={<Odds serverData={serverData} />} path="odds" />
            <Route element={<RaceResult serverData={serverData} />} path="result" />
          </Route>
        </Route>
      </RouterRoutes>
    </Suspense>
  )
}

{/*
export const Routes = () => {
  return (
    <Suspense loading="loading">
      <RouterRoutes>
        <Route element={<CommonLayout />} path="/">
          <Route index element={<Top />} />
          <Route element={<Top />} path=":date" />
          <Route path="races/:raceId">
            <Route element={<RaceCard />} path="race-card" />
            <Route element={<Odds />} path="odds" />
            <Route element={<RaceResult />} path="result" />
          </Route>
        </Route>
      </RouterRoutes>
    </Suspense>
  )
}

 */}