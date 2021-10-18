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
 * A description of the outline of a rarSensor.
 *
 * @alias SarSensorOutlineGeometry
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {Number} options.length The length of the sarSensor.
 * @param {Number} options.minLeftAngle The min left angle of the the sarSensor.
 * @param {Number} options.maxLeftAngle The max left angle of the the sarSensor.
 * @param {Number} options.minRightAngle The min right angle of the sarSensor.
 * @param {Number} options.maxRightAngle The max right angle of the sarSensor.
 * @param {Number} options.leftRange The left range of the sarSensor.
 * @param {Number} options.rightRange The right range of the sarSensor.
 *
 * @exception {DeveloperError} options.length must be greater than 0.
 *
 * @see SarSensorOutlineGeometry.createGeometry
 *
 * @example
 * // create rarSensor geometry
 * var rarSensor = new Cesium.SarSensorOutlineGeometry({
 *     length: 200000,
 *     leftRange: 2000,
 *     rightRange: 2000,
 * });
 * var geometry = Cesium.SarSensorOutlineGeometry.createGeometry(rarSensor);
 */
function SarSensorOutlineGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var length = options.length;
  var minLeftAngle = defaultValue(options.minLeftAngle, CesiumMath.PI_OVER_SIX);
  var maxLeftAngle = defaultValue(options.maxLeftAngle, CesiumMath.PI_OVER_FOUR);
  var minRightAngle = defaultValue(options.minRightAngle, CesiumMath.PI_OVER_SIX);
  var maxRightAngle = defaultValue(options.maxRightAngle, CesiumMath.PI_OVER_FOUR);
  var leftRange = defaultValue(options.leftRange, 0); // 幅宽 0米
  var rightRange = defaultValue(options.rightRange, 0); // 幅宽 0米
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
  this._minLeftAngle = minLeftAngle;
  this._maxLeftAngle = maxLeftAngle;
  this._minRightAngle = minRightAngle;
  this._maxRightAngle = maxRightAngle;
  this._leftRange = leftRange;
  this._rightRange = rightRange;
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createRarSensorOutlineGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
SarSensorOutlineGeometry.packedLength = 8;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {SarSensorOutlineGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
SarSensorOutlineGeometry.pack = function (value, array, startingIndex) {
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
  array[startingIndex++] = value._minLeftAngle;
  array[startingIndex++] = value._maxLeftAngle;
  array[startingIndex++] = value._minRightAngle;
  array[startingIndex++] = value._maxRightAngle;
  array[startingIndex++] = value._leftRange;
  array[startingIndex++] = value._rightRange;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchOptions = {
  length: undefined,
  minLeftAngle : undefined,
  maxLeftAngle : undefined,
  minRightAngle : undefined,
  maxRightAngle : undefined,
  leftRange : undefined,
  rightRange : undefined,
  offsetAttribute : undefined,
};
/**
 * Retrieves an instance from a packed array.
 *
 * @param {Number[]} array The packed array.
 * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
 * @param {SarSensorOutlineGeometry} [result] The object into which to store the result.
 * @returns {SarSensorOutlineGeometry} The modified result parameter or a new SarSensorOutlineGeometry instance if one was not provided.
 */
SarSensorOutlineGeometry.unpack = function (array, startingIndex, result) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');
  startingIndex = defaultValue(startingIndex, 0);
  var length = array[startingIndex++];
  var minLeftAngle = array[startingIndex++];
  var maxLeftAngle = array[startingIndex++];
  var minRightAngle = array[startingIndex++];
  var maxRightAngle = array[startingIndex++];
  var leftRange = array[startingIndex++];
  var rightRange = array[startingIndex++];
  var offsetAttribute = array[startingIndex];

  if (!defined(result)) {
    scratchOptions.length = length;
    scratchOptions.minLeftAngle = minLeftAngle;
    scratchOptions.maxLeftAngle = maxLeftAngle;
    scratchOptions.minRightAngle = minRightAngle;
    scratchOptions.maxRightAngle = maxRightAngle;
    scratchOptions.leftRange = leftRange;
    scratchOptions.rightRange = rightRange;
    scratchOptions.offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;
    return new SarSensorOutlineGeometry(scratchOptions);
  }

  result._length = length;
  result._minLeftAngle = minLeftAngle;
  result._maxLeftAngle = maxLeftAngle;
  result._minRightAngle = minRightAngle;
  result._maxRightAngle = maxRightAngle;
  result._leftRange = leftRange;
  result._rightRange = rightRange;
  result._offsetAttribute =
    offsetAttribute === -1 ? undefined : offsetAttribute;
  return result;
};

/**
 * Computes the geometric representation of an outline of a rarSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {SarSensorOutlineGeometry} SarSensorOutlineGeometry A description of the rarSensor outline.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
SarSensorOutlineGeometry.createGeometry = function (rarSensorGeometry) {
  var length = rarSensorGeometry._length;
  let minLeftAngle = sarSensorGeometry._minLeftAngle;
  let maxLeftAngle = sarSensorGeometry._maxLeftAngle;
  let minRightAngle = sarSensorGeometry._minRightAngle;
  let maxRightAngle = sarSensorGeometry._maxRightAngle;
  let leftRange = sarSensorGeometry._leftRange;
  let rightRange = sarSensorGeometry._rightRange;

  if (
    length <= 0
  ) {
    return;
  }

  if(leftRange < 0) {
    leftRange = 0;
  }

  if(rightRange < 0) {
    rightRange = 0;
  }

  if(leftRange===0 && rightRange ===0) {
    return;
  }

  // buffers
  var positionIndex = 0;
  var index = 0;
  // 上下顶 + 外面 + 内面
  var vertexCount = 10;
  // 上下面 + 内外面 + 2个截面
  var numIndices = 32;

  if(leftRange === 0 || rightRange === 0) {
    vertexCount = 5;
    numIndices = 16;
  }
  var indices  = IndexDatatype.createTypedArray(vertexCount, numIndices);
  var positions = new Float64Array(vertexCount * 3);

  let min_left_length = length * Math.sin(minLeftAngle);
  let max_left_length = length * Math.sin(maxLeftAngle);
  let min_right_length = length * Math.sin(minRightAngle);
  let max_right_length = length * Math.sin(maxRightAngle);
  let half_left_range = leftRange / 2;
  let half_right_range = rightRange / 2;

  if(leftRange > 0) {
    // 顶点 0
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    // 左上 1
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;

    // 右上 2
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;

    // 右下 3
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = -half_left_range;
    positions[positionIndex++] = -length;

    // 左下 4
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = -half_left_range;
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
    indices[index++] = 1;
    indices[index++] = 2;
    indices[index++] = 2;
    indices[index++] = 3;
    indices[index++] = 3;
    indices[index++] = 4;
    indices[index++] = 4;
    indices[index++] = 1;
  }

  let rightStartPositionIndex = Math.floor(positionIndex / 3);

  if(rightRange > 0) {
    // 顶点 0
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    // 左上 1
    positions[positionIndex++] = min_right_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;

    // 右上 2
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;

    // 右下 3
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;

    // 左下 4
    positions[positionIndex++] = min_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;

    // line
    indices[index++] = rightStartPositionIndex;
    indices[index++] = rightStartPositionIndex + 1;
    indices[index++] = rightStartPositionIndex;
    indices[index++] = rightStartPositionIndex + 2;
    indices[index++] = rightStartPositionIndex;
    indices[index++] = rightStartPositionIndex + 3;
    indices[index++] = rightStartPositionIndex;
    indices[index++] = rightStartPositionIndex + 4;
    indices[index++] = rightStartPositionIndex + 1;
    indices[index++] = rightStartPositionIndex + 2;
    indices[index++] = rightStartPositionIndex + 2;
    indices[index++] = rightStartPositionIndex + 3;
    indices[index++] = rightStartPositionIndex + 3;
    indices[index++] = rightStartPositionIndex + 4;
    indices[index++] = rightStartPositionIndex + 4;
    indices[index++] = rightStartPositionIndex + 1;
  }

  var attributes = new GeometryAttributes();
  attributes.position = new GeometryAttribute({
    componentDatatype: ComponentDatatype.DOUBLE,
    componentsPerAttribute: 3,
    values: positions,
  });

  var radiusScratch = new Cartesian2();
  radiusScratch.x = length;
  radiusScratch.y = Math.max(Math.max(left_length,right_length,front_length,back_length));

  var boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, 0),
    Cartesian2.magnitude(radiusScratch)
  );

  if (defined(rarSensorGeometry._offsetAttribute)) {
    length = positions.length;
    var applyOffset = new Uint8Array(length / 3);
    var offsetValue =
      rarSensorGeometry._offsetAttribute === GeometryOffsetAttribute.NONE
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
    offsetAttribute: rarSensorGeometry._offsetAttribute,
  });
};
export default SarSensorOutlineGeometry;
