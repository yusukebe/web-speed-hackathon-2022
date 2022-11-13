import React from "react"
import { BrowserRouter } from "react-router-dom"

import { AuthContextProvider } from "./contexts/AuthContext"
import { Routes } from "./routes"

/** @type {React.VFC} */
export const App = () => {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </AuthContextProvider>
  )
}
