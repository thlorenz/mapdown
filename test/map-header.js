'use strict';
/*jshint asi: true */

var test = require('tap').test
var mapper = require('../')

function inspect(obj, depth) {
  return require('util').inspect(obj, false, depth || 5, true);
}

function check(md, raw, debug) {
  test('\n<= md\n' + inspect(md) + '\n=> raw\n' + inspect(raw), function (t) {
    var rendered = mapper(md.join('\n')).renderRaw().split('\n');
    if (debug) console.log('actual:\n' + inspect(rendered));
    t.deepEqual(rendered, raw)
    t.end()
  })
}

check(
    [ '# MyTitle'
    , ''
    , 'My 3rd line'
    , ''
    , '## My SubTitle'
    ]
  , [ ' MyTitle',
      '',
      'My 3rd line',
      '',
      ' My SubTitle' 
    ]
)
/*check(
    [ '#MyTitle'
    , ''
    , 'My 3rd line'
    , '### My SubTitle'
    ]
  , [ 'MyTitle',
      '',
      'My 3rd line',
      ' My SubTitle' 
    ]
  , true
)*/
