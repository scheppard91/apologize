/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var fs     = require("fs");
var concat = require('gulp-concat');

//concat js
gulp.task('js_concat_to_web_cache', function() {

    return config.page.forEach(function(page){
        if( fs.existsSync("./src/AP/"+page.bundleName+"/Resources/js/bundle.js") &&
            fs.existsSync("./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/page.js")) {
            gulp.src("./app/Resources/js/main.js",
                    "./src/AP/"+page.bundleName+"/Resources/js/bundle.js",
                    "./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/page.js"
                )
                .pipe(concat(""+page.name+".js"))
                .pipe(gulp.dest("./web/js/cache/"));

        } else if(fs.existsSync("./src/AP/"+page.bundleName+"/Resources/js/bundle.js")){
            gulp.src("./app/Resources/js/main.js",
                    "./src/AP/"+page.bundleName+"/Resources/js/bundle.js"
                )
                .pipe(concat(""+page.name+".js"))
                .pipe(gulp.dest("./web/js/cache/"));

        } else if(fs.existsSync("./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/page.js")){
            gulp.src("./app/Resources/js/main.js",
                    "./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/page.js"
                )
                .pipe(concat(""+page.name+".js"))
                .pipe(gulp.dest("./web/js/cache/"));

        } else {
            gulp.src("./app/Resources/js/main.js")
                .pipe(concat(""+page.name+".js"))
                .pipe(gulp.dest("./web/js/cache/"));
        }
    });
});