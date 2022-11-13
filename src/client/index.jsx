import React from "react"
import * as ReactDOMClient from "react-dom/client"

import { App } from "./foundation/App"

/*
const container = document.getElementById('root')
const root = ReactDOMClient.createRoot(container)
root.render(<App />)
*/

ReactDOMClient.hydrateRoot(
  document.getElementById('root'),
  <App />
)