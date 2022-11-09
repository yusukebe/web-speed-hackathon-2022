/* eslint-disable @typescript-eslint/no-var-requires */

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { merge } = require("webpack-merge"); // webpack-merge

const common = require("./webpack.common.js"); // 汎用設定をインポート

// common設定とマージする
module.exports = merge(common, {
  // 開発モード
  devtool: "source-map",
  mode: "development",
  plugins: [new BundleAnalyzerPlugin()],
});
