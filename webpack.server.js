const path = require("path");
const webpackNodeExternals = require("webpack-node-externals");

module.exports = {
    target: 'node',
    entry: './src/server.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    externals: [webpackNodeExternals()],
};
