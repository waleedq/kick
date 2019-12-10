'use strict';
var argv         = require('minimist')(process.argv.slice(2))
  , gulp         = require('gulp')
  , cache        = require('gulp-cache')
  , watch        = require('gulp-watch')
  , gutil        = require('gulp-util')
  , gulpif       = require('gulp-if')
  , gulpifelse   = require('gulp-if-else')
  , sass         = require('gulp-sass')
  , livereload   = require('gulp-livereload')
  , prefix       = require('gulp-autoprefixer')
  , cleanCSS     = require('gulp-clean-css')
  , minifyHtml   = require('gulp-minify-html')
  , imagemin     = require('gulp-imagemin')
  , uglify       = require('gulp-uglify')
  , sourcemaps   = require('gulp-sourcemaps')
  , useref       = require('gulp-useref')
  , filter       = require('gulp-filter')
  , concat       = require('gulp-concat')
  , defineModule = require('gulp-define-module')
  , declare      = require('gulp-declare')
  , handlebars   = require('gulp-handlebars')
  , del          = require('del')
  , express      = require('express')
  , path         = require('path')
  , opn          = require('opn')
  , nodemon      = require('gulp-nodemon')
  , info         = require('./package.json');

// Configuration

var Config = {
  port: 9200,
  livereload_port: 35729,
  cache: (typeof argv.cache !== 'undefined' ? !!argv.cache : false),
  imagemin: {
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
  },
  paths: {
    root: ".",
    app:   {
      root:   'ui',
      js:     'ui/js',
      components: 'ui/components',
      scss:   'ui/scss',
      css:    'ui/css',
      images: 'ui/img',
      fonts:  'ui/fonts',
      lib:    'ui/lib',
      tmpl:   'ui/tmpl',
      assets: 'ui/assets',
      extra: [
        //'app/foo/**/*',
        //'app/bar/**/*'
      ]
    },
    build: {
      root:   'public',
      js:     'public/js',
      css:    'public/css',
      images: 'public/img',
      fonts:  'public/fonts',
      lib:    'public/lib',
      assets: 'public/assets',
      extra: [
        //'public/foo/',
        //'public/bar/'
      ]
    }
  }
}

// Tasks
// =====

// Styles
gulp.task('styles:clean', function(next){
  del([Config.paths.build.css + '/**/*.css'], next);
});
gulp.task('styles', function(){
  return gulp.src([
      Config.paths.app.scss + '/index.scss',
      Config.paths.app.scss + '/pages/**/*.scss'
    ])
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(prefix('last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(Config.paths.build.css));
});

// Fonts
gulp.task('fonts:clean', function(next){
  del(Config.paths.build.fonts + '/**', next);
});
gulp.task('fonts', ['fonts:clean'], function(){
  return gulp.src(Config.paths.app.fonts + '/**/*')
    .pipe(gulp.dest(Config.paths.build.fonts + '/'));
});

gulp.task('assets', function(){
  return gulp.src(Config.paths.app.assets + '/**/*')
    .pipe(gulp.dest(Config.paths.build.assets + '/'));
});


// Images
gulp.task('images:clean', function(next){
  del(Config.paths.build.images + '/**', next);
});
gulp.task('images', function(){
  return gulp.src(Config.paths.app.images + '/**/*')
    .pipe(gulpifelse(
      Config.cache, function(){
        return cache(imagemin(Config.imagemin)) // if
      }, function(){
        return imagemin(Config.imagemin) // else
      }
    ))
    .pipe(gulp.dest(Config.paths.build.images + '/'));
});

gulp.task('scripts:clean', function(next){
  del([Config.paths.build.components + '/**/*.js'], next);
});

gulp.task('scripts', function() {
  gulp.src([
    Config.paths.app.components + '/jquery/dist/jquery.js',
    Config.paths.app.components + '/material-design-lite/material.js',
    Config.paths.app.js + '/scripts.js',
  ]).pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(Config.paths.build.js + '/'))

  gulp.src([
    Config.paths.app.js + '/pages/*.js',
    Config.paths.app.js + '/pages/user-signup.js',
  ]).pipe(uglify())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(Config.paths.build.js + '/'))
});

// Extra folders
gulp.task('extra:clean', function(next){
  if(!Config.paths.build.extra.length) {
    return;
  }
  del(Config.paths.build.extra + '/**', next);
})
gulp.task('extra', ['extra:clean'], function(){
  if(!Config.paths.app.extra.length || !Config.paths.build.extra.length || Config.paths.app.extra.length != Config.paths.build.extra.length) {
    return;
  }
  for(var dir in Config.paths.app.extra) {
    gulp.src(Config.paths.app.extra[dir])
      .pipe(gulp.dest(Config.paths.build.extra[dir]));
  }
});

// Server
gulp.task('server', function(){
  var stream = nodemon({
    script: 'index.js'
  , ext: 'dust js !public/'
  , env: { 'NODE_ENV': 'dev', 'NODE_PATH': '.' }
  , stdout: false
  });

  stream.on('start', function () {
    console.log('nodemon started');
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^Social app is ready/.test(chunk)) {
        livereload.reload("./")
      }
      process.stdout.write(chunk)
    })
    this.stderr.on('data', function(chunk) {
      process.stderr.write(chunk)
    })
  })
});

// LiveReload
gulp.task('livereload', function(){
  livereload.listen(Config.livereload_port, function(err) {
    if(err) gutil.log('Livereload error:', err);
  })
});

// Watches
gulp.task('watch', function(){
  watch(Config.paths.app.scss + '/**/*.scss', function(){
    gulp.start('styles');
  });
  watch(Config.paths.app.js + '/**/*.js', function(){
    gulp.start('scripts');
  });
  gulp.watch([
    Config.paths.app.images + '/**/*.png',
    Config.paths.app.images + '/**/*.jpg',
    Config.paths.app.images + '/**/*.jpeg',
    Config.paths.app.images + '/**/*.gif',
    Config.paths.build.css + '/**/*.css',
    Config.paths.build.js + '/**/*.js'
  ], function(evt){
    livereload.changed(evt.path);
  });
});

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

gulp.task('clean', ['fonts:clean', 'images:clean', 'scripts:clean', 'extra:clean']);
gulp.task('build', ['styles', 'fonts', 'extra', 'scripts', 'images']);
gulp.task('default', ['server', 'livereload', 'styles', 'scripts', 'watch', 'images', 'assets'], function(){
  if(argv.o) opn('http://127.0.0.1:' + Config.port);
});