const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const tsify = require('tsify')
const sourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer')
const browserSync = require('browser-sync').create()
const del = require('del')
const uglify = require('gulp-uglify')
var ts = require('gulp-typescript')

const port = 3030
const dest = './dist'

gulp.task('clean-build-folder', () => {
  return del([dest + '/*'])
})

gulp.task('browser-sync', () => {
  browserSync.init({
    port: port,
    server: { baseDir: './demo' }
  })
})

gulp.task('move-demo-files', () => {
  return gulp.src('./dist/rectangle-scan.js')
  .pipe(gulp.dest('./demo'))
})

gulp.task('build', () => {
  return gulp.src('./index.ts')
  .pipe(ts())
  .pipe(gulp.dest('./'))
})

gulp.task('browserify', () => {
  return browserify({
    basedir: '.',
    debug: true,
    entries: 'index.ts',
    cache: {},
    packageCache: {}
  })
  .plugin(tsify, {target: 'es6'})
  .transform('babelify', {
    presets: ['es2015'],
    extensions: ['.ts']
  })
  .bundle()
  .on('error', console.error)
  .pipe(source('rectangle-scan.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(dest))
})

gulp.task('uglify-js', () => {
  return gulp.src(dest + '/*.js')
  .pipe(uglify())
  .pipe(gulp.dest(dest))
})

gulp.task('build-tasks', gulp.series('browserify'))
gulp.task('optimization-tasks', gulp.series('uglify-js'))
gulp.task('build-dist', gulp.series('clean-build-folder', 'build-tasks', 'optimization-tasks'))
gulp.task('demo', gulp.series('move-demo-files', 'browser-sync'))
gulp.task('default', gulp.series('demo'))