/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var del    = require('del');
var fs     = require("fs");
var merge  = require('gulp-merge');


// remove cache dir
gulp.task('css_remove_cache', function() {

    // remove global css cache
    del([
        "./app/Resources/css/cache/"
    ]);
    
    // remove bundle css cache
    var bundle = fs.readdirSync('./src/AP');
    bundle.forEach(function(name){
        del([
            "./src/AP/"+name+"/Resources/css/cache/"
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