# post-factor-bundle
Add features to make factor-bundle more friendly.

[gulp-watchify-factor-bundle](https://github.com/zoubin/gulp-watchify-factor-bundle) is based on this package.

## Example

```javascript
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

```

## b.plugin(factor, opts)

### opts

#### entries

Type: `Array`

The array of entry files to create a page-specific bundle for each file.

#### outputs

Type: `Array`, `Function`

An array that pairs up with the files array to specify where each bundle output for each entry file should be written.
If `Function`, it should return such an array.

#### threshold

Type: `Number`, `Function`

Default: `1`

See [factor-bundle](https://github.com/substack/factor-bundle#var-fr--factorfiles-opts)

#### pack

Type: `Function`

Transform to replace `browser-pack`.

## b.on('factor.pipelines', function (files, pipelines, outputStreams) {})

`files` and `pipelines` are both `Array`,
and elements are explained in [factor-bundle](https://github.com/substack/factor-bundle#bonfactorpipeline-function-file-pipeline-)

`outputStreams` is `Array`, containing all output streams except the common stream.

