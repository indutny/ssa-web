(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ssa = require('ssa.js');
var ir = require('ssa-ir');
var phi = require('phi.js');
var ls = require('linearscan');

var configuration = {
  registers: [
    'rax', 'rbx', 'rcx', 'rdx',
    'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14'
  ],

  instructions: {
    literal: { inputs: [ { type: 'js' } ] },

    loadProperty: {
      inputs: [ { type: 'register' }, { type: 'register' } ]
    },

    storeProperty: {
      output: null,
      inputs: [
        { type: 'register' }, { type: 'register' }, { type: 'register' }
      ]
    },

    deleteProperty: {
      inputs: [ { type: 'register' }, { type: 'register' } ]
    },

    loadGobal: {
      inputs: [ { type: 'js' } ]
    },

    storeGlobal: {
      output: null,
      inputs: [ { type: 'js' }, { type: 'register' } ]
    },

    deleteGlobal: {
      inputs: [ { type: 'js' } ]
    },

    loadContext: {
      inputs: [ { type: 'js' }, { type: 'js' } ]
    },

    storeContext: {
      output: null,
      inputs: [ { type: 'js' }, { type: 'js' }, { type: 'register' } ]
    },

    binary: {
      output: { type: 'register' },
      inputs: [ { type: 'js' }, { type: 'register' }, { type: 'register' } ]
    },

    unary: {
      output: { type: 'register' },
      inputs: [ { type: 'js' }, { type: 'register' } ]
    },

    branch: {
      output: null,
      inputs: [ { type: 'register' } ]
    },

    nop: {
      inputs: [ { type: 'any' } ]
    },

    pushArg: {
      output: null,
      inputs: [ { type: 'any' } ]
    },

    call: {
      output: { type: 'register', id: 'rax' },
      inputs: [ { type: 'register' }, { type: 'js' } ]
    },

    'new': {
      inputs: [ { type: 'register' }, { type: 'js' } ]
    },

    array: {
      inputs: [ { type: 'js' } ]
    },

    object: {
      inputs: [ { type: 'js' } ]
    },

    ret: {
      output: null,
      inputs: [ { type: 'register' } ]
    },

    fn: {
      inputs: [ { type: 'js' } ]
    },

    this: {},

    self: {}
  }
};

ls = ls.create(configuration);

exports.heya = function() {};

return 'ha';

},{"linearscan":7,"phi.js":8,"ssa-ir":10,"ssa.js":11}],2:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":6}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"./support/isBuffer":5,"__browserify_process":4,"inherits":3}],7:[function(require,module,exports){
var assert = require('assert');

function Linearscan(options) {
  this.options = options;
  this.registers = options.registers;
  this.registerList = null;
  this.registerMap = {};
  this.declarations = {};
  this.intervals = {};
  this.blockId = null;
  this.intervalId = null;

  // Filled during .run() call
  this.blocks = null;
  this.instructions = null;
  this.active = null;
  this.inactive = null;
  this.activeSpills = null;
  this.inactiveSpills = null;
  this.spills = null;
  this.maxSpill = null;

  this.init();
};
module.exports = Linearscan;

Linearscan.create = function create(options) {
  return new Linearscan(options);
};

Linearscan.prototype.init = function init() {
  // Fill declarations, applying default values
  this.declarations.to_phi = {
    inputs: [ { type: 'any' }, { type: 'any' } ],
    output: { type: 'any' },
    scratch: [],
    call: false
  };

  this.declarations.phi = {
    inputs: [],
    output: { type: 'any' },
    scratch: [],
    call: false
  };
  this.declarations.gap = {
    inputs: [],
    output: null,
    scratch: [],
    call: false
  };

  Object.keys(this.options.instructions).forEach(function(type) {
    var instr = this.options.instructions[type];

    this.declarations[type] = {
      output: instr.output !== null ? { type: 'any' } : instr.output,
      inputs: instr.inputs || [],
      scratch: instr.scratch || [],
      call: !!instr.call
    };
  }, this);

  // Create fixed intervals for all available registers
  this.blockId = 0;
  this.intervalId = 0;
  this.registerList = this.registers.map(function(reg) {
    var interval = this.createInterval(reg);
    interval.fix({ type: 'register', id: reg });
    this.registerMap[reg] = interval;

    return interval;
  }, this);
};

Linearscan.prototype.run = function run(input) {
  // Clone blocks
  this.blocks = this.clone(input);

  // Verify that every phi has two to_phi's
  this.verifyPhis();

  // Reorder blocks
  this.reorder();

  // Enumerate instructions in each block and insert gaps
  this.enumerate();

  // Find liveIn/liveOut for each block
  this.computeLiveness();

  // Allocate registers
  this.allocate();

  // Throw away all internal properties
  return this.strip();
};

Linearscan.prototype.spillCount = function spillCount() {
  return this.maxSpill;
};

Linearscan.prototype.clone = function clone(blocks) {
  var root = blocks[0].id;

  // Replace references to other blocks and instructions with
  // actual instructions
  var blockMap = {};
  var instructionMap = {};
  blocks = blocks.map(function(block) {
    var res = new Block(this, block, instructionMap);
    if (block.id)
      blockMap[block.id] = res;

    return res;
  }, this);

  // Replace uses
  blocks.forEach(function(block) {
    block.init(blockMap, instructionMap);
  });

  return blocks;
};

Linearscan.prototype.reorder = function reorder() {
  var blocks = this.blocks;
  var visited = [];
  var loopEnds = [];

  function blockCompare(a, b) {
    return a.loopIndex === b.Index ? 0 :
        b.loopDepth - a.loopDepth;
  }

  // BFS through blocks to find/mark loop starts
  var queue = [ blocks[0] ];
  while (queue.length > 0) {
    var block = queue.shift();

    // Normal block, visit successors
    visited[block.uid] = true;
    for (var i = 0; i < block.successors.length; i++) {
      var succ = block.successors[i];
      if (visited[succ.uid]) {
        succ.markLoop(block);
        succ.loopIndex = loopEnds.length;
        loopEnds.push({ start: succ, end: block });
        continue;
      }
      queue.push(succ);
    }
  }

  // Go upwards from loop end blocks, increasing block's loopDepth
  // XXX: O(n^2)
  loopEnds.forEach(function(item, i) {
    var start = item.start,
        end = item.end;

    var queue = [ end ];
    var visited = [];
    while (queue.length > 0) {
      var block = queue.shift();
      if (visited[block.uid])
        continue;
      visited[block.uid] = true;

      if (block.loopIndex === null) {
        // Separate loop
        block.loopIndex = start.loopIndex;
      } else {
        // Inner loop
        var outerSucc = block.loopEnd || block.successors[0];
        if (block.loopDepth === outerSucc.loopDepth)
          block.loopIndex = start.loopIndex;
      }
      block.loopDepth++;

      if (block === start)
        continue;

      // Visit predecessors
      for (var i = 0; i < block.predecessors.length; i++) {
        var pred = block.predecessors[i];
        queue.push(pred);
      }
    }
  });

  // Sort blocks by loop depth
  var queue = [ blocks[0] ];
  var result = [];
  while (queue.length > 0) {
    var block = queue.shift();

    result.push(block);

    for (var i = 0; i < block.successors.length; i++) {
      var succ = block.successors[i];

      // Not all predecessors was processed yet
      if (--succ.incomingForward !== 0)
        continue;

      // Do sorted insert
      // (Try to go deeper, or stay in the same loop)
      binaryInsert(queue, succ, blockCompare);
    }
  }

  this.blocks = result;
};

Linearscan.prototype.enumerate = function enumerate() {
  var blocks = this.blocks;
  var pos = 0;

  this.instructions = {};

  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    var start = pos;

    // Start block with a gap
    var gap = new Instruction(this, block, { type: 'gap' });
    gap.pos = pos++;
    this.instructions[gap.pos] = gap;
    var instructions = [ gap ];
    for (var j = 0; j < block.instructions.length; j++) {
      var instr = block.instructions[j];

      instr.pos = pos++;
      this.instructions[instr.pos] = instr;
      instructions.push(instr);

      var gap = new Instruction(this, block, { type: 'gap' });
      gap.pos = pos++;
      this.instructions[gap.pos] = gap;
      instructions.push(gap);
    }
    block.instructions = instructions;

    block.start = start;
    block.end = pos;
  }
};

Linearscan.prototype.computeLiveness = function computeLiveness() {
  // Compute liveGen/liveKill
  this.buildLocal();

  // Compute liveIn/liveOut
  this.buildGlobal();
};

Linearscan.prototype.buildLocal = function buildLocal() {
  var blocks = this.blocks;

  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];

    for (var j = 0; j < block.instructions.length; j++) {
      var instr = block.instructions[j];
      var decl = instr.decl;

      // Output to live kill
      if (instr.phi !== null)
        block.liveKill[instr.phi.output.id] = true;
      if (decl.output !== null) {
        if (instr.type === 'phi') {
          if (!block.liveKill[instr.output.id])
            block.liveGen[instr.output.id] = true;
        } else {
          block.liveKill[instr.output.id] = true;
        }
      }

      // Inputs to live gen
      decl.inputs.forEach(function(declInput, i) {
        var input = instr.inputs[i];
        if (input instanceof Instruction && !block.liveKill[input.output.id])
          block.liveGen[input.output.id] = true;
      });
    }
  }
};

