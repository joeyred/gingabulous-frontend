'use strict';

var gulp        = require('gulp');
var $           = require('gulp-load-plugins')({
  rename: {
    'gulp-merge-media-queries': 'mmq'
  }
});
var	browserSync = require('browser-sync').create();
var	sequence    = require('run-sequence');
var	del         = require('del');
var yargs       = require('yargs');

var DEPLOY = Boolean(yargs.argv.production);

var COMPATIBILITY = ['last 2 versions', 'ie >= 9', 'Safari 8'];

var PATH = {
  scss: {
    main: 'src/gingabulous.scss',
    partials: [
      'src'
    ]
  },
  dist: 'dist',
  build: 'build'
};

/* browserSync */
gulp.task('browserSync', function() {
  return browserSync.init({
    server: './',
    port:   8000,
    notify: false, // boolean value, Toggle notifications of bsync activity.
    open:   false // toggle auotmatic opening of webpage upong bsync starting.
  });
});

/* Clean */
gulp.task('clean', function() {
  return del($.if(DEPLOY, [PATH.dist], [PATH.build]));
});

/* Compile SCSS */
gulp.task('scss', function() {
  return gulp.src(PATH.scss.main)
	.pipe($.sourcemaps.init())
	.pipe(
    $.sass({
      includePaths: PATH.scss.partials,
      percision:    10
    })
		.on('error', $.sass.logError)
	)
	.pipe(
    $.mmq({
      log: true
    })
  )
	.pipe(
    $.autoprefixer({
      browsers: COMPATIBILITY
    })
  )
  .pipe($.pixrem())
	.pipe($.sourcemaps.write('./'))
	.pipe(gulp.dest($.if(DEPLOY, PATH.dist, PATH.build)))
	.pipe(
    browserSync.stream({ // Inject Styles
      // Force source map exclusion.
      // *This fixes reloading issue on each file change*
      match: '**/*.css'
    })
  );
});

/* Minify CSS */
gulp.task('minify', function() {
  return gulp.src($.if(DEPLOY, 'dist/gingabulous.css', 'build/gingabulous.css'))
  .pipe($.cssnano())
  .pipe(gulp.dest($.if(DEPLOY, PATH.dist, PATH.build)));
});

/* Reload Browser */
gulp.task('browserSyncReload', function(done) {
  browserSync.reload();
  done();
});

/* Watch Task */
gulp.task('watch', function() {
  gulp.watch('src/**/*.scss', ['scss']);
  gulp.watch('./test.html', ['browserSyncReload']);
});

/* Default */
gulp.task('default', function(cb) {
  sequence(
    'clean',
    'scss',
    'minify',
    'browserSync',
    'watch',
    cb
  );
});
