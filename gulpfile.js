/*
 * @Author: Rongxis 
 * @Date: 2019-08-17 11:00:02 
 * @Last Modified by:   Rongxis 
 * @Last Modified time: 2019-08-17 11:00:02 
 */

'use strict';
var browserify = require('browserify')
var babelify = require('babelify')
var gulp = require('gulp')
var webpack = require('gulp-webpack')
var watch = require('gulp-watch')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')
var globby = require('globby')
var sourcemaps = require('gulp-sourcemaps')
var log = require('gulplog')
var shell = require('gulp-shell')
var babel = require('gulp-babel')
var concat = require('gulp-concat')
var env = require('gulp-env')
var inject = require('gulp-inject')
var insert = require('insert-module-globals')
var copy = require('gulp-copy')
var transform = require('vinyl-transform')
var gulpAlias = require('./gulp-alias')
var gulpInjectGlobalVar = require('./gulp-inject-global-vars')
var path = require('path')
var baseUrl = 'src'

gulp.task('dev', gulp.series(function () {
  return browserify({
    entries: path.join(baseUrl, 'index.js'),
    debug: true
  })
    .external(['fs', 'child_process', 'puppeteer'])
    .transform(babelify, {})
    .bundle()
    .pipe(source('./bundle.js'))
    .pipe(buffer())
    .pipe(gulpInjectGlobalVar({
      srcRoot: path.join(__dirname, baseUrl)
    }))
    .pipe(gulp.dest('./dev/'))
}))

gulp.task('build', gulp.series(function () {
  return browserify({
    entries: path.join(baseUrl, 'index.js'),
    debug: false
  })
    .external(['phantom', 'fs', 'child_process'])
    .transform(babelify, {})
    .bundle()
    .pipe(source('./bundle.js'))
    .pipe(buffer())
    .pipe(gulpInjectGlobalVar({
      srcRoot: path.join(__dirname, baseUrl)
    }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    // Add transformation tasks to the pipeline here.
    // .pipe(uglify())
    // .on('error', log.error)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
}))

gulp.task('watching', gulp.series('dev', function () {
  return watch(baseUrl + '/**/*.js', gulp.series('dev'))
}))

gulp.task('shell:open', shell.task('npm run dev:multi'))
// gulp.task('shell:open', function() {
//     childProcess = child.execSync('npm run dev:multi')
// })
gulp.task('shell:down', function () {
  childProcess.kill()
})

gulp.task('default', gulp.series('watching'))
