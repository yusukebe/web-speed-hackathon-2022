/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

function abs(...args) {
  return path.join(__dirname, ...args);
}

const SRC_ROOT = abs("./src");
const DIST_ROOT = abs("./dist");

const SRC_TEMPLATE = abs("./src/server/templates");
const DIST_TEMPLATE = abs("./dist/templates");

module.exports = {
  entry: path.join(SRC_ROOT, "server/index.js"),
  externals: [nodeExternals()],
  mode: "development",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(js|mjs|jsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  modules: "cjs",
                  spec: true,
                },
              ],
              "@babel/preset-react",
            ],
          },
        },
      },
    ],
  },
  name: "server",
  output: {
    filename: "server.js",
    path: DIST_ROOT,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: SRC_TEMPLATE, to: DIST_TEMPLATE }],
    }),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".jsx"],
  },
  target: "node",
};
