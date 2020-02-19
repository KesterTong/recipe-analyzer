const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  entry: {
    apps_script: './client/apps_script_main.ts',
    web: './client/web_main.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js' ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'ui'),
  },
  externals: {
    jquery: 'jQuery',
    firebase: 'firebase',
    firebaseui: 'firebaseui',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'templates/ingredients.html',
      filename: 'ingredients.html',
      inlineSource: '.(js|css)$', // embed all javascript and css inline
      chunks: ['apps_script']
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
};