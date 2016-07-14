/**
 * Created by julienbouysset on 20/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var del    = require('del');
var fs     = require("fs");
var merge  = require('gulp-merge');

// remove cache dir
gulp.task('js_remove_cache', function() {

    // remove global js cache
    del([
        "./app/Resources/js/cache/"
    ]);

    // remove bundle js cache
    var bundle = fs.readdirSync('./src/AP');
    bundle.forEach(function(name){
        del([
            "./src/AP/"+name+"/Resources/js/cache/"
        ]);
    });

    // remove web cache
    var pages = fs.readdirSync('./web/resources');
    for (var i = 0; i < pages.length; i++) {
        if(pages[i] == "img" || pages[i] == "fonts") {
            pages.splice(i, 1);i--;
        }
    }

    pages.forEach(function(test){
        del([
            "./web/resources/"+test+"/cache/"
        ]);
        console.log(fs.readdirSync("./web/resources/"+test+"/cache/"))
    });
});
