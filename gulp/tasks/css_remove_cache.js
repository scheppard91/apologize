/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var del    = require('del');

// remove cache dir
gulp.task('css_remove_cache', function() {

    // remove global css cache
    del([
        "./app/Resources/css/cache/"
    ]);

    // remove bundle css cache
    config.bundles.forEach(function(name){
        del([
            "./src/AP/"+name+"/Resources/css/cache/"
        ]);
    });

    // remove page css cache
    config.page.forEach(function(page){
        del([
            "./src/AP/"+page.bundleName+"/Resources/css/"+page.name+"/cache/"
        ]);
    });
});