Linearscan.prototype.buildGlobal = function buildGlobal() {
  var blocks = this.blocks;

  do {
    var change = false;

    for (var i = blocks.length - 1; i >= 0; i--) {
      var block = blocks[i];
      var prevOut = Object.keys(block.liveOut).length;
      var prevIn = Object.keys(block.liveIn).length;

      // Propagate successors' inputs to block outputs
      var newOut = 0;
      block.liveOut = {};
      for (var j = 0; j < block.successors.length; j++) {
        var succ = block.successors[j];
        var succKeys = Object.keys(succ.liveIn);

        succKeys.forEach(function(id) {
          if (!block.liveOut[id]) {
            block.liveOut[id] = true;
            newOut++;
          }
        });
      }

      // All outputs that are not killed in this block should be
      // propagated to the inputs
      var newIn = 0;
      block.liveIn = {};
      Object.keys(block.liveOut).forEach(function(id) {
        if (!block.liveKill[id]) {
          block.liveIn[id] = true;
          newIn++;
        }
      });
      Object.keys(block.liveGen).forEach(function(id) {
        if (!block.liveIn[id]) {
          block.liveIn[id] = true;
          newIn++;
        }
      });

      if (prevOut !== newOut || prevIn !== newIn)
        change = true;
    }
  } while(change);
};

Linearscan.prototype.buildIntervals = function buildIntervals() {
  var blocks = this.blocks;

  for (var i = blocks.length - 1; i >= 0; i--) {
    var block = blocks[i];

    Object.keys(block.liveOut).forEach(function(id) {
      var interval = this.intervals[id];

      interval.addRange(block.start, block.end);
    }, this);

    for (var j = block.instructions.length - 1; j >= 0; j--) {
      var instr = block.instructions[j];
      var decl = instr.decl;

      // Add fixed [pos, pos + 1] range
      // TODO(indutny): make affected registers list extensible
      if (instr.hasCall) {
        this.registerList.forEach(function(interval) {
          interval.addRange(instr.pos, instr.pos + 1);
        });
      }

      if (instr.output !== null) {
        if (instr.type === 'phi') {
          if (!instr.output.covers(instr.pos))
            instr.output.addRange(block.start, instr.pos);
        } else {
          instr.output.shortenRange(instr.pos);
        }
        instr.output.addUse(instr, decl.output);
      }

      instr.scratch.forEach(function(scratch, i) {
        if (instr.hasCall)
          scratch.addRange(instr.pos - 1, instr.pos);
        else
          scratch.addRange(instr.pos, instr.pos + 1);
        scratch.addUse(instr, decl.scratch[i]);
      });

      instr.inputs.forEach(function(input, i) {
        if (input instanceof Instruction) {
          if (!input.output.covers(instr.pos))
            input.output.addRange(block.start, instr.pos);
          input.output.addUse(instr, decl.inputs[i]);
        }
      });
    }
  }
};

Linearscan.prototype.splitFixed = function splitFixed() {
  Object.keys(this.intervals).forEach(function(id) {
    var interval = this.intervals[id];

    var uses = interval.uses.filter(function(use) {
      return use.kind.type === 'register' && use.kind.id;
    });

    for (var i = 0; i < uses.length - 1; i++) {
      var prev = uses[i];
      var next = uses[i + 1];

      this.splitBetween(interval, prev.instr.pos - 1, next.instr.pos);
    }
  }, this);
};

Linearscan.prototype.splitToPhis = function splitToPhis() {
  Object.keys(this.intervals).forEach(function(id) {
    var interval = this.intervals[id];

    for (var i = 0; i < interval.phiHints.length; i++) {
      var hint = interval.phiHints[i];
      var child = interval.childAt(hint.instr.pos);

      if (hint.instr.pos === child.start() || !child.covers(hint.instr.pos))
        continue;

      this.splitBetween(child, hint.instr.pos - 1, hint.instr.pos);
    }
  }, this);
};

function unhandledSort(a, b) {
  return a.start() - b.start();
}

Linearscan.prototype.walkIntervals = function walkIntervals() {
  var self = this;

  this.active = [];
  this.inactive = [];
  this.activeSpills = [];
  this.inactiveSpills = [];

  this.unhandled = Object.keys(this.intervals).map(function(id) {
    return this.intervals[id];
  }, this).filter(function(interval) {
    if (interval.ranges.length === 0)
      return false;

    if (interval.fixed) {
      this.active.push(interval);
      return false;
    }

    return true;
  }, this).sort(unhandledSort);

  // Split intervals at to_phi to allow hints to work fine
  this.splitToPhis();

  // Split all fixed intervals before their fixed uses
  this.splitFixed();

  function sortOut(active, inactive, position, free) {
    // Move active => inactive, handled
    for (var i = active.length - 1; i >= 0; i--) {
      var item = active[i];
      if (item.end() <= position) {
        active.splice(i, 1);
        free(item);
      } else if (!item.covers(position)) {
        active.splice(i, 1);
        inactive.push(item);
      }
    }

    // Move inactive => active, handled
    for (var i = inactive.length - 1; i >= 0; i--) {
      var item = inactive[i];
      if (item.end() <= position) {
        inactive.splice(i, 1);
        free(item);
      } else if (item.covers(position)) {
        inactive.splice(i, 1);
        active.push(item);
      }
    }
  }

  function freeReg() {
    // No-op
  }

  function freeSpill(spill) {
    self.freeSpill(spill.value);
  }

  while (this.unhandled.length !== 0) {
    var current = this.unhandled.shift();
    var position = current.start();
    assert(!prev || position >= prev, 'Unstable interval processing');

    sortOut(this.active, this.inactive, position, freeReg);
    sortOut(this.activeSpills, this.inactiveSpills, position, freeSpill);

    // Skip fixed uses
    assert(current.value.type === 'virtual');

    // Allocate register
    if (!this.allocateFree(current))
      this.allocateBlocked(current);

    // Push registers to active
    if (current.value.type === 'register')
      this.active.push(current);

    var prev = position;
  }
};

Linearscan.prototype.allocateFree = function allocateFree(current) {
  var freePos = {};
  for (var i = 0; i < this.registers.length; i++)
    freePos[this.registers[i]] = Infinity;

  for (var i = 0; i < this.active.length; i++)
    freePos[this.active[i].value.id] = 0;

  for (var i = 0; i < this.inactive.length; i++) {
    var inactive = this.inactive[i];
    var pos = inactive.nextIntersection(current);
    if (pos === null)
      continue;
    freePos[inactive.value.id] = Math.min(freePos[inactive.value.id], pos);
  }

  var maxPos = 0;
  var id = null;
  var hint = current.hint();
  var use = current.firstFixedUse('register', current.start());

  if (use !== null) {
    id = use.kind.id;
    maxPos = freePos[id];
  } else {
    for (var i = 0; i < this.registers.length; i++) {
      var reg = this.registers[i];
      if (freePos[reg] < maxPos ||
          freePos[reg] === maxPos &&
            !(hint !== null && hint.type === 'register' && hint.id === reg)) {
        continue;
      }
      maxPos = freePos[reg];
      id = reg;
    }
  }

  // Allocation failed :(
  if (maxPos <= current.start())
    return false;

  // Split required
  if (maxPos < current.end())
    this.splitBetween(current, current.start(), maxPos);

  current.value = { type: 'register', id: id };
  return true;
};

