const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "events": false,
      "fs": false,
      "path": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": require.resolve("buffer"),
      "process": require.resolve("process/browser"),
      "url": false,
      "querystring": false,
      "zlib": false,
      "http": false,
      "https": false,
      "os": false,
      "assert": false,
      "constants": false,
      "domain": false,
      "punycode": false,
      "string_decoder": false,
      "sys": false,
      "tty": false,
      "vm": false,
      "tls": false,
      "net": false,
      "child_process": false,
      "cluster": false,
      "dgram": false,
      "dns": false,
      "module": false,
      "readline": false,
      "repl": false,
      "string_decoder": false,
      "timers": false,
      "tty": false,
      "v8": false,
      "worker_threads": false
    },
    alias: {
      'process/browser': require.resolve('process/browser')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new Dotenv({
      path: './.env',
      safe: true,
      systemvars: true,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
  },
  mode: 'development',
}; 