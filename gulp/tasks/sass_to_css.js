/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var merge  = require('gulp-merge');
var sass   = require('gulp-ruby-sass');


// convert scss to css
gulp.task('sass_to_css', function () {

    //main
    var stream1 = sass('./app/Resources/scss/*.scss')
        .pipe(gulp.dest('./app/Resources/css/cache/'));

    //bundle IndexBundle
    var stream2 = config.bundles.forEach(function(name){
        sass("./src/AP/"+name+"/Resources/scss/*.scss")
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/css/cache/"))
    });

    //index
    var stream3 = config.page.forEach(function(page){
        sass("./src/AP/"+page.bundleName+"/Resources/scss/"+page.name+"/*.scss")
            .pipe(gulp.dest("./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/cache/"));
    });

    return merge(stream1,stream2,stream3);
});