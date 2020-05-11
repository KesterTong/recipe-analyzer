const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
  mode: "production",
  resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".js", ".ts", ".tsx"]
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
  entry: './src/web_main.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'ui'),
  },
  externals: {
    "react": "React",
    "redux": "Redux",
    "react-redux": "ReactRedux",
    "react-dom": "ReactDOM",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/ui/sidebar.html',
      filename: 'sidebar.html',
      inlineSource: '.(js|css)$', // embed all javascript and css inline
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
};