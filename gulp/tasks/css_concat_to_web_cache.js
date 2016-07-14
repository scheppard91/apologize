/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp      = require('gulp');
var fs        = require("fs");
var concatCss = require('gulp-concat-css');
var merge     = require('gulp-merge');

//concat css
gulp.task('css_concat_to_web_cache', function() {
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
        console.log('css_concat_to_web_cache')
    }

    for (var i = 0; i < pages.length; i++) {
        if( fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/css/cache/bundle.css") &&
            fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]+"/page.css")) {
            stream[i] = gulp.src(["./app/Resources/css/cache/main.css",
                "./src/AP/"+pages[i][0]+"/Resources/css/cache/bundle.css",
                "./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]+"/page.css"]
            )
                .pipe(concatCss(""+pages[i][1]+".css"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));

        } else if(fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/css/cache/bundle.css")){
            stream[i] = gulp.src(["./app/Resources/css/cache/main.css",
                "./src/AP/"+pages[i][0]+"/Resources/css/cache/bundle.css"]
            )
                .pipe(concatCss(""+pages[i][1]+".css"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));

        } else if(fs.existsSync("./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]+"/page.css")){
            stream[i] = gulp.src(["./app/Resources/css/cache/main.css",
                "./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]+"/page.css"]
            )
                .pipe(concatCss(""+pages[i][1]+".css"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));
            console.log("message")
        } else {
            stream[i] = gulp.src("./app/Resources/css/cache/main.css")
                .pipe(concatCss(""+pages[i][1]+".css"))
                .pipe(gulp.dest("./web/resources/"+pages[i][1]+"/cache/"));
        }
    }
    
    return merge(stream);

});