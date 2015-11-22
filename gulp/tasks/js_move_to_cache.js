/**
 * Created by julienbouysset on 21/11/15.
 */

var gulp   = require('gulp');
var concat = require('gulp-concat');
var merge  = require('gulp-merge');
var config = require('../config.json');

gulp.task('js_move_to_cache', function() {

    var stream1 = gulp.src('./app/Resources/js/source/*.js')
        .pipe(gulp.dest('./app/Resources/js/cache/'));

    var stream2 = config.bundles.forEach(function(name){
        gulp.src("./src/AP/"+name+"/Resources/js/source/*.js")
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/js/cache/"));
    });
    return merge(stream1,stream2);
});
