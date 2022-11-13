/* eslint-disable react/display-name */
import React, { lazy, Suspense } from "react"
import { Outlet } from "react-router-dom"

//import Footer from "../../components/navs/Footer"

const Footer = lazy(() => import(/* webpackPreload: true */ "../../components/navs/Footer"))

import Header from "../../components/navs/Header"


export const CommonLayout = React.memo(() => {
  return (
    <div>
      <Header />
      <main>
        <Outlet key="outlet" />
      </main>
      <Suspense fallback="">
        <Footer />
      </Suspense>
    </div>
  )
})
