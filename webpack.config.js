const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  mode: "production",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx"]
  },

  module: {
      rules: [
          {
              test: /\.ts(x?)$/,
              exclude: /node_modules/,
              use: [
                  {
                      loader: "ts-loader"
                  }
              ]
          },
          // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
          {
              enforce: "pre",
              test: /\.js$/,
              loader: "source-map-loader"
          }
      ]
  },



  entry: {
    //apps_script: './client/apps_script_main.ts',
    web: './client/web_main.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'ui'),
  },
  externals: {
    firebase: 'firebase',
    firebaseui: 'firebaseui',
    react: "React",
    "react-dom": "ReactDOM",
    "react-bootstrap-typeahead": "ReactBootstrapTypeahead",
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