var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var util = require('gulp-util');
var templateCache = require('gulp-angular-templatecache');

gulp.task('scss', function() {
  return gulp.src(['demo/scss/demo.scss'])
    .pipe(sass().on('error', util.log))
    .pipe(rename('demo.css'))
    .pipe(gulp.dest('demo/css'));
});
//
// gulp.task('vendor', function() {
//   var vendorFiles = [
//     "bower_components/jquery/jquery.js",
//     "bower_components/angular/angular.js",
//     "bower_components/moment/moment.js",
//     "bower_components/lodash/dist/lodash.js",
//     "bower_components/rrule/lib/rrule.js",
//     "bower_components/rrule/lib/nlp.js"
//   ];
//
//   return gulp.src(vendorFiles)
//     .pipe(concat('vendor.js'))
//     .pipe(gulp.dest('demo/.'));
// });
//
gulp.task('app', function() {
  return gulp.src(['lib/rrule_recurring_select.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('demo/.'));
});

gulp.task('template-cache', function() {
  return gulp.src(['template/**/*.html'])
    .pipe(templateCache({ root: 'template', module: 'rrule.templates', standalone: true }))
    .pipe(gulp.dest('demo/.'));
});

gulp.task('compile', gulp.parallel('app'));

gulp.task('build', gulp.parallel(['scss', 'compile', 'template-cache']));

gulp.task('dist:js', gulp.series('build', function() {
  return gulp.src(['demo/app.js'])
    .pipe(concat('rrule_recurring_select.js'))
    .pipe(gulp.dest('dist'));
}));

gulp.task('dist:js_with_template', gulp.series('build', function() {
  return gulp.src(['demo/app.js', 'demo/templates.js'])
    .pipe(concat('rrule_recurring_select_templates.js'))
    .pipe(gulp.dest('dist/.'));
}));

gulp.task('dist:css', gulp.series('scss', function() {
  return gulp.src(['demo/css/demo.css'])
    .pipe(concat('rrule_recurring_select.css'))
    .pipe(gulp.dest('dist/.'));
}));

gulp.task('dist', gulp.parallel(['dist:js', 'dist:js_with_template', 'dist:css']));

gulp.task('watch', function () {
  gulp.watch('lib/**/*.js', ['compile']);
  gulp.watch('bower_components/**/*.js', ['compile']);
  gulp.watch('demo/scss/*.scss', ['scss']);
  gulp.watch('template/*.html', ['template-cache']);
});

gulp.task('default', gulp.parallel(['build', 'watch']));