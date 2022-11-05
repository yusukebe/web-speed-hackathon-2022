import React from "react"
import { Outlet } from "react-router-dom"

import { Header } from "../../components/navs/Header/Header"

const Footer = React.lazy(() => import("../../components/navs/Footer"))

export const CommonLayout = () => {
  return (
    <div>
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
