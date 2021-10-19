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
 * A description of the outline of a sarSensor.
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
 * @param {Number} options.leftWidth The left range of the sarSensor.
 * @param {Number} options.rightWidth The right range of the sarSensor.
 *
 * @exception {DeveloperError} options.length must be greater than 0.
 *
 * @see SarSensorOutlineGeometry.createGeometry
 *
 * @example
 * // create sarSensor geometry
 * var sarSensor = new Cesium.SarSensorOutlineGeometry({
 *     length: 200000,
 *     leftWidth: 2000,
 *     rightWidth: 2000,
 * });
 * var geometry = Cesium.SarSensorOutlineGeometry.createGeometry(sarSensor);
 */
function SarSensorOutlineGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var length = options.length;
  var minLeftAngle = defaultValue(options.minLeftAngle, CesiumMath.PI_OVER_SIX);
  var maxLeftAngle = defaultValue(
    options.maxLeftAngle,
    CesiumMath.PI_OVER_FOUR
  );
  var minRightAngle = defaultValue(
    options.minRightAngle,
    CesiumMath.PI_OVER_SIX
  );
  var maxRightAngle = defaultValue(
    options.maxRightAngle,
    CesiumMath.PI_OVER_FOUR
  );
  var leftWidth = defaultValue(options.leftWidth, 1000); // 幅宽 0米
  var rightWidth = defaultValue(options.rightWidth, 1000); // 幅宽 0米
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
  this._leftWidth = leftWidth;
  this._rightWidth = rightWidth;
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createSarSensorOutlineGeometry";
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
  array[startingIndex++] = value._leftWidth;
  array[startingIndex++] = value._rightWidth;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchOptions = {
  length: undefined,
  minLeftAngle: undefined,
  maxLeftAngle: undefined,
  minRightAngle: undefined,
  maxRightAngle: undefined,
  leftWidth: undefined,
  rightWidth: undefined,
  offsetAttribute: undefined,
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
  var leftWidth = array[startingIndex++];
  var rightWidth = array[startingIndex++];
  var offsetAttribute = array[startingIndex];

  if (!defined(result)) {
    scratchOptions.length = length;
    scratchOptions.minLeftAngle = minLeftAngle;
    scratchOptions.maxLeftAngle = maxLeftAngle;
    scratchOptions.minRightAngle = minRightAngle;
    scratchOptions.maxRightAngle = maxRightAngle;
    scratchOptions.leftWidth = leftWidth;
    scratchOptions.rightWidth = rightWidth;
    scratchOptions.offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;
    return new SarSensorOutlineGeometry(scratchOptions);
  }

  result._length = length;
  result._minLeftAngle = minLeftAngle;
  result._maxLeftAngle = maxLeftAngle;
  result._minRightAngle = minRightAngle;
  result._maxRightAngle = maxRightAngle;
  result._leftWidth = leftWidth;
  result._rightWidth = rightWidth;
  result._offsetAttribute =
    offsetAttribute === -1 ? undefined : offsetAttribute;
  return result;
};

/**
 * Computes the geometric representation of an outline of a sarSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {SarSensorOutlineGeometry} SarSensorOutlineGeometry A description of the sarSensor outline.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
SarSensorOutlineGeometry.createGeometry = function (sarSensorGeometry) {
  var length = sarSensorGeometry._length;
  var minLeftAngle = sarSensorGeometry._minLeftAngle;
  var maxLeftAngle = sarSensorGeometry._maxLeftAngle;
  var minRightAngle = sarSensorGeometry._minRightAngle;
  var maxRightAngle = sarSensorGeometry._maxRightAngle;
  var leftWidth = sarSensorGeometry._leftWidth;
  var rightWidth = sarSensorGeometry._rightWidth;

  if (length <= 0) {
    return;
  }

  if (leftWidth < 0) {
    leftWidth = 0;
  }

  if (rightWidth < 0) {
    rightWidth = 0;
  }

  if (leftWidth === 0 && rightWidth === 0) {
    return;
  }

  // buffers
  var positionIndex = 0;
  var index = 0;
  // 上下顶 + 外面 + 内面
  var vertexCount = 10;
  // 上下面 + 内外面 + 2个截面
  var numIndices = 32;

  if (leftWidth === 0 || rightWidth === 0) {
    vertexCount = 5;
    numIndices = 16;
  }
  var indices = IndexDatatype.createTypedArray(vertexCount, numIndices);
  var positions = new Float64Array(vertexCount * 3);

  var min_left_length = length * Math.sin(minLeftAngle);
  var max_left_length = length * Math.sin(maxLeftAngle);
  var min_right_length = length * Math.sin(minRightAngle);
  var max_right_length = length * Math.sin(maxRightAngle);
  var half_left_range = leftWidth / 2;
  var half_right_range = rightWidth / 2;

  if (leftWidth > 0) {
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

  var rightStartPositionIndex = Math.floor(positionIndex / 3);

  if (rightWidth > 0) {
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
  var ll =
    max_left_length * max_left_length + half_left_range * half_left_range;
  var rr =
    max_right_length * max_right_length + half_right_range * half_right_range;
  radiusScratch.y = Math.max(Math.sqrt(ll), Math.sqrt(rr));

  var boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, 0),
    Cartesian2.magnitude(radiusScratch)
  );

  if (defined(sarSensorGeometry._offsetAttribute)) {
    length = positions.length;
    var applyOffset = new Uint8Array(length / 3);
    var offsetValue =
      sarSensorGeometry._offsetAttribute === GeometryOffsetAttribute.NONE
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
    offsetAttribute: sarSensorGeometry._offsetAttribute,
  });
};
export default SarSensorOutlineGeometry;
