/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp      = require('gulp');
var fs        = require("fs");
var minifyCss = require('gulp-minify-css');
var merge     = require('gulp-merge');

gulp.task('css_compress', function() {
    var stream = [];
    var pages = fs.readdirSync('./web/resources');

    for (var i = 0; i < pages.length; i++) {
        if(pages[i] == "img" || pages[i] == "fonts") {
            pages.splice(i, 1);i--;
        }
    }
    
    for (var i = 0; i < pages.length; i++) {
        stream[i] = gulp.src("./web/resources/"+pages[i]+"/cache/*.css")
            //.pipe(minifyCss())
            .pipe(gulp.dest("./web/resources/"+pages[i]+"/"))
        console.log('css_compress');
    }
    
    return merge(stream);
});