Linearscan.prototype.allocateBlocked = function allocateBlocked(current) {
  var usePos = {};
  var blockPos = {};
  for (var i = 0; i < this.registers.length; i++) {
    usePos[this.registers[i]] = Infinity;
    blockPos[this.registers[i]] = Infinity;
  }

  function set_use(i, val) {
    usePos[i] = Math.min(usePos[i], val);
  }

  for (var i = 0; i < this.active.length; i++) {
    var active = this.active[i];
    if (active.fixed) {
      blockPos[active.value.id] = 0;
      usePos[active.value.id] = 0;
    } else {
      var use = active.firstUse('register', current.start());
      if (use !== null)
        set_use(active.value.id, use.instr.pos);
    }
  }

  for (var i = 0; i < this.inactive.length; i++) {
    var inactive = this.inactive[i];
    var pos = inactive.nextIntersection(current);
    if (pos === null)
      continue;

    if (inactive.fixed) {
      blockPos[inactive.value.id] = pos;
      set_use(inactive.value.id, pos);
    } else {
      var use = inactive.firstUse('register', current.start());
      if (use !== null)
        set_use(inactive.value.id, use.instr.pos);
    }
  }

  var hint = current.hint();
  var maxPos = 0;
  var id = null;
  var use = current.firstFixedUse('register', current.start());

  if (use !== null) {
    id = use.kind.id;
    maxPos = usePos[id];
  } else {
    for (var i = 0; i < this.registers.length; i++) {
      var reg = this.registers[i];
      if (usePos[reg] < maxPos ||
          usePos[reg] === maxPos &&
            !(hint !== null && hint.type === 'register' && hint.id === reg)) {
        continue;
      }
      maxPos = usePos[reg];
      id = reg;
    }
  }

  var firstUse = current.firstUse('register', 0);
  if (firstUse === null || maxPos < firstUse.instr.pos) {
    // Spill current, all others have register uses before this one
    if (hint !== null && hint.type === 'stack') {
      current.value = hint;

      // Remove hint from free list
      this.spills = this.spills.filter(function(spill) {
        return spill.id !== hint.id;
      });
    } else {
      current.value = this.getSpill();
    }
    this.activeSpills.push(current);
    if (firstUse !== null)
      this.splitBetween(current, current.start(), firstUse.instr.pos);
  } else {
    assert(blockPos[id] !== 0,
           'Blocked, but requires register at ' + firstUse.instr.type);

    current.value = { type: 'register', id: id };

    if (blockPos[id] < current.end())
      this.splitBetween(current, current.start(), blockPos[id]);
    this.splitAndSpill(current);
  }
};

Linearscan.prototype.getSpill = function getSpill() {
  var spill;

  if (this.spills.length === 0)
    spill = { type: 'stack', id: this.maxSpill++ };
  else
    spill = this.spills.pop();

  return spill;
};

Linearscan.prototype.freeSpill = function freeSpill(spill) {
  this.spills.push(spill);
};

Linearscan.prototype.splitAndSpill = function splitAndSpill(interval) {
  var queue = [];

  for (var i = 0; i < this.active.length; i++) {
    var active = this.active[i];
    if (active.value.id === interval.value.id)
      queue.push(active);
  }

  for (var i = 0; i < this.inactive.length; i++) {
    var inactive = this.inactive[i];
    var pos = inactive.nextIntersection(interval);
    if (pos === null)
      continue;

    if (inactive.value.id === interval.value.id)
      queue.push(inactive);
  }

  var splitEnd = interval.start();
  for (var i = 0; i < queue.length; i++) {
    var inter = queue[i];

    var lastUse = inter.lastUse('register', splitEnd);
    var splitStart;
    if (lastUse === null)
      splitStart = inter.start();
    else
      splitStart = lastUse.instr.pos;

    // Do not split interval before the current
    var child = this.splitBetween(inter, splitStart, splitEnd, true);
    child.value = this.getSpill();
    this.activeSpills.push(child);

    var use = inter.firstUse('register', splitStart);
    if (use !== null)
      this.splitBetween(child, splitEnd, use.instr.pos);
  }
};

Linearscan.prototype.resolveFlow = function resolveFlow() {
  for (var i = 0; i < this.blocks.length; i++) {
    var block = this.blocks[i];
    for (var j = 0; j < block.successors.length; j++) {
      var succ = block.successors[j];

      var gap = block.successors.length === 2 ?
          this.instructions[succ.start] :
          this.instructions[block.end - 1];

      Object.keys(succ.liveIn).forEach(function(id) {
        var interval = this.intervals[id];
        var from = interval.childAt(block.end - 1);
        var to = interval.childAt(succ.start);

        if (from !== to)
          gap.pendingMoves.push({ from: from, to: to, resolved: true });
      }, this);
    }
  }
};

Linearscan.prototype.resolveGaps = function resolveGaps() {
  Object.keys(this.instructions).map(function(id) {
    return this.instructions[id];
  }, this).forEach(function(instr) {
    if (instr.hasGap)
      instr.resolveMoves();
  });
};

Linearscan.prototype.allocate = function allocate() {
  this.spills = [];
  this.maxSpill = 0;

  this.buildIntervals();
  this.walkIntervals();
  this.resolveFlow();
  this.resolveGaps();
};

Linearscan.prototype.splitBetween = function splitBetween(interval,
                                                          from,
                                                          to,
                                                          noPush) {
  var splitPos = to;
  var bestDepth = Infinity;
  var boundary = false;

  for (var i = 0; i < this.blocks.length; i++) {
    var block = this.blocks[i];
    if (block.loopDepth >= bestDepth)
      continue;

    if (!(from < block.end && block.end <= to))
      continue;

    bestDepth = block.loopDepth;
    splitPos = block.end;
    boundary = true;
  }

  if (from === block.start)
    boundary = true;

  // Insert movement if not on a block edge
  var gap = this.instructions[splitPos];
  if (!gap.hasGap) {
    splitPos--;
    gap = this.instructions[splitPos];
  }
  assert(from <= splitPos && splitPos <= to, 'Split OOB');
  assert(gap.hasGap);

  var child = this.createInterval();
  interval.split(splitPos, child);

  if (!noPush)
    binaryInsert(this.unhandled, child, unhandledSort);

  // If not a block boundary, and not a to_phi - insert move
  var next = this.instructions[splitPos + 1];

  if (!boundary && !(next.type === 'to_phi' && next.output === interval))
    gap.pendingMoves.push({ from: interval, to: child });

  return child;
};

Linearscan.prototype.verifyPhis = function verifyPhis() {
  for (var i = 0; i < this.blocks.length; i++) {
    var block = this.blocks[i];

    var phis = {};
    var phiCount = 0;
    for (var j = 0; j < block.instructions.length; j++) {
      var instr = block.instructions[j];
      if (instr.type !== 'phi')
        continue;
      assert(instr.id, 'Every phi should have an id');
      assert(!phis[instr.id], 'Double phi!');
      phis[instr.id] = true;
      phiCount++;
    }

    if (phiCount === 0)
      continue;

    assert(block.predecessors.length === 2,
           'Blocks with phis should have 2 predecessors');
    for (var j = 0; j < block.predecessors.length; j++) {
      var pred = block.predecessors[j];
      var found = {};

      for (var k = 0; k < pred.instructions.length; k++) {
        var instr = pred.instructions[k];

        if (instr.type !== 'to_phi')
          continue;
        assert(phis[instr.phi.id], 'to_phi without phi in successor');

        found[instr.phi.id] = true;
      }

      assert(Object.keys(found).length === phiCount,
             'Phi mismatch from: ' + pred.id + ' to: ' + block.id);
    }
  }
};

Linearscan.prototype.strip = function strip() {
  return this.blocks.map(function(block) {
    return block.strip();
  });
};

Linearscan.prototype.toJSON = function toJSON() {
  var intervals = [];
  var instructions = [];

  var blocks = this.blocks.map(function(block) {
    return block.toJSON();
  });

  Object.keys(this.intervals).forEach(function(id) {
    intervals[id] = this.intervals[id].toJSON();
  }, this);

  Object.keys(this.instructions).forEach(function(pos) {
    instructions[pos] = this.instructions[pos].toJSON();
  }, this);

  return {
    intervals: intervals,
    blocks: blocks,
    instructions: instructions
  };
};

Linearscan.prototype.createInterval = function createInterval() {
  var id = this.intervalId++;
  var interval = new Interval(this, id);

  this.intervals[id] = interval;

  return interval;
};

//
// Various entities
//

function Block(ls, block, instructions) {
  this.id = block.id;
  this.uid = ls.blockId++;
  this.instructions = block.instructions.map(function(instr) {
    var res = new Instruction(ls, this, instr);
    if (res.id)
      instructions[res.id] = res;
    return res;
  }, this);

  this.successors = block.successors || [];
  this.predecessors = [];

  // Needed for reordering
  this.incomingForward = 0;

  this.loopStart = false;
  this.loopEnd = null;
  this.loopDepth = 0;
  this.loopIndex = null;

  // Enumeration
  this.start = null;
  this.end = null;

  // Interval construction
  // TODO(indutny): use bitmaps, perhaps?
  this.liveGen = {};
  this.liveKill = {};
  this.liveIn = {};
  this.liveOut = {};
}

Block.prototype.init = function init(blocks, instructions) {
  this.successors = this.successors.map(function(id) {
    var res = blocks[id];
    res.predecessors.push(this);
    res.incomingForward++;
    return res;
  }, this);

  this.instructions.forEach(function(instr) {
    instr.init(instructions);
  });
};

Block.prototype.strip = function strip() {
  return {
    id: this.id,
    instructions: this.instructions.map(function(instr) {
      return instr.strip();
    }).filter(function(instr) {
      return !(instr.type === 'gap' && instr.moves.length === 0) &&
             !(instr.type === 'phi') &&
             !(instr.type === 'to_phi' &&
               instr.output.type === instr.inputs[0].type &&
               instr.output.id === instr.inputs[0].id);
    }),
    successors: this.successors.map(function(succ) {
      return succ.id;
    })
  };
};

