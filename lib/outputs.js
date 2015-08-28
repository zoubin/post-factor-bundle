var fs = require('fs');

module.exports = function (b, opts) {
  b.on('factor._pipelines', function (files, pipelines) {
    var outputStreams = buildOutputStreams(b, opts);

    pipelines.forEach(function (pipeline, i) {
      if (outputStreams[i]) {
        pipeline.unpipe();
        pipeline.pipe(outputStreams[i]);
      }
    });

    b.emit('factor.pipelines', files, pipelines, outputStreams);
  });
};

function buildOutputStreams(b, opts) {
  var basedir = opts.basedir || b._options.basedir || process.cwd();
  if (typeof opts.outputs === 'function') {
    return opts.outputs(opts.entries, basedir);
  }

  return [].concat(opts.outputs).map(function (o) {
    if (isStream(o)) {
      return o;
    }
    return fs.createWriteStream(o);
  });
}

function isStream(s) {
  return s && typeof s.pipe === 'function';
}

