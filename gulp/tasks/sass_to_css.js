/**
 * Created by julienbouysset on 19/11/15.
 */

var gulp   = require('gulp');
var merge  = require('gulp-merge');
var sass   = require('gulp-ruby-sass');
var fs     = require('fs');


// convert scss to css
gulp.task('sass_to_css', function () {
    var stream =[];
    
    //main
    var stream1 = sass('./app/Resources/scss/*.scss')
        .pipe(gulp.dest('./app/Resources/css/cache/'));
    
    //bundle IndexBundle
    var bundle = fs.readdirSync('./src/AP');
    var stream2 = bundle.forEach(function(name){
        sass("./src/AP/"+name+"/Resources/scss/*.scss")
            .pipe(gulp.dest("./src/AP/"+name+"/Resources/css/cache/"))
        console.log("sass.to.css");
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
        console.log("sass.to.css");
    }

    for (var i = 0; i < pages.length; i++) {
        stream[i] = sass("./src/AP/"+pages[i][0]+"/Resources/scss/"+pages[i][1]+"/*.scss")
            .pipe(gulp.dest("./src/AP/"+pages[i][0]+"/Resources/css/cache/"+pages[i][1]));
        console.log(pages[i][0] + "===" + pages[i][1]);
    }
    
    return merge(stream1,stream2,stream);
});

//   app/resource/css/cache
//      src/[bundle]/resource/css/cache
//          src/[bundle]/resource/css/cache/[page]
