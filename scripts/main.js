var esprima = require('esprima');
var ssa = require('ssa.js');
var ir = require('ssa-ir');
var phi = require('phi.js');
var ls = require('linearscan');
var config = require('./config.json');

ls = ls.create(config);

var inputs = {
  src: $('#src'),
  ssa: $('#ssa'),
  phi: $('#phi'),
  out: $('#out')
};

function pipe(from, to, transform) {
  from.on('keyup', function() {
    var src = from.val();
    transform(src, function(err, out) {
      if (err)
        return console.log(err);
      else
        to.val(out);

      to.trigger('keyup');
    });
  });
}

var boundary = '# function split #\n';

pipe(inputs.src, inputs.ssa, function(src, cb) {
  try {
    var ast = esprima.parse(src);
    var out = ssa.construct(ast).map(function(cfg) {
      return ir.stringify(cfg.blocks);
    }).join(boundary);

    cb(null, out);
  } catch (e) {
    cb(e);
  }
});

function mapIR(src, fn) {
  return src.split(boundary).map(function(str) {
    return ir.parse(str);
  }).map(function(cfg) {
    return fn(cfg);
  }).map(function(cfg) {
    return ir.stringify(cfg);
  }).join(boundary);
}

pipe(inputs.ssa, inputs.phi, function(src, cb) {
  try {
    var out = mapIR(src, phi.run.bind(phi));

    cb(null, out);
  } catch (e) {
    cb(e);
  }
});

pipe(inputs.phi, inputs.out, function(src, cb) {
  try {
    var out = mapIR(src, ls.run.bind(ls));

    cb(null, out);
  } catch (e) {
    cb(e);
  }
});

// Example

inputs.src.val(function() {
function run() {
  var x = 1;
  for (var i = 0; i < 10; i++) {
    console.log(i);
    x += i;
  }
  console.log(x);
}
run();
}.toString().replace(/^function.*{\n|\n}$/g, ''));

inputs.src.trigger('keyup');
