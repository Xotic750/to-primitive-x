import hasSymbols from 'has-symbol-support-x';
import isPrimitive from 'is-primitive';
import isDate from 'is-date-object';
import isSymbol from 'is-symbol';
import isFunction from 'is-function-x';
import requireObjectCoercible from 'require-object-coercible-x';
import isNil from 'is-nil-x';

const ZERO = 0;
const ONE = 1;
/* eslint-disable-next-line no-void */
const UNDEFINED = void ZERO;
const NUMBER = 'number';
const STRING = 'string';
const DEFAULT = 'default';
/** @type {StringConstructor} */
const StringCtr = STRING.constructor;
/** @type {NumberConstructor} */
const NumberCtr = ZERO.constructor;
/* eslint-disable-next-line compat/compat */
const symToPrimitive = hasSymbols && Symbol.toPrimitive;
/* eslint-disable-next-line compat/compat */
const symValueOf = hasSymbols && Symbol.prototype.valueOf;

const toStringOrder = ['toString', 'valueOf'];
const toNumberOrder = ['valueOf', 'toString'];
const orderLength = 2;

/**
 * @param {*} ordinary - The ordinary to convert.
 * @param {*} hint - The hint.
 * @returns {*} - The primitive.
 */
const ordinaryToPrimitive = function _ordinaryToPrimitive(ordinary, hint) {
  requireObjectCoercible(ordinary);

  if (typeof hint !== 'string' || (hint !== NUMBER && hint !== STRING)) {
    throw new TypeError('hint must be "string" or "number"');
  }

  const methodNames = hint === STRING ? toStringOrder : toNumberOrder;
  let method;
  let result;
  for (let i = ZERO; i < orderLength; i += ONE) {
    method = ordinary[methodNames[i]];

    if (isFunction(method)) {
      result = method.call(ordinary);

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
const getMethod = function _getMethod(object, property) {
  const func = object[property];

  if (isNil(func) === false) {
    if (isFunction(func) === false) {
      throw new TypeError(`${func} returned for property ${property} of object ${object} is not a function`);
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
const getHint = function getHint(value, supplied) {
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
const getExoticToPrim = function getExoticToPrim(value) {
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
 * @param {NumberConstructor|StringConstructor} [preferredType] - The preferred type (String or Number).
 * @throws {TypeError} If unable to convert input to a primitive.
 * @returns {string|number} The converted input as a primitive.
 * @see {http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive}
 */
const toPrimitive = function toPrimitive(input, preferredType) {
  if (isPrimitive(input)) {
    return input;
  }

  const hint = getHint(preferredType, arguments.length > ONE);
  const exoticToPrim = getExoticToPrim(input);

  if (typeof exoticToPrim !== 'undefined') {
    const result = exoticToPrim.call(input, hint);

    if (isPrimitive(result)) {
      return result;
    }

    throw new TypeError('unable to convert exotic object to primitive');
  }

  const newHint = hint === DEFAULT && (isDate(input) || isSymbol(input)) ? STRING : hint;

  return ordinaryToPrimitive(input, newHint === DEFAULT ? NUMBER : newHint);
};

export default toPrimitive;