Block.prototype.toJSON = function toJSON() {
  return {
    id: this.id,
    start: this.start,
    end: this.end,
    loop_depth: this.loopDepth,
    successors: this.successors.map(function(succ) {
      return succ.id;
    })
  };
};

Block.prototype.markLoop = function markLoop(end) {
  this.loopStart = true;
  this.loopEnd = end;
  this.incomingForward--;
  assert(this.predecessors.length === 2);
};

function Instruction(ls, block, instr) {
  this.ls = ls;
  this.id = instr.id || null;
  this.type = instr.type;
  this.decl = ls.declarations[this.type];
  this.block = block;

  this.hasCall = this.decl.call;
  var hasGap = this.type === 'gap' || this.hasCall;
  this.hasGap = hasGap;
  this.moves = hasGap ? [] : null;
  this.pendingMoves = hasGap ? [] : null;

  this.inputs = instr.inputs ? instr.inputs.slice() : [];
  this.output = this.type === 'to_phi' || this.decl.output === null ?
      null :
      ls.createInterval();
  this.scratch = this.decl.scratch.map(function(scratch) {
    return ls.createInterval();
  });
  this.pos = null;
  this.initialized = false;

  // Used only for `to_phi` type
  this.phi = null;
}

Instruction.prototype.init = function init(instructions) {
  this.initialized = true;

  if (this.type === 'to_phi') {
    var phi = this.inputs.shift();
    phi = instructions[phi.id];
    assert(phi, 'Phi not found: ' + phi.id);
    assert(this.inputs.length === 1, 'Not enough inputs at to_phi:' + this.id);

    // to_phi has a phi as it's output
    this.output = phi.output;
    this.phi = phi;
  }

  this.inputs = this.inputs.map(function(input) {
    if (!input || input.type !== 'instruction')
      return input;

    var res = instructions[input.id];
    assert(res, 'Input not found: ' + input.id);
    if (!res.initialized)
      res.init(instructions);
    return res;
  }, this);

  if (this.phi !== null)
    this.output.phiHints.push({ instr: this, hint: this.inputs[0].output });
};

Instruction.prototype.resolveMoves = function resolveMoves() {
  // Do parallel move resolution
  var moves = this.pendingMoves;
  this.pendingMoves = [];
  var status = moves.map(function() { return 'to_move' });

  moves = moves.map(function(move) {
    if (move.resolved)
      return move;

    var neighboors = move.from.getNeighbors(this.pos);
    return {
      from: neighboors.left,
      to: neighboors.right
    };
  }, this);

  var out = this.moves;

  // Put all moves from call instruction to the previous gap
  if (this.hasCall)
    out = this.ls.instructions[this.pos - 1].moves;

  for (var i = 0; i < moves.length; i++)
    if (status[i] === 'to_move')
      this.resolveOne(moves, status, i, out);
};

Instruction.prototype.resolveOne = function resolveOne(moves, status, i, res) {
  var current = moves[i];

  var from = current.from.value;
  var to = current.to.value;

  // Ignore nop-moves
  if (from.type === to.type && from.id === to.id) {
    status[i] = 'moved';
    return;
  }

  // Detect cycles
  var circular = false;
  var sentinel = false;
  status[i] = 'moving';
  for (var j = 0; j < moves.length; j++) {
    var next = moves[j];
    var nextFrom = next.from.value;

    if (i === j || nextFrom.type !== to.type || nextFrom.id !== to.id)
      continue;

    // (current) -> (next)
    if (status[j] === 'to_move') {
      if (this.resolveOne(moves, status, j, res)) {
        if (circular)
          throw new Error('Two move cycles');
        circular = true;
      }
    } else if (status[j] === 'moving') {
      sentinel = true;
    } else if (status[j] === 'moved') {
      // Ignore
    }
  }

  if (circular)
    res.push({ type: 'swap', from: from, to: to });
  else if (!sentinel)
    res.push({ type: 'move', from: from, to: to });

  status[i] = 'moved';

  return circular || sentinel;
};

Instruction.prototype.strip = function strip() {
  var inputs = this.inputs;

  inputs = inputs.map(function(input) {
    if (input instanceof Instruction)
      return input.output.childAt(this.pos).value;
    else
      return input;
  }, this);

  return {
    id: this.id,
    type: this.type,
    inputs: inputs,
    moves: this.moves,
    scratch: this.scratch.map(function(interval) {
      return interval.childAt(this.pos).value;
    }, this),
    output: this.output === null ? null : this.output.childAt(this.pos).value
  };
};

Instruction.prototype.toJSON = function toJSON() {
  var inputs = this.inputs;

  inputs = inputs.map(function(input) {
    if (input instanceof Instruction)
      return { type: 'instruction', id: input.pos };
    else
      return input;
  });

  var gap_state = null;
  if (this.moves) {
    gap_state = {
      actions: this.moves
    };
  }

  return {
    id: this.pos,
    block: this.block.id,
    kind: this.type,
    inputs: inputs,
    temporary: this.scratch.map(function(interval) {
      return { type: 'interval', id: interval.id };
    }),
    output: this.output === null ? null : this.output.id,
    gap_state: gap_state
  };
};

function Interval(ls, id) {
  this.ls = ls;
  this.id = id;
  this.parent = null;
  this.children = [];
  this.fixed = false;
  this.value = { type: 'virtual', id: this.id };
  this.uses = [];
  this.ranges = [];
  this.phiHints = [];
}

Interval.prototype.fix = function fix(value) {
  this.fixed = true;
  this.value = value;

  return this;
};

function useSort(a, b) {
  return a.instr.pos - b.instr.pos;
}

Interval.prototype.addUse = function addUse(instr, kind) {
  binaryInsert(this.uses, { instr: instr, kind: kind }, useSort);
};

function rangeSort(a, b) {
  return a.start - b.start;
}

Interval.prototype.addRange = function addRange(start, end) {
  if (this.ranges.length === 0 || this.ranges[0].start !== end)
    binaryInsert(this.ranges, { start: start, end: end }, rangeSort);
  else
    this.ranges[0].start = start;
};

Interval.prototype.shortenRange = function shortenRange(start) {
  if (this.ranges.length === 0)
    this.addRange(start, start + 1);
  else
    this.ranges[0].start = start;
};

Interval.prototype.start = function start() {
  return this.ranges[0].start;
};

Interval.prototype.end = function end() {
  return this.ranges[this.ranges.length - 1].end;
};

Interval.prototype.covers = function covers(pos) {
  // TODO(indutny): binary search?
  for (var i = 0; i < this.ranges.length; i++) {
    var range = this.ranges[i];
    if (range.start <= pos && pos < range.end)
      return true;
  }

  return false;
};

Interval.prototype.nextIntersection = function nextIntersection(other) {
  for (var i = 0; i < this.ranges.length; i++) {
    var a = this.ranges[i];
    for (var j = 0; j < other.ranges.length; j++) {
      var b = other.ranges[j];
      if (b.start <= a.start && a.start < b.end)
        return a.start;
      if (a.start <= b.start && b.start < a.end)
        return b.start;
    }
  }
  return null;
};

Interval.prototype.firstUse = function firstUse(type, after) {
  var res = null;
  this.uses.some(function(use) {
    if (use.instr.pos >= after && use.kind.type === type) {
      res = use;
      return true;
    }
    return false;
  });
  return res;
};

Interval.prototype.firstFixedUse = function firstFixedUse(type, after) {
  var res = null;
  this.uses.some(function(use) {
    if (use.instr.pos >= after && use.kind.type === type && use.kind.id) {
      res = use;
      return true;
    }
    return false;
  });
  return res;
};

Interval.prototype.lastUse = function lastUse(type, after) {
  var res = null;
  for (var i = this.uses.length - 1; i >= 0; i--) {
    var use = this.uses[i];
    if (use.instr.pos <= after && use.kind.type === type)
      return use;
  }
  return null;
};

Interval.prototype.split = function split(pos, child) {
  var parent = this.parent || this;

  child.parent = parent;
  child.phiHints = parent.phiHints;

  for (var i = 0; i < this.ranges.length; i++) {
    var range = this.ranges[i];

    if (range.end <= pos)
      continue;

    if (range.start < pos) {
      child.ranges.push({ start: pos, end: range.end });
      range.end = pos;
      i++;
    }
    break;
  }
  child.ranges = child.ranges.concat(this.ranges.slice(i));
  this.ranges = this.ranges.slice(0, i);

  assert(child.ranges.length > 0 && this.ranges.length > 0, 'Split error');

  for (var i = 0; i < this.uses.length; i++) {
    var use = this.uses[i];
    var usePos = use.instr.pos;

    if (usePos > pos)
      break;
    if (usePos === pos) {
      if (this.ls.instructions[pos].hasCall)
        i++;
      break;
    }
  }
  child.uses = this.uses.slice(i);
  this.uses = this.uses.slice(0, i);

  binaryInsert(parent.children, child, unhandledSort);
};

