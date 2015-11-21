/**
 * Created by julienbouysset on 20/11/15.
 */

var gulp   = require('gulp');
var config = require('../config.json');
var del    = require('del');

// remove old files
gulp.task('js_remove_old_files', function() {

    del([
        "./web/js/*",
        "./app/Resources/js/main.js"
    ]);

    config.bundles.forEach(function(name) {
        del([
            "./src/AP/"+name+"/Resources/js/bundle.js"
        ]);
    });

    config.page.forEach(function(page){
        del([
            "./src/AP/"+page.bundleName+"/Resources/js/"+page.name+"/page.js"
        ]);
    });
});