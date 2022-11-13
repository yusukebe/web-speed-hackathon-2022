import React from "react"
import { hydrateRoot } from "react-dom/client"

import { App } from "./foundation/App"

/*
const container = document.getElementById('root')
const root = ReactDOMClient.createRoot(container)
root.render(<App />)
*/

hydrateRoot(
  document.getElementById('root'),
  <App />
)