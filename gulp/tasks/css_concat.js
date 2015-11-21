/**
 * Created by julienbouysset on 18/11/15.
 */

var gulp      = require('gulp');
var config    = require('../config.json');
var fs        = require("fs");
var concatCss = require('gulp-concat-css');
var merge     = require('gulp-merge');

//concat css
gulp.task('css_concat', function() {

    //main
    var stream1 = gulp.src("./app/Resources/css/cache/*.css")
        .pipe(concatCss("main.css"))
        .pipe(gulp.dest("./app/Resources/css/"));

    //////////////////////////////////////////////////////////////////////////////////

    var stream2 = config.bundles.forEach(function(name){
        gulp.src("./src/AP/"+name+"/Resources/css/cache/*.css")
            .pipe(concatCss("bundle.css"))
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/css/"));
    });

    //////////////////////////////////////////////////////////////////////////////////

    var stream3 = config.page.forEach(function(page){
        gulp.src("./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/cache/*.css")
            .pipe(concatCss("page.css"))
            .pipe(gulp.dest("./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/"));
    });

    return merge(stream1,stream2,stream3);
});