import toPrimitive from 'src/to-primitive-x';

const hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const itHasSymbols = hasSymbols ? it : xit;

const hasSymbolToPrimitive = hasSymbols && typeof Symbol.toPrimitive === 'symbol';
const itHasSymbolToPrimitive = hasSymbolToPrimitive ? it : xit;

const primitives = [null, undefined, true, false, 0, -0, 42, Infinity, -Infinity, '', 'abc'];

const coercibleObject = {
  toString() {
    return 42;
  },
  valueOf() {
    return 3;
  },
};

const valueOfOnlyObject = {
  toString() {
    return {};
  },
  valueOf() {
    return 4;
  },
};

const toStringOnlyObject = {
  toString() {
    return 7;
  },
  valueOf() {
    return {};
  },
};

const coercibleFnObject = {
  toString() {
    return 42;
  },
  valueOf() {
    return function valueOfFn() {};
  },
};

const uncoercibleObject = {
  toString() {
    return {};
  },
  valueOf() {
    return {};
  },
};

const uncoercibleFnObject = {
  toString() {
    return function toStrFn() {};
  },
  valueOf() {
    return function valueOfFn() {};
  },
};

describe('toPrimitive', function() {
  it('is a function', function() {
    expect.assertions(1);
    expect(typeof toPrimitive).toBe('function');
  });

  it('primitives', function() {
    expect.assertions(36);
    primitives.forEach(function(i) {
      expect(toPrimitive(i)).toBe(i);
      expect(toPrimitive(i, String)).toBe(i);
      expect(toPrimitive(i, Number)).toBe(i);
    });

    expect(Number.isNaN(toPrimitive(NaN))).toBe(true);

    expect(Number.isNaN(toPrimitive(NaN, String))).toBe(true);

    expect(Number.isNaN(toPrimitive(NaN, Number))).toBe(true);
  });

  itHasSymbols('Symbols', function() {
    expect.assertions(12);
    const symbols = [Symbol('foo'), Symbol.iterator, Symbol.for('foo')];

    symbols.forEach(function(sym) {
      expect(toPrimitive(sym)).toBe(sym);
      expect(toPrimitive(sym, String)).toBe(sym);
      expect(toPrimitive(sym, Number)).toBe(sym);
    });

    const primitiveSym = Symbol('primitiveSym');
    const objectSym = Object(primitiveSym);
    expect(toPrimitive(objectSym)).toBe(primitiveSym);
    expect(toPrimitive(objectSym, String)).toBe(primitiveSym);
    expect(toPrimitive(objectSym, Number)).toBe(primitiveSym);
  });

  it('arrays', function() {
    expect.assertions(9);
    const arrays = [[], ['a', 'b'], [1, 2]];
    arrays.forEach(function(arr) {
      expect(toPrimitive(arr)).toBe(String(arr));
      expect(toPrimitive(arr, String)).toBe(String(arr));
      expect(toPrimitive(arr, Number)).toBe(String(arr));
    });
  });

  it('dates', function() {
    expect.assertions(9);
    const dates = [new Date(), new Date(0)];
    dates.forEach(function(date) {
      expect(toPrimitive(date)).toBe(String(date));
      expect(toPrimitive(date, String)).toBe(String(date));
      expect(toPrimitive(date, Number)).toBe(Number(date));
    });

    const date = new Date(NaN);
    expect(toPrimitive(date)).toBe(String(date));
    expect(toPrimitive(date, String)).toBe(String(date));

    expect(Number.isNaN(toPrimitive(date, Number))).toBe(true);
  });

  it('objects', function() {
    expect.assertions(15);
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

  itHasSymbolToPrimitive('Symbol.toPrimitive', function() {
    expect.assertions(6);
    const overriddenObject = {
      toString() {
        throw new Error();
      },
      valueOf() {
        throw new Error();
      },
    };

    overriddenObject[Symbol.toPrimitive] = function(hint) {
      return String(hint);
    };

    expect(toPrimitive(overriddenObject)).toBe('default', 'default object with Symbol.toPrimitive + no hint invokes that');
    expect(toPrimitive(overriddenObject, Number)).toBe(
      'number',
      'number constructor with Symbol.toPrimitive + hint Number invokes that',
    );
    expect(toPrimitive(overriddenObject, String)).toBe(
      'string',
      'string constructor with Symbol.toPrimitive + hint String invokes that',
    );

    const nullToPrimitive = {
      toString: coercibleObject.toString,
      valueOf: coercibleObject.valueOf,
    };

    nullToPrimitive[Symbol.toPrimitive] = null;
    expect(toPrimitive(nullToPrimitive)).toBe(toPrimitive(coercibleObject));
    expect(toPrimitive(nullToPrimitive, Number)).toBe(toPrimitive(coercibleObject, Number));
    expect(toPrimitive(nullToPrimitive, String)).toBe(toPrimitive(coercibleObject, String));
  });

  itHasSymbolToPrimitive('Symbol.toPrimitive exceptions', function() {
    expect.assertions(3);
    const nonFunctionToPrimitive = {
      toString() {
        throw new Error();
      },
      valueOf() {
        throw new Error();
      },
    };

    nonFunctionToPrimitive[Symbol.toPrimitive] = {};
    expect(function() {
      toPrimitive(nonFunctionToPrimitive);
    }).toThrowErrorMatchingSnapshot();

    const uncoercibleToPrimitive = {
      toString() {
        throw new Error();
      },
      valueOf() {
        throw new Error();
      },
    };

    uncoercibleToPrimitive[Symbol.toPrimitive] = function(hint) {
      return {
        toString() {
          return hint;
        },
      };
    };

    expect(function() {
      toPrimitive(uncoercibleToPrimitive);
    }).toThrowErrorMatchingSnapshot();

    const throwingToPrimitive = {
      toString() {
        throw new Error();
      },
      valueOf() {
        throw new Error();
      },
    };

    throwingToPrimitive[Symbol.toPrimitive] = function(hint) {
      throw new RangeError(hint);
    };

    expect(function() {
      toPrimitive(throwingToPrimitive);
    }).toThrowErrorMatchingSnapshot();
  });

  it('exceptions', function() {
    expect.assertions(6);
    expect(function() {
      toPrimitive(uncoercibleObject);
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      toPrimitive(uncoercibleObject, Number);
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      toPrimitive(uncoercibleObject, String);
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      toPrimitive(uncoercibleFnObject);
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      toPrimitive(uncoercibleFnObject, Number);
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      toPrimitive(uncoercibleFnObject, String);
    }).toThrowErrorMatchingSnapshot();
  });
});
