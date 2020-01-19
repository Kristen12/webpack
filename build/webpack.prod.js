// 生产环境主要实现的是压缩代码、提取css文件、合理的sourceMap、分割代码
const path = require("path");
const webpackConfig = require("./webpack.config.js");
const WebpackMerge = require("webpack-merge");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin"); // 增强代码压缩

module.exports = WebpackMerge(webpackConfig, {
  mode: "production",
  devtool: "cheap-module-source-map",
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../public"),
        to: path.resolve(__dirname, "../dist")
      }
    ])
  ],
  optimization: {
    minimizer: [
      //   new UglifyJsPlugin({
      //     //压缩js
      //     cache: true,
      //     parallel: true,
      //     sourceMap: true
      //   }),
      new ParallelUglifyPlugin({
        cacheDir: ".cache/",
        uglifyJS: {
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true
          }
        }
      }),
      new OptimizeCssAssetsPlugin({})
    ],
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial" // 只打包初始时依赖的第三方
        }
      }
    }
  }
});
