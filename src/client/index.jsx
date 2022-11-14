import React from "react"
import { hydrateRoot } from "react-dom/client"
//import { createRoot } from "react-dom/client"

import { App } from "./foundation/App"

/*
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
*/

hydrateRoot(
  document.getElementById('root'),
  <App />
)