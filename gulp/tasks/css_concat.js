/**
 * Created by julienbouysset on 18/11/15.
 */

var gulp      = require('gulp');
var fs        = require("fs");
var concatCss = require('gulp-concat-css');
var merge     = require('merge-stream');
var vm        = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

//concat css
gulp.task('css_concat', function() {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);

    //concat main css
    stream.push(gulp.src("../app/Resources/css/cache/*.css")
        .pipe(concatCss("main.css",{rebaseUrls:false}))
        .pipe(gulp.dest("../app/Resources/css/cache")));

    //concat bundle css
    bundle.forEach(function(name){
        stream.push(gulp.src("../src/"+name+"/Resources/css/cache/*.css")
            .pipe(concatCss("bundle.css",{rebaseUrls:false}))
            .pipe(gulp.dest("../src/"+name+"/Resources/css/cache/")));
    });

    //concat page css
    pages.forEach(function(page){
        stream.push(gulp.src("../src/"+page[0]+"/Resources/css/cache/"+page[1]+"/*.css")
            .pipe(concatCss("page.css",{rebaseUrls:false}))
            .pipe(gulp.dest("../src/"+page[0]+"/Resources/css/cache/"+page[1]+"/")));
    });

    return merge(stream);
});