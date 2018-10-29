const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const packageConfig = require('./package.json')

const APP_VER  = packageConfig.version;
const DIR_ROOT =  __dirname;
const DIR_SRC  =  path.resolve(DIR_ROOT, 'src'); 
const DIR_DIST =  path.resolve(DIR_ROOT, 'dist');

const isDev = process.env.NODE_ENV === 'development';
const isPro = process.env.NODE_ENV === 'production';

const sourceMap = true;
const gZip = true;

const config = {
  entry: {
    fui: path.resolve(DIR_SRC, 'core','index.js'),
    app: path.resolve(DIR_SRC, 'app.js'),
  },
  output: { 
    path: DIR_DIST,  
    filename: `[name].[hash].js?v=${APP_VER}`, 
    libraryTarget: 'umd',
    umdNamedDefine: true,
    publicPath: ''
  },
  resolve: {
    extensions: ['.js', '.tag', '.json', '.css', '.less'],
    alias: {
      '@' : DIR_SRC,
      '@dom': path.resolve(DIR_SRC, 'core','dom'),
      '@helper': path.resolve(DIR_SRC, 'core','helper')
    }
  },
  module: {
    rules: [
      {
        test: /\.fui$/,
        loader: 'fui-loader',
        query: {
          type: 'es6'
        }
      },
      {
        test: /\.(css|less)(\?.*)?$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[hash].[ext]'
        }
      }
    ]
  },
  plugins:[
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(DIR_SRC, 'index.html'),
      inject: true,
      env:process.env.NODE_ENV
    }),
    new ExtractTextPlugin({
      filename: `[name].[hash].css?${APP_VER}`
    })
  ],
  resolveLoader: {
    alias: {
      'fui-loader': path.resolve(DIR_SRC, 'loader')
    }
  }
}

if (isDev) {
  config.devtool = '#cheap-module-eval-source-map'
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new webpack.HotModuleReplacementPlugin()
  ])
  config.devServer = {
    inline:true,
    contentBase: DIR_DIST,
    port:8888,
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  }
}

if (isPro) {
  config.devtool = sourceMap ? '#source-map' : false
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin(['dist'])

  ])
  if (gZip) {
    const compression = new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js(\?.*)?$/i,
      threshold: 10240,
      minRatio: 0.8
    })
    config.plugins.push(compression)
  }  
}

module.exports = config
