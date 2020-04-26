const path = require('path');

module.exports = {
  mode: "development",
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
    firebase: 'firebase',
    firebaseui: 'firebaseui',
    "lodash": "_"
  }
};