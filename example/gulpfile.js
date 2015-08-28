var gulp = require('gulp');
var path = require('path');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var merge = require('merge-stream');
var source = require('vinyl-source-stream');

var factor = require('../lib/factor');

var fixtures = path.resolve.bind(
  path, __dirname, 'src', 'page'
);

var entries = [
  fixtures('blue/index.js'),
  fixtures('red/index.js'),
];

gulp.task('default', function (cb) {
  var b = browserify({
    entries: entries,
  });
  b.plugin(factor, {
    entries: entries,
    outputs: function () {
      return [source('blue.js'), source('red.js')];
    },
  });
  b.on('factor.pipelines', function (f, p, outs) {
    stream.add(outs);
  });
  var stream = merge(
    b.bundle().pipe(source('common.js'))
  );
  return stream
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./build'));
});

