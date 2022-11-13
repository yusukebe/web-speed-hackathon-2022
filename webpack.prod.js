/* eslint-disable @typescript-eslint/no-var-requires */
const TerserPlugin = require("terser-webpack-plugin");
const { merge } = require("webpack-merge"); // webpack-merge

const common = require("./webpack.common.js"); // 汎用設定をインポート

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

// common設定とマージする
module.exports = merge(common, {
  mode: "production", // 開発モード
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            properties: {
              regex: /^_/,
            },
          },
        },
      }),
    ],
    moduleIds: "size",
    nodeEnv: "production",
  },
  //plugins: [new BundleAnalyzerPlugin()],
});
