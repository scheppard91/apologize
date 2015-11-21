/**
 * Created by julienbouysset on 20/11/15.
 */

var gulp   = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('js_compress', function() {

    return gulp.src("./web/js/cache/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("./web/js/"))
});