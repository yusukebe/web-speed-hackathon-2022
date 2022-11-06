import React, { lazy, Suspense } from "react"
import { Outlet } from "react-router-dom"

//import Footer from "../../components/navs/Footer"
import { Header } from "../../components/navs/Header/Header"

const Footer = lazy(() => import("../../components/navs/Footer"))

export const CommonLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Suspense fallback="loading...">
        <Footer />
      </Suspense>
    </div>
  )
}
