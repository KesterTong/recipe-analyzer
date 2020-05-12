const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

function config(mode, entry, output) {
  return {
    mode: mode,
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
    entry: entry,
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, output),
    },
    externals: {
      "react": "React",
      "redux": "Redux",
      "react-redux": "ReactRedux",
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
}

module.exports = [
  config('production', './apps_script/sidebar.tsx', 'ui'),
  config('development', './tests/fake_sidebar.tsx', 'test_ui'),
]