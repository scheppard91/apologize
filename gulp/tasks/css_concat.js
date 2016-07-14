/**
 * Created by julienbouysset on 18/11/15.
 */

var gulp      = require('gulp');
var fs        = require("fs");
var concatCss = require('gulp-concat-css');
var merge     = require('gulp-merge');

//concat css
gulp.task('css_concat', function() {
    var stream = [];

    //main
    var stream1 = gulp.src("./app/Resources/css/cache/*.css")
        .pipe(concatCss("main.css"))
        .pipe(gulp.dest("./app/Resources/css/cache"));

    //////////////////////////////////////////////////////////////////////////////////
    var bundle = fs.readdirSync('./src/AP');
    var stream2 = bundle.forEach(function(name){
        gulp.src("./src/AP/"+name+"/Resources/css/cache/*.css")
            .pipe(concatCss("bundle.css"))
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/css/cache/"));
        console.log("css_concat");
    });

    //////////////////////////////////////////////////////////////////////////////////

    //index
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
        console.log("css_concat");
    }
    console.log("==========>" + pages);

    for (var i = 0; i < pages.length; i++) {
        stream[i] = gulp.src("./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]+"/*.css")
            .pipe(concatCss("page.css"))
            .pipe(gulp.dest("./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]+"/"));
        console.log("css_concat");
    }

    return merge(stream1,stream2,stream);
});