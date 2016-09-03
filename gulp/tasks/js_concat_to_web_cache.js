/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp   = require('gulp');
var fs     = require("fs");
var concat = require('gulp-concat');
var merge  = require('merge-stream');
var vm    = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

//concat js
gulp.task('js_concat_to_web_cache', function() {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);

    //concat all page to web cache
    pages.forEach(function(page){
        if( fs.existsSync("../src/"+page[0]+"/Resources/js/cache/bundle.js") &&
            fs.existsSync("../src/"+page[0]+"/Resources/js/cache/"+page[1]+"/page.js")) {
            stream.push(gulp.src(["../app/Resources/js/cache/main.js",
                    "../src/"+page[0]+"/Resources/js/cache/bundle.js",
                    "../src/"+page[0]+"/Resources/js/cache/"+page[1]+"/page.js"]
                )
                .pipe(concat(""+page[1]+".js"))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));

        } else if(fs.existsSync("../src/"+page[0]+"/Resources/js/cache/bundle.js")){
            stream.push(gulp.src(["../app/Resources/js/cache/main.js",
                    "../src/"+page[0]+"/Resources/js/cache/bundle.js"])
                .pipe(concat(""+page[1]+".js"))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));

        } else if(fs.existsSync("../src/"+page[0]+"/Resources/js/cache/"+page[1]+"/page.js")){
            stream.push(gulp.src(["../app/Resources/js/cache/main.js",
                    "../src/"+page[0]+"/Resources/js/cache/"+page[1]+"/page.js"])
                .pipe(concat(""+page[1]+".js"))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));

        } else {
            stream.push(gulp.src("../app/Resources/js/cache/main.js")
                .pipe(concat(""+page[1]+".js"))
                .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/cache/")));
        }
    });

    //merge all stream
    return merge(stream);
});