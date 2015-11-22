/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp      = require('gulp');
var config    = require('../config.json');
var fs        = require("fs");
var concatCss = require('gulp-concat-css');

//concat css
gulp.task('css_concat_to_web_cache', function() {

    return config.page.forEach(function(page){
        if( fs.existsSync("./src/AP/"+page.bundleName+"/Resources/css/bundle.css") &&
            fs.existsSync("./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/page.css")) {
            gulp.src(["./app/Resources/css/main.css",
                    "./src/AP/"+page.bundleName+"/Resources/css/bundle.css",
                    "./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/page.css"]
                )
                .pipe(concatCss(""+page.name+".css"))
                .pipe(gulp.dest("./web/css/cache/"));

        } else if(fs.existsSync("./src/AP/"+page.bundleName+"/Resources/css/bundle.css")){
            gulp.src(["./app/Resources/css/main.css",
                    "./src/AP/"+page.bundleName+"/Resources/css/bundle.css"]
                )
                .pipe(concatCss(""+page.name+".css"))
                .pipe(gulp.dest("./web/css/cache/"));

        } else if(fs.existsSync("./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/page.css")){
            gulp.src(["./app/Resources/css/main.css",
                    "./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/page.css"]
                )
                .pipe(concatCss(""+page.name+".css"))
                .pipe(gulp.dest("./web/css/cache/"));

        } else {
            gulp.src("./app/Resources/css/main.css")
                .pipe(concatCss(""+page.name+".css"))
                .pipe(gulp.dest("./web/css/cache/"));
        }
    });
});