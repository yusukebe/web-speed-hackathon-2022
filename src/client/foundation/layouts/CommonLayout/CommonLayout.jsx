/* eslint-disable react/display-name */
import React, { Suspense } from "react"
import { Outlet } from "react-router-dom"

//import Footer from "../../components/navs/Footer"
import Header from "../../components/navs/Header"

const Footer = React.lazy(() => import("../../components/navs/Footer"))
//const Header = React.lazy(() => import("../../components/navs/Header"))


export const CommonLayout = React.memo(() => {
  return (
    <div>
      <Header />
      <main>
        <Outlet key="outlet" />
      </main>
      <Suspense fallback="loading...">
        <Footer />
      </Suspense>
    </div>
  )
})