Interval.prototype.hint = function hint() {
  var hints = this.phiHints.filter(function(hint) {
    return hint.hint.value.type === 'register';
  });

  var interval;
  if (hints.length > 0) {
    interval = hints[hints.length - 1].hint;
  } else if (this.parent) {
    // Choose previous child
    var i = this.parent.children.indexOf(this);
    interval = this.parent.children[i - 1] || this.parent;
  }

  if (!interval)
    return null;
  return interval.value.type === 'virtual' ? null : interval.value;
};

Interval.prototype.childAt = function childAt(pos) {
  if (this.parent)
    return this.parent.childAt(pos);

  var hasUse = this.uses.some(function(use) {
    return use.instr.pos === pos;
  });
  if (pos < this.end() || hasUse)
    return this;

  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    var hasUse = child.uses.some(function(use) {
      return use.instr.pos === pos;
    });
    if (pos < child.end() || hasUse)
      return child;
  }

  return this;
};

Interval.prototype.getNeighbors = function getNeighbors(pos) {
  if (this.parent)
    return this.parent.getNeighbors(pos);

  assert(this.end() <= pos, 'split before end of parent?');
  var prev = this;
  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    if (child.start() >= pos)
      return { left: prev, right: child };

    prev = child;
  }
  assert(false, 'No children');
};

Interval.prototype.toJSON = function toJSON() {
  return {
    id: this.id,
    parent: this.parent && this.parent.id,
    children: this.children.map(function(child) {
      return child.id;
    }),
    ranges: this.ranges,
    uses: this.uses.map(function(use) {
      return {
        pos: use.instr.pos,
        kind: use.kind.type === 'register' && use.kind.id ?
            'fixed' :
            use.kind.type
      };
    }),
    value: this.value
  };
};

