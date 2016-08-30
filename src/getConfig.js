import { join, resolve } from 'path';
import mergeCustomConfig from './mergeCustomConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';
import webpack from 'webpack';

export default function getWebpackConfig(args) {
    let webpackConfig = getWebpackCommonConfig(args);
    webpackConfig.plugins = webpackConfig.plugins || [];

    // Config outputPath.
    if (args.outputPath) {
        webpackConfig.output.path = args.outputPath;
    }

    if (args.publicPath) {
        webpackConfig.output.publicPath = args.publicPath;
    }

    // Config if no --no-compress.
    if (args.compress) {
        webpackConfig.UglifyJsPluginConfig = {
            output: {
                ascii_only: true,
            },
            compress: {
                warnings: false,
            },
        };
        webpackConfig.plugins = [...webpackConfig.plugins,
            new webpack.optimize.UglifyJsPlugin(webpackConfig.UglifyJsPluginConfig),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
            }),
        ];
    } else {
        if (process.env.NODE_ENV) {
            webpackConfig.plugins = [...webpackConfig.plugins,
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                }),
            ];
        }
    }

    webpackConfig.plugins = [...webpackConfig.plugins,
        new webpack.optimize.DedupePlugin(),
        new webpack.NoErrorsPlugin(),
    ];

    // Output map.json if hash.
    if (args.hash) {
        const pkg = require(join(args.cwd, 'package.json'));
        webpackConfig.output.filename = webpackConfig.output.chunkFilename = '[name]-[chunkhash].js';
        webpackConfig.plugins = [...webpackConfig.plugins,
            require('map-json-webpack-plugin')({
                assetsPath: pkg.name,
            }),
        ];
    }

    webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));
    return webpackConfig;
}