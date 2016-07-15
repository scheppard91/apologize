var gulp   = require('gulp');
var merge  = require('gulp-merge');
var fs     = require('fs');


// move js to cache
gulp.task('js_move_to_cache', function() {
    var stream =[];
    //main
    var stream1 = gulp.src(['./app/Resources/js/*.js','!./app/Resources/js/_*.js'])
        .pipe(gulp.dest('./app/Resources/js/cache/'));
    
    //bundle IndexBundle
    var bundle = fs.readdirSync('./src/AP');
    var stream2 = bundle.forEach(function(name){
        gulp.src("./src/AP/"+name+"/Resources/js/*.js")
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/js/cache/"));
    });

    //page
    var pages = [];
    for (var i = 0; i < bundle.length; i++) {
        var bundlePage = fs.readdirSync('./src/AP/' + bundle[i] + '/Resources/views/');
        for (var y=0;y<bundlePage.length;y++)
        {
            if(bundlePage[y].lastIndexOf(".twig")!=-1)
            {
                bundlePage.splice(y, 1);y--;
            }
        }
        for (var y = 0; y < bundlePage.length; y++) {
            bundlePage[y] = [bundle[i],bundlePage[y]];
        }
        pages = pages.concat(bundlePage)
    }

    for (var i = 0; i < pages.length; i++) {
        stream[i] = gulp.src("./src/AP/"+pages[i][0]+"/Resources/js/"+pages[i][1]+"/*.js")
            .pipe(gulp.dest("./src/AP/"+pages[i][0]+"/Resources/js/cache/"+pages[i][1]));
    }
    
    return merge(stream1,stream2,stream);
});

//   app/resource/js/cache
//      src/[bundle]/resource/js/cache
//          src/[bundle]/resource/js/cache/[page]