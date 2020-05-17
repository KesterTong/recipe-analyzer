const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const SHARED_CONFIG = {
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
  plugins: [
    new HtmlWebpackPlugin({
      template: 'apps_script/sidebar.html',
      filename: 'sidebar.html',
      inlineSource: '.(js|css)$', // embed all javascript and css inline
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
};

// NOTE: webpack-dev-server seems to only use the
// devServer field of the first exported module in the
// list, so we put this first.
module.exports = [
  {
    ...SHARED_CONFIG,
    mode: 'development',
    entry: './tests/fake_sidebar.tsx',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'test_ui'),
    },
    optimization: {
      minimize: false
    },
    devServer: {
      contentBase: './test_ui',
    },
  },
  {
    ...SHARED_CONFIG,
    mode: 'production',
    entry: './apps_script/sidebar.tsx',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'ui'),
    },
  },
];