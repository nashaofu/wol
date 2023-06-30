const path = require("path");

const prod = process.env.NODE_ENV === "production";

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    main: "./src/main.tsx",
  },
  output: {
    filename: "[contenthash].js",
    chunkFilename: "[contenthash].chunk.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  devtool: prod ? false : "source-map",
  builtins: {
    html: [
      {
        template: "index.html",
        minify: true,
      },
    ],
    copy: {
      patterns: [
        {
          from: "public",
        },
      ],
    },
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      "/api": "http://127.0.0.1:3300",
    },
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
        type: "css",
      },
      {
        test: /\.module.less$/,
        use: [
          {
            loader: "less-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
        type: "css/module",
      },
      {
        test: /\.(png)|(jpe?g)$/,
        type: "asset",
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
            },
          },
        ],
      },
    ],
  },
};
