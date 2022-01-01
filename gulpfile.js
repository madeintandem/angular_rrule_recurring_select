var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass')(require('sass'));
var rename = require('gulp-rename');
var util = require('gulp-util');
var templateCache = require('gulp-angular-templatecache');

gulp.task('scss', function() {
  return gulp.src(['lib/rrule_recurring_select.scss'])
    .pipe(sass().on('error', util.log))
    .pipe(rename('rrule_recurring_select.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('app', function() {
  return gulp.src(['lib/rrule_recurring_select.js'])
    .pipe(concat('rrule_recurring_select.js'))
    .pipe(gulp.dest('dist/.'));
});

gulp.task('template-cache', function() {
  return gulp.src(['template/**/*.html'])
    .pipe(templateCache({ root: 'template', module: 'rrule.templates', standalone: true }))
    .pipe(gulp.dest('dist/.'));
});

gulp.task('concat_template', function() {
  return gulp.src(['dist/rrule_recurring_select.js', 'dist/templates.js'])
      .pipe(concat('rrule_recurring_select_templates.js'))
      .pipe(gulp.dest('dist/.'));
});

gulp.task('compile', gulp.parallel('app'));

gulp.task('build', gulp.series([ gulp.parallel(['scss', 'compile', 'template-cache']), 'concat_template']));

gulp.task('default', gulp.parallel(['build']));
