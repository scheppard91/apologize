/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp   = require('gulp');
var concat = require('gulp-concat');

gulp.task('js_move_to_cache', function() {

    return gulp.src('./app/Resources/js/source/*.js')
        .pipe(gulp.dest('./app/Resources/js/cache/'));
});
