/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp   = require('gulp');
var fs     = require("fs");
var concat = require('gulp-concat');
var merge  = require('merge-stream');
var vm     = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

//concat js
gulp.task('js_concat', function() {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);

    //concat main js
    stream.push(gulp.src("../app/Resources/js/cache/*.js")
        .pipe(concat("main.js"))
        .pipe(gulp.dest("../app/Resources/js/cache")));

    //concat bundle js
    bundle.forEach(function(name){
        stream.push(gulp.src("../src/"+name+"/Resources/js/cache/*.js")
            .pipe(concat("bundle.js"))
            .pipe(gulp.dest("../src/"+name+"/Resources/js/cache/")));
    });

    //concat page js
    pages.forEach(function(page){
        stream.push(gulp.src("../src/"+page[0]+"/Resources/js/cache/"+page[1]+"/*.js")
            .pipe(concat("page.js"))
            .pipe(gulp.dest("../src/"+page[0]+"/Resources/js/cache/"+page[1]+"/")));
    });

    //merge all stream
    return merge(stream);
});
