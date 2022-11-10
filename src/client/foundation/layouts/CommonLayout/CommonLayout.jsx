/* eslint-disable react/display-name */
import React from "react"
import { Outlet } from "react-router-dom"

import Footer from "../../components/navs/Footer"
import { Header } from "../../components/navs/Header/Header"


export const CommonLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet key="outlet" />
      </main>
      <Footer />
    </div>
  )
}
