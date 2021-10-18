import arrayFill from "./arrayFill.js";
import BoundingSphere from "./BoundingSphere.js";
import Cartesian2 from "./Cartesian2.js";
import Cartesian3 from "./Cartesian3.js";
import ComponentDatatype from "./ComponentDatatype.js";
import defaultValue from "./defaultValue.js";
import defined from "./defined.js";
import DeveloperError from "./DeveloperError.js";
import Geometry from "./Geometry.js";
import GeometryAttribute from "./GeometryAttribute.js";
import GeometryAttributes from "./GeometryAttributes.js";
import GeometryOffsetAttribute from "./GeometryOffsetAttribute.js";
import IndexDatatype from "./IndexDatatype.js";
import CesiumMath from "./Math.js";
import PrimitiveType from "./PrimitiveType.js";

/**
 * A description of the outline of a rectangleSensor.
 *
 * @alias RectangleSensorOutlineGeometry
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {Number} options.length The length of the rectangleSensor.
 * @param {Number} options.topRadius The radius of the top of the rectangleSensor.
 * @param {Number} options.bottomRadius The radius of the bottom of the rectangleSensor.
 * @param {Number} [options.slices=128] The number of edges around the perimeter of the rectangleSensor.
 * @param {Number} [options.numberOfVerticalLines=16] Number of lines to draw between the top and bottom surfaces of the rectangleSensor.
 *
 * @exception {DeveloperError} options.length must be greater than 0.
 * @exception {DeveloperError} options.topRadius must be greater than 0.
 * @exception {DeveloperError} options.bottomRadius must be greater than 0.
 * @exception {DeveloperError} bottomRadius and topRadius cannot both equal 0.
 * @exception {DeveloperError} options.slices must be greater than or equal to 3.
 *
 * @see RectangleSensorOutlineGeometry.createGeometry
 *
 * @example
 * // create rectangleSensor geometry
 * var rectangleSensor = new Cesium.RectangleSensorOutlineGeometry({
 *     length: 200000,
 *     topRadius: 80000,
 *     bottomRadius: 200000,
 * });
 * var geometry = Cesium.RectangleSensorOutlineGeometry.createGeometry(rectangleSensor);
 */
function RectangleSensorOutlineGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var length = options.length;
  var leftHalfAngle = defaultValue(options.leftHalfAngle, CesiumMath.PI_OVER_SIX);
  var rightHalfAngle = defaultValue(options.rightHalfAngle, CesiumMath.PI_OVER_SIX);
  var frontHalfAngle = defaultValue(options.frontHalfAngle, CesiumMath.PI_OVER_SIX);
  var backHalfAngle = defaultValue(options.backHalfAngle, CesiumMath.PI_OVER_SIX);
  //>>includeStart('debug', pragmas.debug);
  if (!defined(length)) {
    throw new DeveloperError("options.length must be defined.");
  }

  if (
    defined(options.offsetAttribute) &&
    options.offsetAttribute === GeometryOffsetAttribute.TOP
  ) {
    throw new DeveloperError(
      "GeometryOffsetAttribute.TOP is not a supported options.offsetAttribute for this geometry."
    );
  }
  //>>includeEnd('debug');

  this._length = length;
  this._leftHalfAngle = leftHalfAngle;
  this._rightHalfAngle = rightHalfAngle;
  this._frontHalfAngle = frontHalfAngle;
  this._backHalfAngle = backHalfAngle;
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createRectangleSensorOutlineGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
RectangleSensorOutlineGeometry.packedLength = 6;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {RectangleSensorOutlineGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
RectangleSensorOutlineGeometry.pack = function (value, array, startingIndex) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(value)) {
    throw new DeveloperError("value is required");
  }
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');

  startingIndex = defaultValue(startingIndex, 0);
  array[startingIndex++] = value._length;
  array[startingIndex++] = value._leftHalfAngle;
  array[startingIndex++] = value._rightHalfAngle;
  array[startingIndex++] = value._frontHalfAngle;
  array[startingIndex++] = value._backHalfAngle;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchOptions = {
  length: undefined,
  leftHalfAngle : undefined,
  rightHalfAngle : undefined,
  frontHalfAngle : undefined,
  backHalfAngle : undefined,
  offsetAttribute : undefined,
};
/**
 * Retrieves an instance from a packed array.
 *
 * @param {Number[]} array The packed array.
 * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
 * @param {RectangleSensorOutlineGeometry} [result] The object into which to store the result.
 * @returns {RectangleSensorOutlineGeometry} The modified result parameter or a new RectangleSensorOutlineGeometry instance if one was not provided.
 */
