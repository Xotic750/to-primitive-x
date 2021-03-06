import hasSymbols from 'has-symbol-support-x';
import isPrimitive from 'is-primitive-x';
import isDate from 'is-date-object';
import isSymbol from 'is-symbol';
import isFunction from 'is-function-x';
import requireObjectCoercible from 'require-object-coercible-x';
import isNil from 'is-nil-x';
import call from 'simple-call-x';
var ZERO = 0;
var ONE = 1;
/* eslint-disable-next-line no-void */

var UNDEFINED = void ZERO;
var NUMBER = 'number';
var STRING = 'string';
var DEFAULT = 'default';
var StringCtr = STRING.constructor;
var NumberCtr = ZERO.constructor;
/* eslint-disable-next-line compat/compat */

var symToPrimitive = hasSymbols && Symbol.toPrimitive;
/* eslint-disable-next-line compat/compat */

var symValueOf = hasSymbols && Symbol.prototype.valueOf;
var toStringOrder = ['toString', 'valueOf'];
var toNumberOrder = ['valueOf', 'toString'];
var orderLength = 2;

var assertHint = function assertHint(hint) {
  if (typeof hint !== 'string' || hint !== NUMBER && hint !== STRING) {
    throw new TypeError('hint must be "string" or "number"');
  }

  return hint;
};
/**
 * @param {*} ordinary - The ordinary to convert.
 * @param {*} hint - The hint.
 * @returns {*} - The primitive.
 */


var ordinaryToPrimitive = function ordinaryToPrimitive(ordinary, hint) {
  requireObjectCoercible(ordinary);
  assertHint(hint);
  var methodNames = hint === STRING ? toStringOrder : toNumberOrder;

  for (var i = ZERO; i < orderLength; i += ONE) {
    var method = ordinary[methodNames[i]];

    if (isFunction(method)) {
      var result = call(method, ordinary);

      if (isPrimitive(result)) {
        return result;
      }
    }
  }

  throw new TypeError('No default value');
};
/**
 * @param {*} object - The object.
 * @param {*} property - The property.
 * @returns {undefined|Function} - The method.
 */


var getMethod = function getMethod(object, property) {
  var func = object[property];

  if (isNil(func) === false) {
    if (isFunction(func) === false) {
      throw new TypeError("".concat(func, " returned for property ").concat(property, " of object ").concat(object, " is not a function"));
    }

    return func;
  }

  return UNDEFINED;
};
/**
 * Get the hint.
 *
 * @param {*} value - The value to compare.
 * @param {boolean} supplied - Was a value supplied.
 * @returns {string} - The hint string.
 */


var getHint = function getHint(value, supplied) {
  if (supplied) {
    if (value === StringCtr) {
      return STRING;
    }

    if (value === NumberCtr) {
      return NUMBER;
    }
  }

  return DEFAULT;
};
/**
 * Get the primitive from the exotic.
 *
 * @param {*} value - The exotic.
 * @returns {*} - The primitive.
 */


var getExoticToPrim = function getExoticToPrim(value) {
  if (hasSymbols) {
    if (symToPrimitive) {
      return getMethod(value, symToPrimitive);
    }

    if (isSymbol(value)) {
      return symValueOf;
    }
  }

  return UNDEFINED;
};

var evalExotic = function evalExotic(obj) {
  var exoticToPrim = obj.exoticToPrim,
      input = obj.input,
      hint = obj.hint;
  var result = call(exoticToPrim, input, [hint]);

  if (isPrimitive(result)) {
    return result;
  }

  throw new TypeError('unable to convert exotic object to primitive');
};

var evalPrimitive = function evalPrimitive(input, hint) {
  var newHint = hint === DEFAULT && (isDate(input) || isSymbol(input)) ? STRING : hint;
  return ordinaryToPrimitive(input, newHint === DEFAULT ? NUMBER : newHint);
};
/**
 * This method converts a JavaScript object to a primitive value.
 * Note: When toPrimitive is called with no hint, then it generally behaves as
 * if the hint were Number. However, objects may over-ride this behaviour by
 * defining a @@toPrimitive method. Of the objects defined in this specification
 * only Date objects (see 20.3.4.45) and Symbol objects (see 19.4.3.4) over-ride
 * the default ToPrimitive behaviour. Date objects treat no hint as if the hint
 * were String.
 *
 * @param {*} input - The input to convert.
 * @param {Function} [preferredType] - The preferred type (String or Number).
 * @throws {TypeError} If unable to convert input to a primitive.
 * @returns {string|number} The converted input as a primitive.
 * @see {http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive}
 */


var toPrimitive = function toPrimitive(input, preferredType) {
  if (isPrimitive(input)) {
    return input;
  }

  var hint = getHint(preferredType, arguments.length > ONE);
  var exoticToPrim = getExoticToPrim(input);
  return typeof exoticToPrim === 'undefined' ? evalPrimitive(input, hint) : evalExotic({
    exoticToPrim: exoticToPrim,
    input: input,
    hint: hint
  });
};

export default toPrimitive;

//# sourceMappingURL=to-primitive-x.esm.js.map