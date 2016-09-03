var gulp   = require('gulp');
var fs     = require("fs");
var merge  = require('merge-stream');
var vm    = require('vm');

// import tool.js
eval(fs.readFileSync(__dirname + "/tool.js")+'');

// import image to web dir
gulp.task('img_move_to_web_dir', function() {

    // stream for procedural execution
    var stream = [];

    // list of bundles
    var bundle = getBundleList();

    // list of pages
    var pages = getPageList(bundle);

    // import main image to web dir
    stream.push(gulp.src("../app/Resources/img/*")
        .pipe(gulp.dest("../web/bundles/images/")));

    // import bundle image to web dir
    bundle.forEach(function(name){
        stream.push(gulp.src("../src/"+name+"/Resources/img/*.jpg")
            .pipe(gulp.dest("../web/bundles/"+name+"/images")));
        stream.push(gulp.src("../src/"+name+"/Resources/img/*.png")
            .pipe(gulp.dest("../web/bundles/"+name+"/images")));
    });

    // import page image to web dir
    pages.forEach(function(page){
        stream.push(gulp.src("../src/"+page[0]+"/Resources/img/"+page[1]+"/*")
            .pipe(gulp.dest("../web/bundles/"+page[0]+"/"+page[1]+"/images/")));
    });
    return merge(stream);
});