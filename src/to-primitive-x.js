import hasSymbols from 'has-symbol-support-x';
import isPrimitive from 'is-primitive';
import isDate from 'is-date-object';
import isSymbol from 'is-symbol';
import isFunction from 'is-function-x';
import requireObjectCoercible from 'require-object-coercible-x';
import isNil from 'is-nil-x';

/* eslint-disable-next-line compat/compat */
const symToPrimitive = hasSymbols && Symbol.toPrimitive;
/* eslint-disable-next-line compat/compat */
const symValueOf = hasSymbols && Symbol.prototype.valueOf;

const toStringOrder = ['toString', 'valueOf'];
const toNumberOrder = ['valueOf', 'toString'];
const orderLength = 2;

const ordinaryToPrimitive = function _ordinaryToPrimitive(O, hint) {
  requireObjectCoercible(O);

  if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
    throw new TypeError('hint must be "string" or "number"');
  }

  const methodNames = hint === 'string' ? toStringOrder : toNumberOrder;
  let method;
  let result;
  for (let i = 0; i < orderLength; i += 1) {
    method = O[methodNames[i]];

    if (isFunction(method)) {
      result = method.call(O);

      if (isPrimitive(result)) {
        return result;
      }
    }
  }

  throw new TypeError('No default value');
};

const getMethod = function _getMethod(O, P) {
  const func = O[P];

  if (isNil(func) === false) {
    if (isFunction(func) === false) {
      throw new TypeError(`${func} returned for property ${P} of object ${O} is not a function`);
    }

    return func;
  }

  /* eslint-disable-next-line no-void */
  return void 0;
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
export default function toPrimitive(input, preferredType) {
  if (isPrimitive(input)) {
    return input;
  }

  let hint = 'default';

  if (arguments.length > 1) {
    if (preferredType === String) {
      hint = 'string';
    } else if (preferredType === Number) {
      hint = 'number';
    }
  }

  let exoticToPrim;

  if (hasSymbols) {
    if (symToPrimitive) {
      exoticToPrim = getMethod(input, symToPrimitive);
    } else if (isSymbol(input)) {
      exoticToPrim = symValueOf;
    }
  }

  if (typeof exoticToPrim !== 'undefined') {
    const result = exoticToPrim.call(input, hint);

    if (isPrimitive(result)) {
      return result;
    }

    throw new TypeError('unable to convert exotic object to primitive');
  }

  if (hint === 'default' && (isDate(input) || isSymbol(input))) {
    hint = 'string';
  }

  return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
}
