const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const vueLoaderPlugin = require("vue-loader/lib/plugin");
const webpack = require("webpack");
const devMode = process.argv.indexOf("--mode=production") === -1;
const HappyPack = require("happypack"); //开启多进程loader转换
const os = require("os");
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin; //分析打包后的文件

module.exports = {
  //mode: "development", // 开发模式
  entry: {
    main: ["@babel/polyfill", path.resolve(__dirname, "../src/main.js")], // 入口文件  @babel/polyfill编译新API
    header: path.resolve(__dirname, "../src/head.js") // 多入口文件
  },

  output: {
    path: path.resolve(__dirname, "../dist"), // 打包后的目录
    filename: "js/[name].[hash:8].js", // 打包后的文件名称
    chunkFilename: "js/[name].[hash:8].js"
  },

  module: {
    rules: [
      // {
      //   test: /\.css$/,
      //   use: [
      //     "style-loader",
      //     MiniCssExtractPlugin.loader,
      //     "css-loader",
      //     {
      //       loader: "postcss-loader", // 添加css前缀
      //       options: {
      //         plugins: [require("autoprefixer")]
      //       }
      //     }
      //   ] // 从右向左解析原则
      // },
      // {
      //   test: /\.less$/,
      //   use: [
      //     "style-loader",
      //     MiniCssExtractPlugin.loader,
      //     "css-loader",
      //     {
      //       loader: "postcss-loader",
      //       options: {
      //         plugins: [require("autoprefixer")]
      //       }
      //     },
      //     "less-loader"
      //   ] // 从右向左解析原则
      // },
      {
        test: /\.css$/,
        use: [
          {
            loader: devMode ? "vue-style-loader" : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../dist/css/",
              hmr: devMode
            }
          },
          "css-loader",
          {
            loader: "postcss-loader", // 添加css前缀
            options: {
              plugins: [require("autoprefixer")]
            }
          }
        ] // 从右向左解析原则
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: devMode ? "vue-style-loader" : MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../dist/css/",
              hmr: devMode
            }
          },
          "css-loader",
          "less-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")]
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/i, //图片文件
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240,
              fallback: {
                loader: "file-loader",
                options: {
                  name: "img/[name].[hash:8].[ext]"
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, //媒体文件
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240,
              fallback: {
                loader: "file-loader",
                options: {
                  name: "media/[name].[hash:8].[ext]"
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i, // 字体
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240,
              fallback: {
                loader: "file-loader",
                options: {
                  name: "fonts/[name].[hash:8].[ext]"
                }
              }
            }
          }
        ]
      },
      {
        test: /\.js$/, //转译js
        use: [
          {
            loader: "happypack/loader?id=happyBabel" //把js文件交给id=happyBabel的happypack实例执行
          }
        ],
        // use: {
        //   loader: "babel-loader",
        //   options: {
        //     presets: ["@babel/preset-env"]
        //   }
        // },
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: "vue-loader",
            options: {
              compilerOptions: {
                preserveWhitespace: false
              }
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      filename: "index.html",
      chunks: ["main"] // 与入口文件对应的模块名
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/head.html"),
      filename: "head.html",
      chunks: ["header"] // 与入口文件对应的模块名
    }),
    new CleanWebpackPlugin(), // 清除dist
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash:8].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash:8].css"
    }), // css分离（用外链形式引入css）
    new vueLoaderPlugin(),
    // new Webpack.HotModuleReplacementPlugin()
    new HappyPack({
      id: "happyBabel", //与loader对应的id标识
      loaders: [
        {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { modules: false }]], //modules:false，防止Babel的预案（preset）默认将任何模块类型都转译成CommonJS类型导致tree-shaking失效。
            cacheDirectory: true
          }
        }
      ],
      threadPool: happyThreadPool // 共享进程池
    }),
    new webpack.DllReferencePlugin({
      //抽离第三方
      context: __dirname,
      manifest: require("../static/vendor-manifest.json")
    }),
    new CopyWebpackPlugin([
      // 拷贝生成的文件到dist目录 这样每次不必手动去cv
      { from: "static", to: "static" }
    ]),
    new BundleAnalyzerPlugin({
      //分析打包文件
      analyzerHost: "127.0.0.1",
      analyzerPort: 8889
    })
  ],

  resolve: {
    alias: {
      //'vue$'
      vue$: "vue/dist/vue.runtime.esm.js",
      " @": path.resolve(__dirname, "../src")
    },
    extensions: ["*", ".js", ".json", ".vue"]
  }
  // devServer: {
  //   port: 3000,
  //   hot: true,
  //   contentBase: "../dist"
  // }
};