function binaryInsert(list, item, compare) {
  var start = 0,
      end = list.length;

  while (start < end) {
    var pos = (start + end) >> 1;
    var cmp = compare(item, list[pos]);

    if (cmp === 0) {
      start = pos;
      end = pos;
      break;
    } else if (cmp < 0) {
      end = pos;
    } else {
      start = pos + 1;
    }
  }

  list.splice(start, 0, item);
}

},{"assert":2}],8:[function(require,module,exports){
var assert = require('assert');
var tarjan = require('tarjan').create();

function Phi(input) {
  this.input = input;
  this.counters = {};
  this.stacks = {};
  this.map = {};
  this.predecessors = {};
  this.prefix = 'ssa/';
}
module.exports = Phi;

Phi.run = function run(input) {
  return new Phi(input).run();
};

Phi.prototype.run = function run() {
  var input = this.input;

  // Construct dominator tree and find dominance frontier
  tarjan(input);

  // Construct map of blocks by id
  for (var i = 0; i < input.length; i++) {
    var block = input[i];
    this.map[block.id] = block;
    this.predecessors[block.id] = [];
  }

  // Construct predecessors map
  for (var i = 0; i < input.length; i++) {
    var block = input[i];
    for (var j = 0; j < block.successors.length; j++) {
      var succ = block.successors[j];

      this.predecessors[succ].push(block);
    }
  }

  // Insert phis at frontiers
  this.insertPhis();

  // Replace variables with ids
  this.search(input[0]);

  return input;
};

Phi.prototype.insertPhis = function insertPhis() {
  var input = this.input;
  var inserted = {};
  var index = 0;

  for (var i = 0; i < input.length; i++) {
    var block = input[i];

    for (var j = 0; j < block.instructions.length; j++) {
      var instr = block.instructions[j];

      if (!instr.assign)
        continue;
      var name = instr.id;
      var queue = [ block ];
      while (queue.length > 0) {
        var current = queue.shift();
        for (var k = 0; k < current.frontier.length; k++) {
          var front = this.map[current.frontier[k]];

          if (!inserted[name])
            inserted[name] = {};
          if (inserted[name][front.id])
            continue;
          queue.push(front);
          inserted[name][front.id] = true;

          var pred = this.predecessors[front.id];
          front.instructions.unshift({
            type: 'phi',
            assign: true,
            id: name,
            inputs: []
          });

          // Insert `to_phi`
          for (var l = 0; l < pred.length; l++) {
            var b = pred[l];
            b.instructions.push({
              type: 'to_phi',
              inputs: [
                { type: 'variable', id: name },
                { type: 'variable', id: name }
              ]
            });
          }
        }
      }
    }
  }
};

Phi.prototype.push = function push(id) {
  if (!this.counters[id])
    this.counters[id] = 0;
  var counter = this.counters[id]++;
  var res = this.prefix + id + counter;

  if (!this.stacks[id])
    this.stacks[id] = [ res ];
  else
    this.stacks[id].push(res);

  return res;
};

Phi.prototype.pop = function pop(id) {
  this.stacks[id].pop();
};

Phi.prototype.search = function search(block) {
  var pushes = [];
  for (var i = 0; i < block.instructions.length; i++) {
    var instr = block.instructions[i];

    // Replace inputs
    if (instr.type !== 'phi' && instr.inputs) {
      var j = 0;

      // Skip dst in to_phi
      if (instr.type === 'to_phi')
        j++;

      for (; j < instr.inputs.length; j++) {
        var input = instr.inputs[j];

        if (input.type !== 'variable')
          continue;
        var stack = this.stacks[input.id];
        assert(stack, 'Get without assignment');
        instr.inputs[j] = { type: 'instruction', id: stack[stack.length - 1] };
      }
    }

    // Replace output
    if (instr.assign) {
      instr.assign = false;
      pushes.push(instr.id);
      instr.id = this.push(instr.id);
    }
  }

  // Replace to_phi's output in predecessors
  var pred = this.predecessors[block.id];
  for (var i = 0; i < pred.length; i++) {
    var p = pred[i];

    for (var j = p.instructions.length - 1; j >= 0; j--) {
      var to_phi = p.instructions[j];
      if (to_phi.type !== 'to_phi')
        break;

      var out = to_phi.inputs[0];
      if (out.type !== 'variable')
        continue;

      var stack = this.stacks[out.id];
      assert(stack, 'to_phi without later phi');
      to_phi.inputs[0] = { type: 'instruction', id: stack[stack.length - 1] };
    }
  }

  for (var i = 0; i < block.children.length; i++) {
    var child = this.map[block.children[i]];
    this.search(child);
  }

  // Restore .stacks
  for (var i = 0; i < pushes.length; i++)
    this.pop(pushes[i]);
};

},{"assert":2,"tarjan":9}],9:[function(require,module,exports){
var tarjan = exports;

function Context() {
  function State(i) {
    this.uid = i;
    this.parent = null;
    this.succ = [];
    this.pred = [];
    this.id = null;
    this.semi = null;
  }

  function doEval(node, forest) {
    var state = node._tarjanState;
    if (forest.ancestor[state.id] === null)
      return node;

    doCompress(node, forest);
    return forest.label[state.id];
  }

  function doCompress(node, forest) {
    var state = node._tarjanState;
    var parent = forest.ancestor[state.id];
    var gparent = forest.ancestor[parent._tarjanState.id];

    if (gparent === null)
      return;

    doCompress(parent, forest);

    var label = forest.label[state.id];
    var plabel = forest.label[parent._tarjanState.id];
    if (plabel._tarjanState.semi < label._tarjanState.semi)
      forest.label[state.id] = plabel;
    forest.ancestor[state.id] = gparent;
  }

  function DFS(node, map, result) {
    var state = node._tarjanState;

    state.id = result.push(node) - 1;
    state.semi = state.id;

    for (var i = 0; i < node.$successors.length; i++) {
      var child = map[node.$successors[i]];
      var childState = child._tarjanState;
      if (childState.semi === null) {
        childState.parent = node;
        DFS(child, map, result);
      }

      state.succ.push(child);
      childState.pred.push(node);
    }
  }

  // NOTE: Actually it is an SNCA implementation, but still by Tarjan
  function computeDominatorTree(nodes) {
    // Initialize forest
    var forest = { ancestor: [], label: [] };
    for (var i = 0; i < nodes.length; i++) {
      forest.ancestor[i] = null;
      forest.label[i] = nodes[i];
    }

    // Find semi-dominators
    for (var i = nodes.length - 1; i > 0; i--) {
      var node = nodes[i];
      var state = node._tarjanState;

      for (var j = 0; j < state.pred.length; j++) {
        var pred = state.pred[j];
        var u = doEval(pred, forest);

        if (u._tarjanState.semi < state.semi)
          state.semi = u._tarjanState.semi;
      }

      forest.ancestor[node._tarjanState.id] = state.parent;
    }

    // Compute idom as a NCA(node.parent, node.semi) in DFS tree
    var idom = new Array(nodes.length);
    idom[0] = 0;
    for (var i = 1; i < nodes.length; i++)
      idom[i] = nodes[i]._tarjanState.parent._tarjanState.id;

    for (var i = 1; i < nodes.length; i++) {
      var node = nodes[i];
      var state = node._tarjanState;

      var index = idom[state.id];
      while (index > state.semi)
        index = idom[index];
      idom[state.id] = index;
    }

    // Output dominator tree
    nodes[0].$parent = null;
    nodes[0].$children = [];
    for (var i = 1; i < nodes.length; i++) {
      if (!nodes[i].$children)
        nodes[i].$children = [];
      nodes[i].$parent = nodes[idom[i]];
      if (nodes[i].$parent.$children)
        nodes[i].$parent.$children.push(nodes[i].id);
      else
        nodes[i].$parent.$children = [ nodes[i].id ];
    }
  }

  // Cytron frontier algorithm
  function computeFrontier(nodes, map) {
    // Populate exit nodes
    var queue = [];
    for (var i = 0; i < nodes.length; i++)
      if (nodes[i].$children.length === 0)
        queue.push(nodes[i]);

    // Go up from them
    var df = [];
    while (queue.length > 0) {
      var node = queue.shift();
      var state = node._tarjanState;

      var visitedChildren = true;
      for (var i = 0; i < node.$children.length; i++) {
        var child = map[node.$children[i]];
        if (!df[child._tarjanState.id]) {
          visitedChildren = false;
          break;
        }
      }

      // Visit node later, not all children were visited yet
      if (!visitedChildren) {
        queue.push(node);
        continue;
      }

      if (df[state.id])
        continue;
      df[state.id] = {};

      if (state.parent)
        queue.push(state.parent);

      // Local
      for (var i = 0; i < state.succ.length; i++) {
        var succ = state.succ[i];
        if (succ.$parent !== node)
          df[state.id][succ._tarjanState.id] = true;
      }

      // Up
      for (var i = 0; i < node.$children.length; i++) {
        var child = map[node.$children[i]];
        var dfKeys = Object.keys(df[child._tarjanState.id]);

        for (var j = 0; j < dfKeys.length; j++) {
          var childDom = nodes[dfKeys[j]];

          if (childDom.$parent !== node)
            df[state.id][dfKeys[j]] = true;
        }
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var frontier = df[nodes[i]._tarjanState.id];
      if (frontier)
        frontier = Object.keys(frontier);
      else
        frontier = [];

      for (var j = 0; j < frontier.length; j++)
        frontier[j] = nodes[frontier[j]].id;
      nodes[i].$frontier = frontier;
    }
  }

  function run(vertexes) {
    // Initialize state
    vertexes.forEach(function(vertex, i) {
      vertex._tarjanState = new State(i);
    });

    // DFS Traverse tree, populating nodes array
    var queue = [ vertexes[0] ];
    var nodes = [];
    var map = {};
    for (var i = 0; i < vertexes.length; i++)
      map[vertexes[i].id] = vertexes[i];
    DFS(vertexes[0], map, nodes);

    // Compute dominator tree
    computeDominatorTree(nodes);

    // Compute dominance frontier
    computeFrontier(nodes, map);

    // Remove internal properties
    for (var i = 0; i < nodes.length; i++)
      delete nodes[i]._tarjanState;
  }

  return run;
}

exports.create = function create(keys) {
  if (!keys)
    keys = {};

  var src = Context.toString()
               .replace(/^function.*{|}$/g, '')
               .replace(/\$successors/g, keys.successors || 'successors')
               .replace(/\$parent/g, keys.parent || 'parent')
               .replace(/\$children/g, keys.children || 'children')
               .replace(/\$frontier/g, keys.frontier || 'frontier');

  var ctx = new Function(src);
  return ctx();
};

},{}],10:[function(require,module,exports){
exports.parse = function parse(source) {
  var lines = source.toString().replace(/^function.*{(\/\*)?|(\*\/)}$/g, '')
                               .split(/\r\n|\r|\n/g);
  var result = [];
  var block = null;

  lines.forEach(function(line) {
    var match;

    // Block
    var re = /^\s*block\s+([\w\d]+)(?:\s+->\s+([\w\d]+)(?:\s*,\s*([\w\d]+))?)?/;
    match = line.match(re);
    if (match !== null) {
      if (block !== null)
        result.push(block);

      block = { id: match[1], instructions: [], successors: [] };
      if (match[2])
        block.successors.push(match[2]);
      if (match[3])
        block.successors.push(match[3]);
      return;
    }

    // Instruction
    match = line.match(/^\s*(?:(@)?([\w\d]+)\s*=\s*)?([\w\d]+)(?:\s+(.+))?\s*$/);
    if (match === null)
      return;

    var instr = {
      assign: !!match[1],
      id: match[2] || null,
      type: match[3],
      inputs: match[4] && match[4].split(/\s*,\s*/g).map(function(input) {
        if (/^%/.test(input))
          return { type: 'js', value: JSON.parse(input.slice(1)) };
        else if (/^@/.test(input))
          return { type: 'variable', id: input.slice(1) };
        else
          return { type: 'instruction', id: input };
      }) || null
    };
    block.instructions.push(instr);
  });

  if (block !== null)
    result.push(block);

  return result;
};

exports.stringify = function stringify(blocks) {
  function valueToStr(value) {
    if (value.type === 'js')
      return '%' + JSON.stringify(value.value);
    else if (value.type === 'variable')
      return '@' + value.id;
    else if (value.type === 'register')
      return '$' + value.id;
    else if (value.type === 'stack')
      return '[' + value.id + ']';
    else
      return value.id;
  }

  var res = '';
  blocks.forEach(function(block) {
    res += 'block ' + block.id;
    if (block.successors.length > 0)
      res += ' -> ' + block.successors.join(', ');
    res += '\n';

    block.instructions.forEach(function(instr) {
      res += '  ';
      if (instr.output)
        res += valueToStr(instr.output) + ' = ';
      else if (instr.id)
        res += (instr.assign ? '@' : '') + instr.id + ' = ';

      res += instr.type;
      if (instr.inputs && instr.inputs.length > 0)
        res += ' ' + instr.inputs.map(valueToStr).join(', ');
      if (instr.scratch && instr.scratch.length > 0)
        res += ' |' + instr.scratch.map(valueToStr).join(', ') + '|';
      if (instr.moves && instr.moves.length) {
        res += ' {';
        res += instr.moves.map(function(move) {
          var from = valueToStr(move.from);
          var to = valueToStr(move.to);
          if (move.type === 'move')
            return from + ' => ' + to;
          else
            return from + ' <=> ' + to;
        }).join(', ');
        res += '}';
      }
      res += '\n';
    });
  });
  return res;
};

},{}],11:[function(require,module,exports){
var assert = require('assert');

function SSA(ast, parent) {
  this.blockId = 0;
  this.valueId = 0;
  this.parent = parent || null;
  this.root = this.parent || this;

  this.ast = ast;
  this.scope = {};
  this.blocks = [];
  this.children = [];
  this.block = this.createBlock();
  this.contextSize = 0;
  this.loop = null;
  this.initialized = false;

  if (this.parent)
    this.parent.children.push(this);
}
module.exports = SSA;

SSA.construct = function construct(ast, parent) {
  return new SSA(ast, parent).construct();
};

SSA.prototype.construct = function construct() {
  var ast = this.ast;

  // Resolve local variables
  this.buildScope(ast);

  // Initialize local variables
  this.initializeLocals();

  // Build CFG
  this.visit(ast);

  // Return JSON
  return [ this.toJSON() ].concat(this.children.map(function(child) {
    return child.toJSON();
  }));
};

SSA.prototype.toJSON = function toJSON() {
  return this.blocks.map(function(block) {
    return block.toJSON();
  })
};

SSA.prototype.buildScope = function buildScope(node) {
  var isRoot = node === this.ast;
  var isFn = node.type === 'FunctionDeclaration' ||
             node.type === 'FunctionExpression';
  if (isFn) {
    var name = node.id.name;
    if (name) {
      var self;
      if (isRoot) {
        self = new Slot();
        self.type = 'self';
      } else if (node.type === 'FunctionDeclaration') {
        self = new Slot();
        self.initial = node;
      }
      this.scope[name] = self;
    }

    if (isRoot) {
      for (var i = 0; i < node.params.length; i++) {
        var arg = new Slot();
        arg.initial = this.add('loadArg', [ this.createValue('js', i) ]);
        this.scope[node.params[i].name] = arg;
      }
    }
  } else if (node.type === 'VariableDeclaration') {
    for (var i = 0; i < node.declarations.length; i++)
      this.scope[node.declarations[i].id.name] = new Slot();
  }

  // Visit direct children
  if ((!isFn || isRoot) && node.body) {
    if (Array.isArray(node.body)) {
      for (var i = 0; i < node.body.length; i++)
        this.buildScope(node.body[i]);
    } else {
      this.buildScope(node.body);
    }
  }

  if (node.consequent)
    this.buildScope(node.consequent);
  if (node.alternate)
    this.buildScope(node.alternate);

  if (node.type === 'ForStatement')
    this.buildScope(node.init);
};

SSA.prototype.initializeLocals = function initializeLocals() {
  Object.keys(this.scope).forEach(function(name) {
    var slot = this.scope[name];

    // Ignore global and non-local slots
    if (slot.type === 'global' ||
        slot.type === 'context' && slot.depth !== 0) {
      return;
    }

    var value = slot.initial instanceof Value ?
        slot.initial :
        this.visit(slot.initial || { type: 'Literal', value: undefined });

    this.set(name, value);
  }, this);
  this.initialized = true;
};

SSA.prototype.lookup = function lookup(name, context) {
  if (this.scope.hasOwnProperty(name)) {
    var res = this.scope[name];

    if (!context || res.type !== 'local')
      return res;

    // Local => context
    res.toContext(this);
    return res;
  } else {
    var res;

    // Lookup in parent
    if (this.parent) {
      res = new Slot(this.parent.lookup(name, true));
    // Global variable
    } else {
      res = new Slot();
      res.type = 'global';
      res.key = name;
    }
    this.scope[name] = res;
    return res;
  }
};

// Visitors

SSA.prototype.visit = function visit(node) {
  // Top-level node, visit direct children
  if (node === this.ast) {
    if (Array.isArray(node.body)) {
      for (var i = 0; i < node.body.length; i++)
        this.visit(node.body[i]);
    } else {
      this.visit(node.body);
    }
    return;
  }

  var res;
  if (node.type === 'ExpressionStatement')
    res = this.visit(node.expression);
  else if (node.type === 'VariableDeclaration')
    res = this.visitVar(node);
  else if (node.type === 'Literal')
    res = this.visitLiteral(node);
  else if (node.type === 'Identifier')
    res = this.visitIdentifier(node);
  else if (node.type === 'AssignmentExpression')
    res = this.visitAssign(node);
  else if (node.type === 'SequenceExpression')
    res = this.visitSeq(node);
  else if (node.type === 'BinaryExpression')
    res = this.visitBinary(node);
  else if (node.type === 'UnaryExpression')
    res = this.visitUnary(node);
  else if (node.type === 'MemberExpression')
    res = this.visitMember(node);
  else if (node.type === 'LogicalExpression')
    res = this.visitLogic(node);
  else if (node.type === 'UpdateExpression')
    res = this.visitUpdate(node);
  else if (node.type === 'NewExpression')
    res = this.visitCall('new', node);
  else if (node.type === 'CallExpression')
    res = this.visitCall('call', node);
  else if (node.type === 'ArrayExpression')
    res = this.visitArray(node);
  else if (node.type === 'ObjectExpression')
    res = this.visitObject(node);
  else if (node.type === 'ConditionalExpression')
    res = this.visitConditional(node);
  else if (node.type === 'ThisExpression')
    res = this.visitThis(node);
  else if (node.type === 'ReturnStatement')
    res = this.visitReturn(node);
  else if (node.type === 'IfStatement')
    res = this.visitIf(node);
  else if (node.type === 'WhileStatement')
    res = this.visitWhile(node);
  else if (node.type === 'DoWhileStatement')
    res = this.visitDoWhile(node);
  else if (node.type === 'ForStatement')
    res = this.visitFor(node);
  else if (node.type === 'BreakStatement')
    res = this.visitBreak(node);
  else if (node.type === 'ContinueStatement')
    res = this.visitContinue(node);
  else if (node.type === 'BlockStatement')
    res = this.visitBlock(node);
  else if (node.type === 'EmptyStatement' || node.type === 'DebuggerStatement')
    res = null;
  // Should be already processed in initialization of variables
  else if (node.type === 'FunctionDeclaration')
    res = this.visitFunction(node);
  else if (node.type === 'FunctionExpression')
    res = this.visitFunction(node);
  else
    throw new Error('Unknown node type: ' + node.type);

  return res;
};

SSA.prototype.visitVar = function visitVar(node) {
  for (var i = 0; i < node.declarations.length; i++) {
    var decl = node.declarations[i];
    if (!decl.init)
      continue;

    var value = this.visit(decl.init);
    this.set(decl.id.name, value);
  }
};

SSA.prototype.visitFunction = function visitFunction(node) {
  if (node === this.ast)
    return this.visit(node.body);

  if (node.type === 'FunctionDeclaration' && this.initialized)
    return null;

  var child = this.createChild(node);
  var ssa = child.construct();

  var fn = this.add('fn', [ this.createValue('js', ssa[0][0].id) ]);
  return fn;
};

SSA.prototype.visitLiteral = function visitLiteral(node) {
  return this.add('literal', [ this.createValue('js', node.value) ]);
};

SSA.prototype.visitIdentifier = function visitIdentifier(node) {
  return this.get(node.name);
};

SSA.prototype.visitAssign = function visitAssign(node) {
  if (node.operator !== '=') {
    return this.visit({
      type: 'AssignmentExpression',
      operator: '=',
      left: node.left,
      right: {
        type: 'BinaryExpression',
        operator: node.operator.slice(0, -1),
        left: node.left,
        right: node.right
      }
    });
  }

  var rhs = this.visit(node.right);

  // Just a variable
  if (node.left.type === 'Identifier')
    return this.set(node.left.name, rhs);

  // obj[prop] = rhs
  assert.equal(node.left.type, 'MemberExpression');
  var prop = node.left.computed ?
      this.visit(node.left.property) :
      this.visit({ type: 'Literal', value: node.left.property.name });
  var obj = this.visit(node.left.object);
  return this.add('storeProperty', [ obj, prop, rhs ]);
};

SSA.prototype.visitSeq = function visitSeq(node) {
  var last;
  for (var i = 0; i < node.expressions.length; i++)
    last = this.visit(node.expressions[i]);
  return last;
};

SSA.prototype.visitBinary = function visitBinary(node) {
  var lhs = this.visit(node.left);
  var rhs = this.visit(node.right);

  return this.add('binary', [
    this.createValue('js', node.operator),
    lhs,
    rhs
  ]);
};

SSA.prototype.visitUnary = function visitUnary(node) {
  if (node.operator !== 'delete') {
    var arg = this.visit(node.argument);

    return this.add('unary', [
      this.createValue('js', node.operator),
      arg
    ]);
  }

  // delete a.b
  var arg = node.argument;
  if (arg.type === 'MemberExpression') {
    var prop = arg.computed ?
        this.visit(arg.property) :
        this.visit({ type: 'Literal', value: arg.property.name });
    var obj = this.visit(arg.object);

    return this.add('deleteProperty', [ obj, prop ]);
  // delete a
  } else if (arg.type === 'Identifier') {
    return this.add('deleteGlobal', [ this.createValue('js', arg.name) ]);

  // `delete true` and others
  // TODO(indutny): check standards
  } else {
    return this.visit({ type: 'Literal', value: true });
  }
};

SSA.prototype.visitMember = function visitMember(node) {
  var prop = node.computed ?
      this.visit(node.property) :
      this.visit({ type: 'Literal', value: node.property.name });
  var obj = this.visit(node.object);

  return this.add('loadProperty', [ obj, prop ]);
};

SSA.prototype.visitLogic = function visitLogic(node) {
  var lhs = this.visit(node.left);
  var cons = this.createBlock();
  var alt = this.createBlock();
  var join = this.createBlock();
  var phi = this.createValue('instruction', 'phi', []);

  this.add('branch', [ lhs ]);
  if (node.operator === '||') {
    this.block.end(cons, alt);

    this.block = cons;
    this.add('to_phi', [ phi, lhs ]);
    this.block.end(join);

    this.block = alt;
  } else {
    this.block.end(cons, alt);

    this.block = alt;
    this.add('to_phi', [ phi, lhs ]);
    this.block.end(join);

    this.block = cons;
  }

  var rhs = this.visit(node.right);
  this.add('to_phi', [ phi, rhs ]);
  this.block.end(join);

  this.block = join;
  this.block.push(phi);

  return phi;
};

SSA.prototype.visitUpdate = function visitUpdate(node) {
  var one = { type: 'Literal', value: 1 };

  // ++v
  if (node.prefix) {
    return this.visit({
      type: 'AssignmentExpression',
      operator: '+=',
      left: node.argument,
      right: one
    });
  }

  var arg = this.visit(node.argument);
  var nop = this.add('nop', [ arg ]);
  var sum = this.add('binary', [
    this.createValue('js', '+'),
    nop,
    this.visit(one)
  ]);

  if (node.argument.type === 'Identifier') {
    // Just a variable
    this.set(arg.subtype, sum);
  } else {
    // obj[prop]++
    assert.equal(node.argument.type, 'MemberExpression');
    assert.equal(arg.type, 'instruction');
    assert.equal(arg.subtype, 'loadProperty');
    assert.equal(arg.inputs.length, 2);

    var obj = arg.inputs[0];
    var prop = arg.inputs[1];
    this.add('storeProperty', [ obj, prop, sum ]);
  }
  return nop;
};

SSA.prototype.visitCall = function visitCall(subtype, node) {
  var cons = this.visit(node.callee);
  var args = node.arguments.map(function(arg) {
    return this.visit(arg);
  }, this);

  for (var i = args.length - 1; i >= 0; i--)
    this.add('pushArg', [ args[i] ]);

  return this.add(subtype, [ cons, this.createValue('js', args.length) ]);
};

SSA.prototype.visitArray = function visitArray(node) {
  var arr = this.add('array', [ this.createValue('js', node.elements.length) ]);

  for (var i = 0; i < node.elements.length; i++) {
    var element = this.visit(node.elements[i]);
    this.add('storeProperty', [
      arr,
      this.visit({ type: 'Literal', value: i }),
      element
    ]);
  }

  return arr;
};

SSA.prototype.visitObject = function visitObject(node) {
  var obj = this.add('object', [
    this.createValue('js', node.properties.length)
  ]);

  for (var i = 0; i < node.properties.length; i++) {
    var prop = node.properties[i];
    var key = this.visit({
      type: 'Literal',
      value: prop.key.name || prop.key.value
    });
    var val = this.visit(prop.value);
    this.add('storeProperty', [ obj, key, val ]);
  }

  return obj;
};

SSA.prototype.visitConditional = function visitConditional(node) {
  var test = this.visit(node.test);
  var cons = this.createBlock();
  var alt = this.createBlock();
  var join = this.createBlock();
  var phi = this.createValue('instruction', 'phi', []);

  this.add('branch', [ test ]);

  this.block = cons;
  this.add('to_phi', [phi, this.visit(node.consequent) ]);
  this.block.end(join);

  this.block = alt;
  this.add('to_phi', [phi, this.visit(node.alternate) ]);
  this.block.end(join);

  this.block = join;
  this.block.push(phi);

  return phi;
};

SSA.prototype.visitThis = function visitThis(node) {
  return this.add('this', []);
};

SSA.prototype.visitReturn = function visitReturn(node) {
  var undef = { type: 'Literal', value: undefined };
  this.add('ret', [ this.visit(node.argument || undef) ]);
  this.block.end();
  return null;
};

SSA.prototype.visitIf = function visitIf(node) {
  var test = this.visit(node.test);
  var cons = this.createBlock();
  var alt = this.createBlock();
  var join = this.createBlock();

  this.add('branch', [ test ]);
  this.block.end(cons, alt);

  // Consequent
  this.block = cons;
  this.visit(node.consequent);
  this.block.end(join);

  // Alternate
  this.block = alt;
  if (node.alternate)
    this.visit(node.alternate);
  this.block.end(join);

  this.block = join;
};

SSA.prototype.visitWhile = function visitWhile(node) {
  this.enterLoop(function() {
    this.add('branch', [ this.visit(node.test) ]);
  }, function() {
    this.visit(node.body);
  });
};

SSA.prototype.visitDoWhile = function visitDoWhile(node) {
  this.enterLoop(function() {
    this.add('branch', [ this.visit(node.test) ]);
  }, function() {
    this.visit(node.body);
  }, null, true);
};

SSA.prototype.visitFor = function visitFor(node) {
  this.visit(node.init);

  this.enterLoop(function() {
    this.add('branch', [ this.visit(node.test) ]);
  }, function() {
    this.visit(node.body);
  }, function() {
    this.visit(node.update);
  });
};

SSA.prototype.visitBreak = function visitBreak(node) {
  assert(this.loop, 'break without loop');
  this.block.end(this.loop.getBreak());
};

SSA.prototype.visitContinue = function visitContinue(node) {
  assert(this.loop, 'continue without loop');
  this.block.end(this.loop.getContinue());
};

SSA.prototype.visitBlock = function visitBlock(node) {
  for (var i = 0; i < node.body.length; i++)
    this.visit(node.body[i]);
};

// Helpers

SSA.prototype.createChild = function createChild(ast) {
  return new SSA(ast, this.root);
};

SSA.prototype.createBlock = function createBlock() {
  var block = new Block(this.root);
  this.blocks.push(block);
  return block;
};

SSA.prototype.enterLoop = function enterLoop(test, content, update, reverse) {
  var oldLoop = this.loop;
  this.loop = new LoopInfo(this.root);

  var contStart = this.loop.cont;

  var prestart = this.createBlock();
  var start = this.createBlock();

  this.block.end(prestart);
  if (!reverse)
    prestart.end(start);
  this.block = start;

  test.call(this);

  var body = this.createBlock();
  this.block.end(body, this.loop.brk);

  this.block = body;
  if (reverse)
    prestart.end(body);
  content.call(this);
  this.block.end(contStart);

  // Connect info to blocks
  this.block = this.loop.cont;
  if (update)
    update.call(this);
  this.block.end(prestart);

  this.block = this.loop.getBreak();
  this.loop = oldLoop;
};

SSA.prototype.createValue = function createValue(type, subtype, inputs) {
  return new Value(this.root, type, subtype, inputs);
};

SSA.prototype.add = function add(type, inputs) {
  var val = this.createValue('instruction', type, inputs);
  this.block.push(val);
  return val;
};

SSA.prototype.set = function set(name, value) {
  var slot = name instanceof Slot ? name : this.lookup(name);

  var res;
  if (slot.type === 'local') {
    value.markAssign(name);
    res = value;
  } else if (slot.type === 'global') {
    res = this.add('storeGlobal', [
      this.createValue('js', name),
      value
    ]);
  } else if (slot.type === 'context') {
    res = this.add('storeContext', [
      this.createValue('js', slot.depth),
      this.createValue('js', slot.index),
      value
    ]);
  } else {
    assert.equal(slot.type, 'self');
    res = null;
  }

  return res;
};

SSA.prototype.get = function get(name) {
  var slot = this.lookup(name);

  var res;
  if (slot.type === 'local') {
    res = this.createValue('variable', name);
  } else if (slot.type === 'global') {
    res = this.add('loadGlobal', [ this.createValue('js', name) ]);
  } else if (slot.type === 'context') {
    res = this.add('loadContext', [
      this.createValue('js', slot.depth),
      this.createValue('js', slot.index)
    ]);
  } else {
    assert.equal(slot.type, 'self');
    res = this.add('self', []);
  }

  return res;
};

// Various classes

function Block(ssa) {
  this.id = 'B' + ssa.blockId++;
  this.instructions = [];
  this.successors = [];
  this.ended = false;
}

Block.prototype.push = function push(instr) {
  if (!this.ended)
    this.instructions.push(instr);
};

Block.prototype.goto = function goto(block) {
  if (!this.ended)
    this.successors.push(block);
};

Block.prototype.end = function end(cons, alt) {
  if (cons)
    this.goto(cons);
  if (alt)
    this.goto(alt);
  this.ended = true;
};

Block.prototype.toJSON = function toJSON() {
  return {
    id: this.id,
    successors: this.successors.map(function(block) {
      return block.id;
    }),
    instructions: this.instructions.map(function(instr) {
      return instr.toJSON();
    })
  };
};

function Slot(parent) {
  if (parent) {
    this.type = parent.type;
    this.depth = this.type === 'context' ? parent.depth + 1 : parent.depth;
    this.index = parent.index;
  } else {
    this.type = 'local';
    this.depth = 0;
    this.index = 0;
  }

  // Only for global slots
  this.key = null;

  // Only for function declarations
  this.initial = null;
}

Slot.prototype.toContext = function toContext(ssa) {
  this.type = 'context';
  this.index = ssa.contextSize++;
  this.depth = 0;
};

function Value(ssa, type, subtype, inputs) {
  this.type = type;
  this.id = 'i' + ssa.valueId++;
  this.subtype = subtype;
  this.inputs = inputs ? inputs.map(function(value) {
    return value;
  }) : null;
  this.assign = false;
  this.assignName = null;
}

Value.prototype.toInput = function toInput() {
  if (this.type === 'js') {
    return { type: 'js', value: this.subtype };
  } else if (this.type === 'instruction') {
    if (this.assign)
      return { type: 'variable', id: this.assignName };
    return { type: 'instruction', id: this.id };
  } else {
    return { type: 'variable', id: this.subtype };
  }
};

Value.prototype.toJSON = function toJSON() {
  assert.equal(this.type, 'instruction');
  return {
    id: this.assign ? this.assignName : this.id,
    type: this.subtype,
    inputs: this.inputs.map(function(input) {
      return input.toInput();
    }),
    assign: this.assign
  };
};

Value.prototype.markAssign = function markAssign(name) {
  this.assign = true;
  this.assignName = name;
};

function LoopInfo(ssa) {
  this.ssa = ssa;
  this.cont = ssa.createBlock();
  this.brk = ssa.createBlock();
}

LoopInfo.prototype.getContinue = function getContinue() {
  var c = this.ssa.createBlock();
  this.cont.end(c);
  this.cont = c;
  return c;
};

LoopInfo.prototype.getBreak = function getBreak() {
  var c = this.ssa.createBlock();
  this.brk.end(c);
  this.brk = c;
  return c;
};

},{"assert":2}]},{},[1])