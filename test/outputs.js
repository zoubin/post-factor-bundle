var fs = require('fs');
var test = require('tap').test;
var factor = require('factor-bundle');
var browserify = require('browserify');
var pipelinesHook = require('../lib/pipelines');
var outputsHook = require('../lib/outputs');
var sink = require('sink-transform');
var path = require('path');

var fixtures = path.resolve.bind(path, __dirname, 'fixtures', 'modules');

test('pipelines', function(t) {
  t.plan(5);

  var entries = [fixtures('a.js'), fixtures('b.js')];
  var b = browserify(entries);

  b.plugin(pipelinesHook, {
    pack: function () {
      return getPackStream();
    },
    entries: entries,
  });

  b.plugin(outputsHook, {
    entries: entries,
    outputs: function (ents) {
      t.same(ents, entries);
      return ents.map(function () {
        return sink.PassThrough();
      });
    },
  });

  b.plugin(factor, {
    entries: entries,
    outputs: [],
  });

  b.on('factor.pipelines', function (files, pipelines, outputStreams) {
    t.equal(outputStreams.length, 2);

    if (files[0] > files[1]) {
      swap(outputStreams, 0, 1);
    }

    outputStreams.forEach(function (s, i) {
      s.pipe(sink.str(function (body, done) {
        t.equal(body, readFile(entries[i]));
        done();
      }));
    });
  });

  var labeled = b.pipeline.get('pack');
  labeled.splice(labeled.length - 1, 1, getPackStream());
  b.bundle()
    .pipe(sink.str(function (body, done) {
      t.equal(body, readFile('c.js'));
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
      rows
        .sort(function (r, s) {
          return r.file - s.file;
        })
        .map(function (row) {
          return row.source;
        })
        .join('\n')
    );
    done();
  });
}

function readFile(file) {
  return fs.readFileSync(fixtures(file), 'utf8');
}

