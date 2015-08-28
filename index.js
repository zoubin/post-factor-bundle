var mix = require('util-mix');
var pick = mix.pick;

module.exports = function (b, opts) {
  b.plugin(
    require('./lib/pipelines'),
    pick(['pack', 'entries'], opts)
  );

  b.plugin(
    require('./lib/outputs'),
    pick(['basedir', 'entries', 'outputs'], opts)
  );

  b.plugin(
    require('factor-bundle'),
    mix({}, opts, { outputs: [] })
  );

  return b;
};

