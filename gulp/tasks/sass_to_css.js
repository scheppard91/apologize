/**
 * Created by julienbouysset on 19/11/15.
 */
var gulp  = require('gulp');
var merge = require('merge-stream');
var sass  = require('gulp-sass');
var fs    = require('fs');
var vm    = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

// convert scss to css
gulp.task('sass_to_css', function () {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);
    
    //convert main scss to css in cache
    stream.push(gulp.src('../app/Resources/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('../app/Resources/css/cache/')));

    //convert bundle scss to css in cache
    bundle.forEach(function(name){
        stream.push(gulp.src("../src/"+name+"/Resources/scss/*.scss")
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest("../src/"+name+"/Resources/css/cache/")))
    });

    //convert pages scss to css in cache
    pages.forEach(function(page){
        stream.push(gulp.src("../src/"+page[0]+"/Resources/scss/"+page[1]+"/*.scss")
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest("../src/"+page[0]+"/Resources/css/cache/"+page[1])));
    });

    //merge all stream
    return merge(stream);
});