var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var util = require('gulp-util');
var templateCache = require('gulp-angular-templatecache');

gulp.task('scss', function() {
  var appFiles = gulp.src(['demo/scss/demo.scss'])
    .pipe(sass().on('error', util.log))
    .pipe(rename('demo.css'))
    .pipe(gulp.dest('demo/css'));
});

gulp.task('vendor', function() {
  var vendorFiles = [
    "bower_components/jquery/jquery.js",
    "bower_components/angular/angular.js",
    "bower_components/moment/moment.js",
    "bower_components/lodash/dist/lodash.js",
    "bower_components/rrule/lib/rrule.js"
  ];

  return gulp.src(vendorFiles)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('demo/.'));
});

gulp.task('app', function() {
  return gulp.src(['lib/rrule_recurring_select.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('demo/.'));
});

gulp.task('template-cache', [], function() {
  return gulp.src(['template/**/*.html'])
    .pipe(templateCache({ root: 'template' }))
    .pipe(gulp.dest('demo'));
});

gulp.task('compile', ['vendor', 'app']);

gulp.task('build', ['scss', 'compile', 'template-cache']);

gulp.task('watch', function () {
  gulp.watch('lib/**/*.js', ['compile']);
  gulp.watch('bower_components/**/*.js', ['compile']);
  gulp.watch('demo/scss/*.scss', ['scss']);
});

gulp.task('default', ['build', 'watch']);
