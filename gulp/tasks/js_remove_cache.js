/**
 * Created by julienbouysset on 20/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var del    = require('del');

// remove cache dir
gulp.task('js_remove_cache', function() {

    // remove global js cache
    del([
        "./app/Resources/js/cache/"
    ]);

    // remove bundle js cache
    config.bundles.forEach(function(name){
        del([
            "./src/AP/"+name+"/Resources/js/cache/"
        ]);
    });

    // remove page js cache
    config.page.forEach(function(page){
        del([
            "./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/cache/"
        ]);
    });
});