/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var fs     = require("fs");
var concat = require('gulp-concat');
var merge  = require('gulp-merge');

//concat js
gulp.task('js_concat', function() {
    var stream = [];

    //main
    var stream1 = gulp.src("./app/Resources/js/cache/*.js")
        .pipe(concat("main.js"))
        .pipe(gulp.dest("./app/Resources/js/cache"));

    //////////////////////////////////////////////////////////////////////////////////
    var bundle = fs.readdirSync('./src/AP');
    var stream2 = bundle.forEach(function(name){
        gulp.src("./src/AP/"+name+"/Resources/js/cache/*.js")
            .pipe(concat("bundle.js"))
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/js/cache/"));
        console.log("js_concat");
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
    console.log(" =================>>>>>>>>>>>>>>>>>>>>>>>>>>>><> " +pages);

    for (var i = 0; i < pages.length; i++) {
        stream[i] = gulp.src("./src/AP/"+pages[i][0]+"/Resources/js/cache/"+pages[i][1]+"/*.js")
            .pipe(concat("page.js"))
            .pipe(gulp.dest("./src/AP/"+pages[i][0]+"/Resources/js/cache/"+pages[i][1]+"/"));
        console.log("js_concat");
    }
    
    return merge(stream1,stream2,stream);
});
