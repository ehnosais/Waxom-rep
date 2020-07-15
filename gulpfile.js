'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber'); // для непрерывной работы (съедает ошибку)
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var minify = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var imageResize = require('gulp-image-resize');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var pngquant = require('imagemin-pngquant');
var webp = require('gulp-webp');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var del = require('del');

sass.compiler = require('node-sass');

gulp.task('style', function () {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(sourcemaps.init())
    .pipe(postcss([autoprefixer({
      overrideBrowserslist: ['last 4 versions']
    })]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.stream());
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
});

gulp.task('serve', function() {
  browserSync.init({
    server: {baseDir: 'build', directory: true}
  });
  gulp.watch('source/**/*.scss', gulp.parallel('style'));
  gulp.watch('source/**/*.html', gulp.parallel('html'));
});

gulp.task('clean', function () {
  return del('build');
});

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
    'source/js/**',
    'source/css/**'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
});

// image optimize
gulp.task('resize', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(imageResize({
      percentage: 200
    }))
    .pipe(rename(function (path) {
      path.basename += "@2x";
     }))
    .pipe(gulp.dest('source/img/'));
});

gulp.task('images', function() {
  return gulp.src('source/img/**/*')
    .pipe(imagemin([
      imageminJpegRecompress({
        loops: 5,
        min: 65,
        max: 70,
        quality: 'medium'
      }),
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 3}),
      pngquant({quality: [0.75, 0.8],speed: 5}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('source/img/'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 75}))
    .pipe(gulp.dest('source/img'));
});
// common img optim
gulp.task('imgOptim', gulp.series('resize', 'images', 'webp'));

// project build
gulp.task('build',
  gulp.series(
    'clean',
    'copy',
    'style',
    'html'
  )
);
