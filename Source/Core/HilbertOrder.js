import Check from "./Check.js";
import DeveloperError from "./DeveloperError.js";

/**
 * Hilbert Order helper functions.
 *
 * @namespace HilbertOrder
 */
var HilbertOrder = {};

/**
 * Computes the Hilbert index at the given level from 2D coordinates.
 *
 * @param {Number} level The level of the curve
 * @param {Number} x The X coordinate
 * @param {Number} y The Y coordinate
 * @returns {Number} The Hilbert index.
 * @private
 */
HilbertOrder.encode2D = function (level, x, y) {
  var n = Math.pow(2, level);
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.number("level", level);
  Check.typeOf.number("x", x);
  Check.typeOf.number("y", y);
  if (level < 1) {
    throw new DeveloperError("Hilbert level cannot be less than 1.");
  }
  if (x < 0 || x >= n || y < 0 || y >= n) {
    throw new DeveloperError("Invalid coordinates for given level.");
  }
  //>>includeEnd('debug');

  var p = {
    x: x,
    y: y,
  };
  var rx,
    ry,
    s,
    index = 0;

  for (s = n / 2; s > 0; s /= 2) {
    rx = (p.x & s) > 0 ? 1 : 0;
    ry = (p.y & s) > 0 ? 1 : 0;
    index += ((3 * rx) ^ ry) * s * s;
    rotate(n, p, rx, ry);
  }

  return index;
};

/**
 * Computes the 2D coordinates from the Hilbert index at the given level.
 *
 * @param {Number} level The level of the curve
 * @param {Number} index The Hilbert index
 * @returns {Number[]} An array containing the 2D coordinates ([x, y]) corresponding to the Morton index.
 * @private
 */
HilbertOrder.decode2D = function (level, index) {
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.number("level", level);
  Check.typeOf.number("index", index);
  if (level < 1) {
    throw new DeveloperError("Hilbert level cannot be less than 1.");
  }
  if (index < 0 || index >= Math.pow(4, level)) {
    throw new DeveloperError(
      "Hilbert index exceeds valid maximum for given level."
    );
  }
  //>>includeEnd('debug');

  var n = Math.pow(2, level);
  var p = {
    x: 0,
    y: 0,
  };
  var rx, ry, s, t;

  for (s = 1, t = index; s < n; s *= 2) {
    rx = 1 & (t / 2);
    ry = 1 & (t ^ rx);
    rotate(s, p, rx, ry);
    p.x += s * rx;
    p.y += s * ry;
    t /= 4;
  }

  return [p.x, p.y];
};

/**
 * @private
 */
function rotate(n, p, rx, ry) {
  if (ry !== 0) {
    return;
  }

  if (rx === 1) {
    p.x = n - 1 - p.x;
    p.y = n - 1 - p.y;
  }

  var t = p.x;
  p.x = p.y;
  p.y = t;
}

export default HilbertOrder;
