'use strict';

var toPrimitive;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  var es7 = require('es7-shim');
  Object.keys(es7).forEach(function (key) {
    var obj = es7[key];
    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  toPrimitive = require('../../index.js');
} else {
  toPrimitive = returnExports;
}

var hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
var itHasSymbols = hasSymbols ? it : xit;

var hasSymbolToPrimitive = hasSymbols && typeof Symbol.toPrimitive === 'symbol';
var itHasSymbolToPrimitive = hasSymbolToPrimitive ? it : xit;

var primitives = [
  null,
  undefined,
  true,
  false,
  0,
  -0,
  42,
  Infinity,
  -Infinity,
  '',
  'abc'
];

var coercibleObject = {
  toString: function () {
    return 42;
  },
  valueOf: function () {
    return 3;
  }
};

var valueOfOnlyObject = {
  toString: function () {
    return {};
  },
  valueOf: function () {
    return 4;
  }
};

var toStringOnlyObject = {
  toString: function () {
    return 7;
  },
  valueOf: function () {
    return {};
  }
};

var coercibleFnObject = {
  toString: function () {
    return 42;
  },
  valueOf: function () {
    return function valueOfFn() {};
  }
};

var uncoercibleObject = {
  toString: function () {
    return {};
  },
  valueOf: function () {
    return {};
  }
};

var uncoercibleFnObject = {
  toString: function () {
    return function toStrFn() {};
  },
  valueOf: function () {
    return function valueOfFn() {};
  }
};

describe('toPrimitive', function () {
  it('is a function', function () {
    expect(typeof toPrimitive).toBe('function');
  });

  it('primitives', function () {
    primitives.forEach(function (i) {
      expect(toPrimitive(i)).toBe(i);
      expect(toPrimitive(i, String)).toBe(i);
      expect(toPrimitive(i, Number)).toBe(i);
    });

    expect(isNaN(toPrimitive(NaN))).toBe(true);
    expect(isNaN(toPrimitive(NaN, String))).toBe(true);
    expect(isNaN(toPrimitive(NaN, Number))).toBe(true);

  });

  itHasSymbols('Symbols', function () {
    var symbols = [
      Symbol('foo'),
      Symbol.iterator,
      // eslint-disable-next-line no-restricted-properties
      Symbol['for']('foo')
    ];

    symbols.forEach(function (sym) {
      expect(toPrimitive(sym)).toBe(sym);
      expect(toPrimitive(sym, String)).toBe(sym);
      expect(toPrimitive(sym, Number)).toBe(sym);
    });

    var primitiveSym = Symbol('primitiveSym');
    var objectSym = Object(primitiveSym);
    expect(toPrimitive(objectSym)).toBe(primitiveSym);
    expect(toPrimitive(objectSym, String)).toBe(primitiveSym);
    expect(toPrimitive(objectSym, Number)).toBe(primitiveSym);
  });

  it('Arrays', function () {
    var arrays = [
      [],
      ['a', 'b'],
      [1, 2]
    ];
    arrays.forEach(function (arr) {
      expect(toPrimitive(arr)).toBe(String(arr));
      expect(toPrimitive(arr, String)).toBe(String(arr));
      expect(toPrimitive(arr, Number)).toBe(String(arr));
    });
  });

  it('Dates', function () {
    var dates = [new Date(), new Date(0)];
    dates.forEach(function (date) {
      expect(toPrimitive(date)).toBe(String(date));
      expect(toPrimitive(date, String)).toBe(String(date));
      expect(toPrimitive(date, Number)).toBe(Number(date));
    });

    var date = new Date(NaN);
    expect(toPrimitive(date)).toBe(String(date));
    expect(toPrimitive(date, String)).toBe(String(date));
    expect(isNaN(toPrimitive(date, Number))).toBe(true);
  });

  it('Objects', function () {
    expect(toPrimitive(coercibleObject)).toBe(coercibleObject.valueOf());
    expect(toPrimitive(coercibleObject, Number)).toBe(coercibleObject.valueOf());
    expect(toPrimitive(coercibleObject, String)).toBe(coercibleObject.toString());

    expect(toPrimitive(coercibleFnObject)).toBe(coercibleFnObject.toString());
    expect(toPrimitive(coercibleFnObject, Number)).toBe(coercibleFnObject.toString());
    expect(toPrimitive(coercibleFnObject, String)).toBe(coercibleFnObject.toString());

    expect(toPrimitive({})).toBe('[object Object]');
    expect(toPrimitive({}, Number)).toBe('[object Object]');
    expect(toPrimitive({}, String)).toBe('[object Object]');

    expect(toPrimitive(toStringOnlyObject)).toBe(toStringOnlyObject.toString());
    expect(toPrimitive(toStringOnlyObject, Number)).toBe(toStringOnlyObject.toString());
    expect(toPrimitive(toStringOnlyObject, String)).toBe(toStringOnlyObject.toString());

    expect(toPrimitive(valueOfOnlyObject)).toBe(valueOfOnlyObject.valueOf());
    expect(toPrimitive(valueOfOnlyObject, Number)).toBe(valueOfOnlyObject.valueOf());
    expect(toPrimitive(valueOfOnlyObject, String)).toBe(valueOfOnlyObject.valueOf());
  });

  itHasSymbolToPrimitive('Symbol.toPrimitive', function () {
    var overriddenObject = {
      toString: function () {
        throw new Error();
      },
      valueOf: function () {
        throw new Error();
      }
    };

    overriddenObject[Symbol.toPrimitive] = function (hint) {
      return String(hint);
    };

    expect(toPrimitive(overriddenObject), 'default', 'object with Symbol.toPrimitive + no hint invokes that');
    expect(toPrimitive(overriddenObject, Number), 'number', 'object with Symbol.toPrimitive + hint Number invokes that');
    expect(toPrimitive(overriddenObject, String), 'string', 'object with Symbol.toPrimitive + hint String invokes that');

    var nullToPrimitive = {
      toString: coercibleObject.toString,
      valueOf: coercibleObject.valueOf
    };

    nullToPrimitive[Symbol.toPrimitive] = null;
    expect(toPrimitive(nullToPrimitive)).toBe(toPrimitive(coercibleObject));
    expect(toPrimitive(nullToPrimitive, Number)).toBe(toPrimitive(coercibleObject, Number));
    expect(toPrimitive(nullToPrimitive, String)).toBe(toPrimitive(coercibleObject, String));
  });

  itHasSymbolToPrimitive('Symbol.toPrimitive exceptions', function () {
    var nonFunctionToPrimitive = {
      toString: function () {
        throw new Error();
      },
      valueOf: function () {
        throw new Error();
      }
    };

    nonFunctionToPrimitive[Symbol.toPrimitive] = {};
    expect(function () {
      toPrimitive(nonFunctionToPrimitive);
    }).toThrow();

    var uncoercibleToPrimitive = {
      toString: function () {
        throw new Error();
      },
      valueOf: function () {
        throw new Error();
      }
    };

    uncoercibleToPrimitive[Symbol.toPrimitive] = function (hint) {
      return {
        toString: function () {
          return hint;
        }
      };
    };

    expect(function () {
      toPrimitive(uncoercibleToPrimitive);
    }).toThrow();

    var throwingToPrimitive = {
      toString: function () {
        throw new Error();
      },
      valueOf: function () {
        throw new Error();
      }
    };

    throwingToPrimitive[Symbol.toPrimitive] = function (hint) {
      throw new RangeError(hint);
    };

    expect(function () {
      toPrimitive(throwingToPrimitive);
    }).toThrow();
  });

  it('exceptions', function () {
    expect(function () {
      toPrimitive(uncoercibleObject);
    }).toThrow();

    expect(function () {
      toPrimitive(uncoercibleObject, Number);
    }).toThrow();

    expect(function () {
      toPrimitive(uncoercibleObject, String);
    }).toThrow();

    expect(function () {
      toPrimitive(uncoercibleFnObject);
    }).toThrow();

    expect(function () {
      toPrimitive(uncoercibleFnObject, Number);
    }).toThrow();

    expect(function () {
      toPrimitive(uncoercibleFnObject, String);
    }).toThrow();
  });
});