RectangleSensorOutlineGeometry.unpack = function (array, startingIndex, result) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');
  startingIndex = defaultValue(startingIndex, 0);
  var length = array[startingIndex++];
  var leftHalfAngle = array[startingIndex++];
  var rightHalfAngle = array[startingIndex++];
  var frontHalfAngle = array[startingIndex++];
  var backHalfAngle = array[startingIndex++];
  var offsetAttribute = array[startingIndex];

  if (!defined(result)) {
    scratchOptions.length = length;
    scratchOptions.leftHalfAngle = leftHalfAngle;
    scratchOptions.rightHalfAngle = rightHalfAngle;
    scratchOptions.frontHalfAngle = frontHalfAngle;
    scratchOptions.backHalfAngle = backHalfAngle;
    scratchOptions.offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;
    return new RectangleSensorOutlineGeometry(scratchOptions);
  }

  result._length = length;
  result._leftHalfAngle = leftHalfAngle;
  result._rightHalfAngle = rightHalfAngle;
  result._frontHalfAngle = frontHalfAngle;
  result._backHalfAngle = backHalfAngle;
  result._offsetAttribute =
    offsetAttribute === -1 ? undefined : offsetAttribute;
  return result;
};

/**
 * Computes the geometric representation of an outline of a rectangleSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {RectangleSensorOutlineGeometry} RectangleSensorOutlineGeometry A description of the rectangleSensor outline.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
RectangleSensorOutlineGeometry.createGeometry = function (rectangleSensorGeometry) {
  var length = rectangleSensorGeometry._length;
  var leftHalfAngle = rectangleSensorGeometry._leftHalfAngle;
  var rightHalfAngle = rectangleSensorGeometry._rightHalfAngle;
  var frontHalfAngle = rectangleSensorGeometry._frontHalfAngle;
  var backHalfAngle = rectangleSensorGeometry._backHalfAngle;

  if (
    length <= 0 ||
    leftHalfAngle <= 0 ||
    rightHalfAngle <= 0 ||
    frontHalfAngle <= 0 ||
    (backHalfAngle <= 0)
  ) {
    return;
  }

  // buffers
  var positionIndex = 0;
  var index = 0;
  // 上下顶 + 外面 + 内面
  var vertexCount = 10;
  // 上下面 + 内外面 + 2个截面
  var numIndices = 28;
  var indices  = IndexDatatype.createTypedArray(vertexCount, numIndices);
  var positions = new Float64Array(vertexCount * 3);

  let front_length = length * Math.sin(frontHalfAngle);
  let back_length = length * Math.sin(backHalfAngle);
  let left_length = length * Math.sin(leftHalfAngle);
  let right_length = length * Math.sin(rightHalfAngle);
  // 顶点 0
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  // 左上 1
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;
  // 中上点 2
  positions[positionIndex++] = 0;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;
  // 右上 3
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;
  // 右中点 4
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -length;
  // 右下 5
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;
  // 中下点 6
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;
  // 左下 7
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;
  // 左中点 8
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -length;
  // 底面中心 9
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -length;

  // line
  indices[index++] = 0;
  indices[index++] = 1;
  indices[index++] = 0;
  indices[index++] = 2;
  indices[index++] = 0;
  indices[index++] = 3;
  indices[index++] = 0;
  indices[index++] = 4;
  indices[index++] = 0;
  indices[index++] = 5;
  indices[index++] = 0;
  indices[index++] = 6;
  indices[index++] = 0;
  indices[index++] = 7;
  indices[index++] = 0;
  indices[index++] = 8;
  indices[index++] = 1;
  indices[index++] = 3;
  indices[index++] = 3;
  indices[index++] = 5;
  indices[index++] = 5;
  indices[index++] = 7;
  indices[index++] = 7;
  indices[index++] = 1;
  indices[index++] = 2;
  indices[index++] = 6;
  indices[index++] = 4;
  indices[index++] = 8;

  var attributes = new GeometryAttributes();
  attributes.position = new GeometryAttribute({
    componentDatatype: ComponentDatatype.DOUBLE,
    componentsPerAttribute: 3,
    values: positions,
  });

  var radiusScratch = new Cartesian2();
  radiusScratch.x = length;
  var ll = left_length * left_length;
  var ff = front_length * front_length;
  var rr = right_length * right_length;
  var bb = back_length * back_length;
  radiusScratch.y = Math.max(Math.sqrt( ll + ff),Math.sqrt(ff + rr),Math.sqrt(rr + bb),Math.sqrt(bb + ll));

  var boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, 0),
    Cartesian2.magnitude(radiusScratch)
  );

  if (defined(rectangleSensorGeometry._offsetAttribute)) {
    length = positions.length;
    var applyOffset = new Uint8Array(length / 3);
    var offsetValue =
      rectangleSensorGeometry._offsetAttribute === GeometryOffsetAttribute.NONE
      ? 0
      : 1;
    arrayFill(applyOffset, offsetValue);
    attributes.applyOffset = new GeometryAttribute({
      componentDatatype: ComponentDatatype.UNSIGNED_BYTE,
      componentsPerAttribute: 1,
      values: applyOffset,
    });
  }

  return new Geometry({
    attributes: attributes,
    indices: indices,
    primitiveType: PrimitiveType.LINES,
    boundingSphere: boundingSphere,
    offsetAttribute: rectangleSensorGeometry._offsetAttribute,
  });
};
export default RectangleSensorOutlineGeometry;
