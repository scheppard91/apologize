/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp      = require('gulp');
var fs        = require("fs");
var concatCss = require('gulp-concat-css');
var merge     = require('merge-stream');
var vm        = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

//concat css
gulp.task('css_concat_to_web_cache', function() {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);

    //concat all page to web cache
    pages.forEach(function(page){
        if( fs.existsSync("../src/"+page[0]+"/Resources/css/cache/bundle.css") &&
            fs.existsSync("../src/"+page[0]+"/Resources/css/cache/"+page[1]+"/page.css")) {
            stream.push(gulp.src(["../app/Resources/css/cache/main.css",
                "../src/"+page[0]+"/Resources/css/cache/bundle.css",
                "../src/"+page[0]+"/Resources/css/cache/"+page[1]+"/page.css"]
            )
                .pipe(concatCss(""+page[1]+".css",{rebaseUrls:false}))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));

        } else if(fs.existsSync("../src/"+page[0]+"/Resources/css/cache/bundle.css")){
            stream.push(gulp.src(["../app/Resources/css/cache/main.css",
                "../src/"+page[0]+"/Resources/css/cache/bundle.css"]
            )
                .pipe(concatCss(""+page[1]+".css",{rebaseUrls:false}))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));

        } else if(fs.existsSync("../src/"+page[0]+"/Resources/css/cache/"+page[1]+"/page.css")){
            stream.push(gulp.src(["../app/Resources/css/cache/main.css",
                "../src/"+page[0]+"/Resources/css/cache/"+page[1]+"/page.css"]
            )
                .pipe(concatCss(""+page[1]+".css",{rebaseUrls:false}))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));
        } else {
            stream.push(gulp.src("../app/Resources/css/cache/main.css")
                .pipe(concatCss(""+page[1]+".css",{rebaseUrls:false}))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));
        }
    });

    //merge all stream
    return merge(stream);

});