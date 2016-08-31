import { resolve } from 'path';
import { existsSync } from 'fs';
import webpack from 'webpack';
import chalk from 'chalk';
import getConfig from './getDevConfig';
import webpackDevServer from 'webpack-dev-server';
import openBrowserWebpackPlugin from 'open-browser-webpack-plugin';

export default function start(args, callback) {


    let proxy = {};
    const proxyConfig = args.proxyConfig || 'proxy.config.js';
    let proxyConfigPath = resolve(args.cwd, proxyConfig);
    if (existsSync(proxyConfigPath)) {
        proxy = require(proxyConfigPath);
    }

    let prot = args.prot || 8080;

    let webpackConfig = getDevConfig(args);
    var compiler = webpack(webpackConfig);
    var server = new webpackDevServer(compiler, {
        hot: true,
        contentBase: './dist/',
        publicPath: './',
        proxy
    });
    server.listen(prot);
}

function getDevConfig(args) {

    let webpackConfig = getConfig(args);
    let entry = args.entry || 'index';
    let prot = args.prot || '8080';
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.plugins.push(new openBrowserWebpackPlugin({ url: `http://localhost:${prot}/` }));

    let devStart = webpackConfig.entry[entry];
    if (typeof devStart === 'string') {
        webpackConfig.entry[entry] = [
            `webpack-dev-server/client?http://localhost:${prot}/`,
            "webpack/hot/dev-server",
            devStart
        ]
    } else if (typeof devStart === 'array') {
        devStart.unshift(`webpack-dev-server/client?http://localhost:${prot}/`, "webpack/hot/dev-server");
        webpackConfig.entry[entry] = devStart;
    }
    return webpackConfig;
}
