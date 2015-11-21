/**
 * Created by julienbouysset on 20/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var del    = require('del');

// remove old files
gulp.task('css_remove_old_files', function() {

    return del([
        "./web/css/*"
    ]);
});