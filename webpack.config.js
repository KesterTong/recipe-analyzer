const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  entry: {
    custom_ingredient: './client/custom_ingredient.ts',
    ingredients: './client/ingredients.ts',
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
    jquery: 'jQuery'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'templates/custom_ingredient.html',
      filename: 'custom_ingredient.html',
      inlineSource: '.(js|css)$', // embed all javascript and css inline
      chunks: ['custom_ingredient'],
    }),
    new HtmlWebpackPlugin({
      template: 'templates/ingredients.html',
      filename: 'ingredients.html',
      inlineSource: 'ingredients.bundle.js',
      inlineSource: '.(js|css)$', // embed all javascript and css inline
      chunks: ['ingredients'],
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
};