/**
 * Created by julienbouysset on 09/11/15.
 */
var gulp = require('gulp');



// convert scss to css
gulp.task('sass', function () {

    var sass = require('gulp-ruby-sass');

    //main
    sass('./app/Resources/scss/*.scss')
        .pipe(gulp.dest('./app/Resources/css/cache/'));

    //bundle IndexBundle
    sass('./src/AP/IndexBundle/Resources/scss/*.scss')
        .pipe(gulp.dest('./src/AP/IndexBundle/Resources/css/cache/'))

    //index
    sass('./src/AP/IndexBundle/Resources/scss/index/*.scss')
        .pipe(gulp.dest('./src/AP/IndexBundle/Resources/css/index/cache/'));
});



//concat css
gulp.task('cssconcat', function() {

    var concatCss = require('gulp-concat-css');

    //main
    gulp.src("./app/Resources/css/cache/*.css")
        .pipe(concatCss("main.css"))
        .pipe(gulp.dest("./app/Resources/css/"));

    //bundle IndexBundle
    /*gulp.src("./src/AP/IndexBundle/Resources/css/cache/*.css")
        .pipe(concatCss("bundle.css"))
        .pipe(gulp.dest("./src/AP/IndexBundle/Resources/css/"));*/

    //bundle IndexBundle index
    /*gulp.src("./src/AP/IndexBundle/Resources/css/index/cache/*.css")
        .pipe(concatCss("style.css"))
        .pipe(gulp.dest("./src/AP/IndexBundle/Resources/css/index/"));*/

    //index
    gulp.src("./app/Resources/css/main.css"/*,
             "./src/AP/IndexBundle/Resources/css/bundle.css",
             "./src/AP/IndexBundle/Resources/css/index/style.css"*/
            )
        .pipe(concatCss("index.css"))
        .pipe(gulp.dest("./web/css/"));
});

gulp.task('jsconcat', function() {

    var concat = require('gulp-concat');

    gulp.src('./app/Resources/js/cache/*.js')
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./app/Resources/js/'));

    gulp.src(['./app/Resources/js/main.js'/*,
              './src/AP/IndexBundle/Resources/js/bundle.js',
              './src/AP/IndexBundle/Resources/js/index/style.js'*/])
        .pipe(concat('index.js'))
        .pipe(gulp.dest('./web/js/'));
});

gulp.task('jscompress', function() {

    var uglify = require('gulp-uglify');

    gulp.src('./web/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./web/js/'));
});

gulp.task('csscompress', function() {

    var minifyCss = require('gulp-minify-css');

    gulp.src("./web/css/*.css")
        .pipe(minifyCss())
        .pipe(gulp.dest("./web/css/"))
});



