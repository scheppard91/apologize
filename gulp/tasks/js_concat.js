/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var fs     = require("fs");
var concat = require('gulp-concat');
var merge  = require('gulp-merge');

//concat js
gulp.task('js_concat', function() {

    var stream1 = gulp.src('./app/Resources/js/cache/*.js')
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./app/Resources/js/'));

    //////////////////////////////////////////////////////////////////////////////////

    var stream2 = config.bundles.forEach(function(name){
        gulp.src("./src/AP/"+name+"/Resources/js/cache/*.js")
            .pipe(concat("bundle.js"))
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/js/"));
    });

    //////////////////////////////////////////////////////////////////////////////////


    var stream3 = config.page.forEach(function(page){
        gulp.src("./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/cache/*.js")
            .pipe(concat("page.js"))
            .pipe(gulp.dest("./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/"));
    });

    return merge(stream1,stream2,stream3);
});