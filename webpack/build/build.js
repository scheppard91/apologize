require('shelljs/global') // Need for use shell command in JS
var ora = require('ora') // Terminal spinner
var webpack = require('webpack') // Webpack
var config = require('./webpack.conf') // Loading config file

var spinner = ora('building...')
spinner.start()
rm('-rf', config.output.path) //suppression last build

webpack(config, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n')
})
