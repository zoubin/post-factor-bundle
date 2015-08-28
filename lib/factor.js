var mix = require('util-mix');
var pick = mix.pick;

module.exports = function (b, opts) {
  b.plugin(
    require('./pipelines'),
    pick(['pack', 'entries'], opts)
  );

  b.plugin(
    require('./outputs'),
    pick(['basedir', 'entries', 'outputs'], opts)
  );

  b.plugin(
    require('factor-bundle'),
    mix({}, opts, { outputs: [] })
  );

  return b;
};

