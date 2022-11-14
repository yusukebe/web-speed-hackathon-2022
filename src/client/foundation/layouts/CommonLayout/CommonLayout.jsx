/* eslint-disable react/display-name */
import React, { Suspense } from "react"
import { Outlet } from "react-router-dom"

import Footer from "../../components/navs/Footer"
import Header from "../../components/navs/Header"


export const CommonLayout = React.memo(() => {
  return (
    <div>
      <Header />
      <main>
        <Suspense fallback="loading...">
          <Outlet key="outlet" />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
})
