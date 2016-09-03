/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp      = require('gulp');
var fs        = require("fs");
var minifyCss = require('gulp-minify-css');
var merge     = require('merge-stream');
var vm        = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

// compress css
gulp.task('css_compress', function() {

    // stream for procedural execution
    var stream = [];

    // list of ressource bundles
    var pagesBundle = getRessourceBundleList();

    //compress css for all bundle
    pagesBundle.forEach(function(pageBundle){

        //return ressource page
        var pages = getRessourcePageList(pageBundle);

        // compress css
        pages.forEach(function(page){
            stream.push(gulp.src("../web/bundles/"+pageBundle+"/"+page+"/cache/*.css")
            //  .pipe(minifyCss())
                .pipe(gulp.dest("../web/bundles/"+pageBundle+"/"+page+"/")));
        })
    });

    //merge all stream
    return merge(stream);
});