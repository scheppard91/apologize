/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp   = require('gulp');
var fs     = require("fs");
var concat = require('gulp-concat');
var merge  = require('gulp-merge');

//concat js
gulp.task('js_concat_to_web_cache', function() {

    var stream = [];
    var bundle = fs.readdirSync('./src/AP');
    var pages = [];
    for (var i = 0; i < bundle.length; i++) {
        var bundlePage = fs.readdirSync('./src/AP/' + bundle[i] + '/Resources/views/');
        for (var y=0;y<bundlePage.length;y++)
        {
            if(bundlePage[y].lastIndexOf(".twig")!=-1)
            {
                bundlePage.splice(y, 1);y--;
            }
        }
        for (var y = 0; y < bundlePage.length; y++) {
            bundlePage[y] = [bundle[i],bundlePage[y]];
        }
        pages = pages.concat(bundlePage)
        console.log('js_concat_to_web_cache')
    }

    for (var i = 0; i < pages.length; i++) {
        if( fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/js/cache/bundle.js") &&
            fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/js/cache/"+pages[i][1]+"/page.js")) {
            stream[i] = gulp.src(["./app/Resources/js/cache/main.js",
                    "./src/AP/"+pages[i][0]+"/Resources/js/cache/bundle.js",
                    "./src/AP/"+pages[i][0]+"/Resources/js/cache/"+pages[i][1]+"/page.js"]
                )
                .pipe(concat(""+pages[i][1]+".js"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));

        } else if(fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/js/cache/bundle.js")){
            stream[i] = gulp.src(["./app/Resources/js/cache/main.js",
                    "./src/AP/"+pages[i][0]+"/Resources/js/cache/bundle.js"])
                .pipe(concat(""+pages[i][1]+".js"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));

        } else if(fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/js/cache/"+pages[i][1]+"/page.js")){
            stream[i] = gulp.src(["./app/Resources/js/cache/main.js",
                    "./src/AP/"+pages[i][0]+"/Resources/js/cache/"+pages[i][1]+"/page.js"])
                .pipe(concat(""+pages[i][1]+".js"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));

        } else {
            stream[i] = gulp.src("./app/Resources/js/cache/main.js")
                .pipe(concat(""+pages[i][1]+".js"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));
        }
    }
    return merge(stream);
});