import { join, resolve } from 'path';
import mergeCustomConfig from './mergeCustomConfig';
import getWebpackDevConfig from './getWebpackDevConfig';
import webpack from 'webpack';

export default function getWebpackConfig(args) {
    let webpackConfig = getWebpackDevConfig(args);
    webpackConfig.plugins = webpackConfig.plugins || [];


    webpackConfig.plugins = [...webpackConfig.plugins,
        new webpack.optimize.DedupePlugin(),
        new webpack.NoErrorsPlugin(),
    ];


    webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));
    return webpackConfig;
}