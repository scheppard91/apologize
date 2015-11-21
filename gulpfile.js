/**
 * Created by julienbouysset on 09/11/15.
 */

var gulp        = require('gulp');
var requireDir  = require('require-dir');
var runSequence = require('run-sequence');

var dir         = requireDir('./gulp/tasks/');

gulp.task("default", function () {

    runSequence(
        'sass_to_css',
        /*'css_move_to_cache',*/
        'css_concat',
        'css_concat_to_web_cache',
        'css_compress',
        'css_remove_cache',

        /*'coffee_to_js',*/
        'js_move_to_cache',
        'js_concat',
        'js_concat_to_web_cache',
        'js_compress',
        'js_remove_cache'
    );
});

gulp.task("clear", function () {

    runSequence(
        'css_remove_old_files',
        'js_remove_old_files'
    );
});