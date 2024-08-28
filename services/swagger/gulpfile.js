'use strict';

var gulp = require('gulp');
var jsonMerger = require('gulp-merge-json');

gulp.task('buildSwaggerJSON', function () {
  return gulp.src('swagger_docs/**/*.json')
    .pipe(jsonMerger({
      fileName: 'swagger.json',
      concatArrays: true
    }))
    .pipe(gulp.dest('swagger_docs'));
});

gulp.task('default', gulp.series('buildSwaggerJSON'));
