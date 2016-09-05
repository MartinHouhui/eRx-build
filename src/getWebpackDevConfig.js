import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import getBabelCommonConfig from './getBabelCommonConfig';
import getTSCommonConfig from './getTSCommonConfig';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import rucksack from 'rucksack-css';
import autoprefixer from 'autoprefixer';

export default function getWebpackCommonConfig(args) {
  const pkgPath = join(args.cwd, 'package.json');
  const pkg = existsSync(pkgPath) ? require(pkgPath) : {};

  const jsFileName = '[name].js';
  const cssFileName = '[name].css';
  const commonName = 'common.js';

  const babelQuery = getBabelCommonConfig();
  const tsQuery = getTSCommonConfig();
  tsQuery.declaration = false;

  let theme = {};
  if (pkg.theme && typeof (pkg.theme) === 'string') {
    let cfgPath = pkg.theme;
    // relative path
    if (cfgPath.charAt(0) === '.') {
      cfgPath = resolve(args.cwd, cfgPath);
    }
    const getThemeConfig = require(cfgPath);
    theme = getThemeConfig();
  } else if (pkg.theme && typeof (pkg.theme) === 'object') {
    theme = pkg.theme;
  }

  const emptyBuildins = [
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'fs',
    'module',
    'net',
    'readline',
    'repl',
    'tls',
  ];

  let prot = args.prot || 8080;
  return {

    babel: babelQuery,
    ts: {
      transpileOnly: true,
      compilerOptions: tsQuery,
    },

    output: {
      path: join(args.cwd, './dist/'),
      filename: jsFileName,
      publicPath: `http://localhost:${prot}/`
    },

    devtool: args.devtool,

    resolve: {
      modulesDirectories: ['node_modules', join(__dirname, '../node_modules')],
      extensions: ['', '.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    resolveLoader: {
      modulesDirectories: ['node_modules', join(__dirname, '../node_modules')],
    },

    entry: pkg.entry,

    module: {
      noParse: [/moment.js/],
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['react-hot', 'babel']
        },
        {
          test: /\.jsx$/,
          loaders: ['react-hot', 'babel']
        },
        {
          test: /\.tsx?$/,
          loaders: ['babel', 'ts'],
        },
        {
          test(filePath) {
            return /\.css$/.test(filePath) && !/\.module\.css$/.test(filePath);
          },
          loader: ExtractTextPlugin.extract(
            'css?sourceMap&-restructuring!' +
            'postcss'
          ),
        },
        {
          test: /\.module\.css$/,
          loader: ExtractTextPlugin.extract(
            'css?sourceMap&-restructuring&modules&localIdentName=[local]___[hash:base64:5]!' +
            'postcss'
          ),
        },
        {
          test(filePath) {
            return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
          },
          loader: ExtractTextPlugin.extract(
            'css?sourceMap!' +
            'postcss!' +
            `less-loader?{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
          ),
        },
        {
          test: /\.module\.less$/,
          loader: ExtractTextPlugin.extract(
            'css?sourceMap&modules&localIdentName=[local]___[hash:base64:5]!!' +
            'postcss!' +
            `less-loader?{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
          ),
        },
        { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
        { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/octet-stream' },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=image/svg+xml' },
        { test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i, loader: 'url?limit=10000' },
        { test: /\.json$/, loader: 'json' }
      ],
    },

    postcss: [
      rucksack(),
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
      }),
    ],

    plugins: [
      new webpack.optimize.CommonsChunkPlugin('common', commonName),
      new ExtractTextPlugin(cssFileName, {
        disable: false,
        allChunks: true,
      }),
      new webpack.optimize.OccurenceOrderPlugin(),
    ],
  };
}
