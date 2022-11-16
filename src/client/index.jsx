import React from "react"
import { createRoot, hydrateRoot } from "react-dom/client"

const HYDRATE = true

import { App } from "./foundation/App"

if (HYDRATE) {
  hydrateRoot(
    document.getElementById('root'),
    <App />
  )
} else {
  const container = document.getElementById('root')
  const root = createRoot(container)
  root.render(<App />)
}
