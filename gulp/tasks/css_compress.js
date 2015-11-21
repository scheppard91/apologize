/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp      = require('gulp');
var minifyCss = require('gulp-minify-css');

gulp.task('css_compress', function() {

    return gulp.src("./web/css/cache/*.css")
        .pipe(minifyCss())
        .pipe(gulp.dest("./web/css/"))
});