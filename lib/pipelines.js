var mix = require('util-mix');

module.exports = function (b, opts) {
  var files = [];
  var pipelines = [];
  var expectedPipelines = opts.entries.length;

  var getCustomPack;
  if (opts.pack) {
    getCustomPack = function (file) {
      return opts.pack(
        // add `from` to tell `pack` which entry is being processed
        mix({ from: file }, b._options, { raw: true, hasExports: true })
      );
    };
  }

  b.on('factor.pipeline', function (file, pipeline) {
    files.push(file);

    var labeled;
    if (getCustomPack) {
      labeled = pipeline.get('pack');
      labeled.splice(labeled.length - 1, 1, getCustomPack(file));
    }

    if (pipelines.push(pipeline) === expectedPipelines) {
      b.emit('factor._pipelines', files, pipelines);
      files = [];
      pipelines = [];
    }
  });

};

