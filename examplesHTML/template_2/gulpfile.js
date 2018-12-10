'use strict';

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      sourcemaps = require('gulp-sourcemaps'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      cssnano = require('cssnano'),
      browserSync = require('browser-sync').create(),
      del = require('del'),
      gulpIf = require('gulp-if'),
      // debug = require('gulp-debug'),
      notify = require('gulp-notify'),
      multipipe = require('multipipe'),
      pump = require('pump'),
      minify = require('gulp-minify');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development'; // NODE_ENV=production gulp build

gulp.task('styles', () => {
  let plugins;
  if (isDevelopment) {
    plugins = [autoprefixer({ browsers: ['last 5 version'] })];
  } else {
    plugins = [
      autoprefixer({ browsers: ['last 5 version'] }),
      cssnano,
    ];
  }
  return multipipe(
      gulp.src('src/scss/main.scss'),
      gulpIf(isDevelopment, sourcemaps.init()),
      sass(),
      postcss(plugins),
      gulpIf(isDevelopment, sourcemaps.write()),
      gulp.dest('dist/css'),
    ).on('error', notify.onError());
});

gulp.task('clean', function () {
  return del('dist');
});

gulp.task('assets', function() {
  return gulp.src('src/img/**/*.*', { since: gulp.lastRun('assets') })
    .pipe(gulp.dest('dist/img'));
});

gulp.task('js', function (cb) {
  pump([
    gulp.src('src/js/*.js'),
    minify(),
    gulp.dest('dist/js')
  ],
    cb
  );
});

gulp.task('html', () => {
  return gulp.src('src/template-2.html')
    .pipe(gulp.dest('dist'));
})

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('html', 'styles', 'assets', 'js'))
);

gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.*', gulp.series('styles'));
  gulp.watch('src/img/**/*.*', gulp.series('assets'));
  gulp.watch('src/js/**/*.*', gulp.series('js'));
  gulp.watch('src/**/*.html', gulp.series('html'));
});

gulp.task('serve', () => {
  browserSync.init({
    server: 'dist',
  });

  browserSync.watch('dist/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev',
  gulp.series('build', gulp.parallel('watch', 'serve'))
);
