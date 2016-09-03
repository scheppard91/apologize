/**
 * Created by julienbouysset on 20/11/15.
 */

var gulp      = require('gulp');
var fs        = require("fs");
var uglify    = require('gulp-uglifyjs');
var merge     = require('merge-stream');
var vm        = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

// compress js
gulp.task('js_compress', function() {

    // stream for procedural execution
    var stream = [];

    // list of ressource bundles
    var pagesBundle = getRessourceBundleList();

    //compress css for all bundle
    pagesBundle.forEach(function(pageBundle){

        //return ressource page
        var pages = getRessourcePageList(pageBundle);

        // compress js
        pages.forEach(function(page){
            stream.push(gulp.src("../web/bundles/"+pageBundle+"/"+page+"/cache/*.js")
            //  .pipe(uglify())
                .pipe(gulp.dest("../web/bundles/"+pageBundle+"/"+page+"/")));
        })
    });

    //merge all stream
    return merge(stream);
});

/*
 gulp.task('css_compress', function() {
 var x = 0
 var stream = [];
 var pagesBundle = fs.readdirSync('../web/bundles/');
 for (var i = 0; i < pagesBundle.length; i++) {
 if(pagesBundle[i] == "framework" || pagesBundle[i] == "images") {
 pagesBundle.splice(i, 1);i--;
 }
 }
 console.log(pagesBundle);

 for (var i = 0; i < pagesBundle.length; i++) {
 var pages = fs.readdirSync('../web/bundles/'+ pagesBundle[i]);
 console.log(pages)
 for (var y = 0; y < pages.length; y++) {
 if(pages[y] == "images") {
 pages.splice(y, 1);y--;
 }
 }

 for (var y = 0; y < pages.length; y++) {
 stream[x] = gulp.src("../web/bundles/"+pagesBundle[i]+"/"+pages[y]+"/cache/*.css")
 //.pipe(minifyCss())
 .pipe(gulp.dest("../web/bundles/"+pagesBundle[i]+"/"+pages[y]+"/"))
 x++
 }
 }
 return merge(stream);
 });
 */