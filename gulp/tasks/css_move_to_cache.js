var gulp  = require('gulp');
var merge = require('merge-stream');
var fs    = require('fs');
var vm    = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');


// move css to cache
gulp.task('css_move_to_cache', function () {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);

    // move main css to main css cache dir
    stream.push(gulp.src('../app/Resources/css/*.css')
        .pipe(gulp.dest('../app/Resources/css/cache/')));

    // move bundle css to bundle css cache dir
    bundle.forEach(function(name){
        stream.push(gulp.src("../src/"+name+"/Resources/css/*.css")
            .pipe(gulp.dest("../src/"+name+"/Resources/css/cache/")))
    });

    pages.forEach(function(page){
        stream.push(gulp.src("../src/"+page[0]+"/Resources/css/"+page[1]+"/*.css")
            .pipe(gulp.dest("../src/"+page[0]+"/Resources/css/cache/"+page[1])));
    });

    return merge(stream);
});
