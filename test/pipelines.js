var test = require('tap').test;
var factor = require('factor-bundle');
var browserify = require('browserify');
var pipelinesHook = require('../lib/pipelines');
var sink = require('sink-transform');
var path = require('path');

var fixtures = path.resolve.bind(path, __dirname, 'fixtures', 'modules');

test('pipelines', function(t) {
  t.plan(6);

  var entries = [fixtures('a.js'), fixtures('b.js')];
  var b = browserify(entries);

  var froms = [];
  b.plugin(pipelinesHook, {
    pack: function (opts) {
      if (froms.length < 2) {
        froms.push(opts.from);
      } else {
        t.same(froms.sort(), entries);
      }
      return getPackStream();
    },
    entries: entries,
  });

  b.plugin(factor, {
    entries: entries,
    outputs: [],
  });

  b.on('factor._pipelines', function (files, pipelines) {
    t.equal(files.length, 2);
    t.equal(pipelines.length, 2);

    if (files[0] > files[1]) {
      swap(files, 0, 1);
      swap(pipelines, 0, 1);
    }
    t.same(files, entries);

    pipelines.forEach(function (pipeline, i) {
      pipeline.pipe(sink.str(function (body, done) {
        t.equal(body, entries[i]);
        done();
      }));
    });
  });

  var labeled = b.pipeline.get('pack');
  labeled.splice(labeled.length - 1, 1, getPackStream());
  b.bundle()
    .pipe(sink.str(function (body, done) {
      t.equal(body, fixtures('c.js'));
      done();
    }))
    ;
});

function swap(arr, i, j) {
  var t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
}

function getPackStream() {
  return sink.obj(function (rows, done) {
    this.push(
      rows.map(function (row) {
          return row.file;
        })
        .sort(function (r, s) {
          return r - s;
        })
        .join('\n')
    );
    done();
  });
}

