import React, { lazy, Suspense } from "react"
import { Route, Routes as RouterRoutes } from "react-router-dom"

//const CommonLayout = lazy(() => import('./layouts/CommonLayout'))

const Top = lazy(() => import('./pages/Top'))
const Odds = lazy(() => import('./pages/races/Odds'))
const RaceCard = lazy(() => import('./pages/races/RaceCard'))
const RaceResult = lazy(() => import('./pages/races/RaceResult'))

import CommonLayout from './layouts/CommonLayout'
/*
import Top from './pages/Top'
import Odds from './pages/races/Odds'
import RaceCard from './pages/races/RaceCard'
import RaceResult from './pages/races/RaceResult'
*/

/** @type {React.VFC} */
export const Routes = ({ serverData }) => {
  return (
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