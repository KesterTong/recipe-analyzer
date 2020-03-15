const path = require('path');

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
  entry: './src/web_main.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'ui'),
  },
  externals: {
    firebase: 'firebase',
    firebaseui: 'firebaseui',
    react: "React",
    "redux": "Redux",
    "react-redux": "ReactRedux",
    "react-dom": "ReactDOM",
    "react-bootstrap": "ReactBootstrap",
    "react-bootstrap-typeahead": "ReactBootstrapTypeahead",
  },
	optimization: {
		// We do not want to minimize our code.
		minimize: false
	},
};