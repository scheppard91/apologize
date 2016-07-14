var gulp   = require('gulp');
var merge  = require('gulp-merge');
var fs     = require('fs');

// move css to cache
gulp.task('css_move_to_cache', function () {
    var stream =[];
    //main
    var stream1 = gulp.src('./app/Resources/css/*.css')
        .pipe(gulp.dest('./app/Resources/css/cache/'));
    
   //bundle IndexBundle
    var bundle = fs.readdirSync('./src/AP');
    var stream2 = bundle.forEach(function(name){
        gulp.src("./src/AP/"+name+"/Resources/css/*.css")
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/css/cache/"))
    });

    //index
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
        stream[i] = gulp.src("./src/AP/"+pages[i][0]+"/Resources/css/"+pages[i][1]+"/*.css")
            .pipe(gulp.dest("./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]));
    }

    return merge(stream1,stream2,stream);
});

//   app/resource/css/cache
//      src/[bundle]/resource/css/cache
//          src/[bundle]/resource/css/cache/[page]
