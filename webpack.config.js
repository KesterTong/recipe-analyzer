const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const commonConfig = {
  mode: 'development',
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
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
  optimization: {
    minimize: false
  },
}

module.exports = [
  {
    ...commonConfig,
    entry: './src/client/sidebar.tsx',
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/client/sidebar.html',
        filename: 'sidebar.html',
        inlineSource: '.(js|css)$', // embed all javascript and css inline
      }),
      new HtmlWebpackInlineSourcePlugin(),
    ],
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
      contentBase: './dist',
    },
  },
  {
    ...commonConfig,
    entry: './tests/integration/test_main.tsx',
    plugins: [
      new HtmlWebpackPlugin({
        template: 'tests/integration/test_harness.html',
        filename: 'test_harness.html',
        inlineSource: '.(js|css)$', // embed all javascript and css inline
      }),
      new HtmlWebpackInlineSourcePlugin(),
    ],
    output: {
      filename: 'test_harness_bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  }
];