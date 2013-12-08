var spritegenerator = require('../lib/spritegenerator');

exports.testgenerate = function(test) {
  spritegenerator.generate();
  test.done();
};
