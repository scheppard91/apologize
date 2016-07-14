var path             = require('path')
var root             = path.resolve(__dirname, '../')
var autoprefixer     = require('autoprefixer')
var conf             = require('./config')
var webpack           = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var extractSASS = new ExtractTextPlugin("[name]/[name].css")
var WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
    entry: conf.entry,
    output: conf.output,
    resolve: {
        //extensions: ['', '.js', '.vue', '.coffee', '.css', '.scss'],
        //fallback: [path.join(__dirname, '../node_modules')]
    },
    module: {
        /*preLoaders: [
            {
                test: /\.js$/,
                loader: 'eslint',
                exclude: /(node_modules|libs)/
            }
        ],*/
        loaders: [
            {
                test: /\.scss$/,
                loader: extractSASS.extract(['css', 'postcss', 'sass'])
            },
            {
                test: /\.css$/,
                loader: extractSASS.extract(['css', 'postcss'])
            },
            {
                test: /\.coffee$/,
                loader: 'coffee',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel',
                //include: root,
                //exclude: /node_modules|libs/,
            },
            {
                test: /\.(svg|woff2?|eot|ttf)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: '../fonts/[name].[ext]'
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: 'img/[name].[ext]'
                }
            }
        ]
    },
    plugins: [
        extractSASS,
        /*new webpack.optimize.UglifyJsPlugin({
            comments: false,
            compress: {
                warnings: false,
            }
        }),
        new webpack.optimize.OccurenceOrderPlugin(),*/
        new WebpackShellPlugin({
            onBuildEnd: ['node ./webpack/build/endBuild.js && mv ./web/fonts ./web/resources/fonts']
        })
    ],
    /*eslint: {
        configFile: path.resolve(root, './.eslintrc'),
        formatter: require('eslint-friendly-formatter')
    },
    postcss: function () {
        return [autoprefixer({browsers: conf.support})];
    }*/
}