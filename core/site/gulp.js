var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var notify = require('gulp-notify');

import buffer from 'vinyl-buffer'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'

import common from '../common'

import { CorePath, DataPath } from '../path'

let env = process.env.NODE_ENV

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
   title: 'Compile Error',
   message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end');
}

function buildApp(file, watch) {
  var props = {
    entries: [CorePath+'/site/apps/' + file],
    debug : true,
    cache: {},
    packageCache: {},
    transform:  [babelify.configure({stage : 0, breakConfig: true})]
    //transform:  [[babelify.configure({presets: ["react", "es2015"]})]]
    //transform: [[babelify, {presets: ['es2015', 'react']}]]
  };

  var bundler = watch ? watchify(browserify(props)) : browserify(props)

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      //.pipe(buffer())
      //.pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(DataPath+'/build/apps/'))
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

//buildApp('main.js', true)
