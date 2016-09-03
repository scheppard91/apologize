/**
 * Created by julienbouysset on 20/11/15.
 */

var gulp   = require('gulp');
var clean  = require('gulp-clean');
var fs     = require("fs");
var merge  = require('merge-stream');
var vm    = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

// remove cache dir
gulp.task('js_remove_cache', function() {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // remove global js cache
    stream.push(gulp.src("../app/Resources/js/cache/")
        .pipe(clean({force: true})));

    // remove bundle css cache
    bundle.forEach(function(name){
        stream.push(gulp.src("../src/"+name+"/Resources/js/cache/")
            .pipe(clean({force: true})));
    });

    var pagesBundle = getRessourceBundleList();

    //compress css for all bundle
    pagesBundle.forEach(function(pageBundle) {

        //return ressource page
        var pages = getRessourcePageList(pageBundle);

        //remove page css cache
        pages.forEach(function(page){
            gulp.src("../web/bundles/" + pageBundle +"/"+page+"/cache/")
                .pipe(clean({force: true}));
        });
    });
    return merge(stream);
});
