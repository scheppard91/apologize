var gulp  = require('gulp');
var merge = require('merge-stream');
var fs    = require('fs');
var vm    = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

// move js to cache
gulp.task('js_move_to_cache', function() {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);

    //move main js to cache
    stream.push(gulp.src(['../app/Resources/js/*.js','!../app/Resources/js/_*.js'])
        .pipe(gulp.dest('../app/Resources/js/cache/')));

    //move bundle js to cache
    bundle.forEach(function(name){
        stream.push(gulp.src("../src/"+name+"/Resources/js/*.js")
            .pipe(gulp.dest("../src/"+name+"/Resources/js/cache/")));
    });

    //move page js to cache
    pages.forEach(function(page){
        stream.push(gulp.src("../src/"+page[0]+"/Resources/js/"+page[1]+"/*.js")
            .pipe(gulp.dest("../src/"+page[0]+"/Resources/js/cache/"+page[1])));
    });

    //merge all stream
    return merge(stream);
});
