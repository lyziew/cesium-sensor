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
import VertexFormat from "./VertexFormat.js";

var radiusScratch = new Cartesian2();
var normalScratch = new Cartesian3();
var bitangentScratch = new Cartesian3();
var tangentScratch = new Cartesian3();
var positionScratch = new Cartesian3();
/**
 * A description of a sarSensor.
 *
 * @alias SarSensorGeometry
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
 * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
 *
 * @exception {DeveloperError} options.length must be greater than 0.
 *
 * @see SarSensorGeometry.createGeometry
 *
 * @example
 * // create sarSensor geometry
 * var sarSensor = new Cesium.SarSensorGeometry({
 *     length: 200000,
 *     leftWidth: 2000
 * });
 * var geometry = Cesium.SarSensorGeometry.createGeometry(sarSensor);
 */
function SarSensorGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var vertexFormat = defaultValue(options.vertexFormat, VertexFormat.DEFAULT);
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
  this._vertexFormat = VertexFormat.clone(vertexFormat);
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createSarSensorGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
SarSensorGeometry.packedLength = VertexFormat.packedLength + 8;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {SarSensorGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
SarSensorGeometry.pack = function (value, array, startingIndex) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(value)) {
    throw new DeveloperError("value is required");
  }
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');

  startingIndex = defaultValue(startingIndex, 0);

  VertexFormat.pack(value._vertexFormat, array, startingIndex);
  startingIndex += VertexFormat.packedLength;

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

var scratchVertexFormat = new VertexFormat();
var scratchOptions = {
  vertexFormat: scratchVertexFormat,
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
 * @param {SarSensorGeometry} [result] The object into which to store the result.
 * @returns {SarSensorGeometry} The modified result parameter or a new SarSensorGeometry instance if one was not provided.
 */
SarSensorGeometry.unpack = function (array, startingIndex, result) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');

  startingIndex = defaultValue(startingIndex, 0);

  var vertexFormat = VertexFormat.unpack(
    array,
    startingIndex,
    scratchVertexFormat
  );
  startingIndex += VertexFormat.packedLength;

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
    return new SarSensorGeometry(scratchOptions);
  }

  result._vertexFormat = VertexFormat.clone(vertexFormat, result._vertexFormat);
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
 * Computes the geometric representation of a sarSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {SarSensorGeometry} sarSensorGeometry A description of the sarSensor.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
SarSensorGeometry.createGeometry = function (sarSensorGeometry) {
  var vertexFormat = sarSensorGeometry._vertexFormat;
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
  var normalIndex = 0;
  var tangentIndex = 0;
  var bitangentIndex = 0;
  var stIndex = 0;
  var index = 0;
  // 四个三角面 + 底面四边形
  var vertexCount = (3 * 4 + 4) * 2;
  var numIndices = 6 * 3 * 2;
  if (leftWidth === 0 || rightWidth === 0) {
    vertexCount = 3 * 4 + 4;
    numIndices = 6 * 3;
  }
  var indices = IndexDatatype.createTypedArray(vertexCount, numIndices);
  var positions = new Float64Array(vertexCount * 3);
  var normals = vertexFormat.normal
    ? new Float32Array(vertexCount * 3)
    : undefined;
  var tangents = vertexFormat.tangent
    ? new Float32Array(vertexCount * 3)
    : undefined;
  var bitangents = vertexFormat.bitangent
    ? new Float32Array(vertexCount * 3)
    : undefined;
  var st = vertexFormat.st ? new Float32Array(vertexCount * 2) : undefined;

  var min_left_length = length * Math.sin(minLeftAngle);
  var max_left_length = length * Math.sin(maxLeftAngle);
  var min_right_length = length * Math.sin(minRightAngle);
  var max_right_length = length * Math.sin(maxRightAngle);
  var half_left_range = leftWidth / 2;
  var half_right_range = rightWidth / 2;

  if (leftWidth > 0) {
    // 前面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;

    //右面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = -half_left_range;
    positions[positionIndex++] = -length;

    // 背面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = -half_left_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = -half_left_range;
    positions[positionIndex++] = -length;

    //左面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = -half_left_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;

    //底面
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = half_left_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = -min_left_length;
    positions[positionIndex++] = -half_left_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = -max_left_length;
    positions[positionIndex++] = -half_left_range;
    positions[positionIndex++] = -length;

    var angle = Math.atan2(length, half_left_range);
    var angles = [angle, -minLeftAngle, angle, maxLeftAngle];
    var computeNormal =
      vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent;
    for (let i = 0; i < 4; i++) {
      if (computeNormal) {
        var computeTangent = vertexFormat.tangent || vertexFormat.bitangent;
        var normal = normalScratch;
        var tangent = tangentScratch;
        var bitangent = bitangentScratch;
        var normalScale = 0.0;

        normal.z = Math.sin(angles[i]);
        normalScale = Math.cos(angles[i]);
        normal.x = normalScale * Math.cos(0.25 * i * CesiumMath.TWO_PI);
        normal.y = normalScale * Math.sin(0.25 * i * CesiumMath.TWO_PI);

        if (computeTangent) {
          tangent = Cartesian3.normalize(
            Cartesian3.cross(Cartesian3.UNIT_Z, normal, tangent),
            tangent
          );
        }

        // normal
        if (vertexFormat.normal) {
          normals[normalIndex++] = normal.x;
          normals[normalIndex++] = normal.y;
          normals[normalIndex++] = normal.z;
          normals[normalIndex++] = normal.x;
          normals[normalIndex++] = normal.y;
          normals[normalIndex++] = normal.z;
          normals[normalIndex++] = normal.x;
          normals[normalIndex++] = normal.y;
          normals[normalIndex++] = normal.z;
        }
        // tangent
        if (vertexFormat.tangent) {
          tangents[tangentIndex++] = tangent.x;
          tangents[tangentIndex++] = tangent.y;
          tangents[tangentIndex++] = tangent.z;
          tangents[tangentIndex++] = tangent.x;
          tangents[tangentIndex++] = tangent.y;
          tangents[tangentIndex++] = tangent.z;
          tangents[tangentIndex++] = tangent.x;
          tangents[tangentIndex++] = tangent.y;
          tangents[tangentIndex++] = tangent.z;
        }
        // bitangent
        if (vertexFormat.bitangent) {
          bitangent = Cartesian3.normalize(
            Cartesian3.cross(normal, tangent, bitangent),
            bitangent
          );
          bitangents[bitangentIndex++] = bitangent.x;
          bitangents[bitangentIndex++] = bitangent.y;
          bitangents[bitangentIndex++] = bitangent.z;
          bitangents[bitangentIndex++] = bitangent.x;
          bitangents[bitangentIndex++] = bitangent.y;
          bitangents[bitangentIndex++] = bitangent.z;
          bitangents[bitangentIndex++] = bitangent.x;
          bitangents[bitangentIndex++] = bitangent.y;
          bitangents[bitangentIndex++] = bitangent.z;
        }
      }
    }
    //底面
    if (vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent) {
      // normal
      if (vertexFormat.normal) {
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = -1.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = -1.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = -0.0;
        normals[normalIndex++] = -1.0;
        normals[normalIndex++] = -0.0;
        normals[normalIndex++] = -0.0;
        normals[normalIndex++] = -1.0;
      }
      // tangent
      if (vertexFormat.tangent) {
        tangents[tangentIndex++] = -1.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = -1;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = -1.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = -1.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
      }
      // bitangent
      if (vertexFormat.bitangent) {
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
      }
    }
    // uv
    var maxRange = Math.max(leftWidth, rightWidth);
    if (vertexFormat.st) {
      for (let i = 0; i < 3 * 4; i++) {
        var position = Cartesian3.fromArray(positions, i * 3, positionScratch);
        st[stIndex++] =
          (position.x + max_left_length) / (max_left_length + max_right_length);
        st[stIndex++] = position.y / maxRange + 0.5;
      }

      st[stIndex++] = 0.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 0.0;
      st[stIndex++] = 0.0;
      st[stIndex++] = 0.0;
    }

    // face
    indices[index++] = 0;
    indices[index++] = 2;
    indices[index++] = 1;

    indices[index++] = 3;
    indices[index++] = 5;
    indices[index++] = 4;

    indices[index++] = 6;
    indices[index++] = 8;
    indices[index++] = 7;
    indices[index++] = 9;
    indices[index++] = 11;
    indices[index++] = 10;

    indices[index++] = 12;
    indices[index++] = 13;
    indices[index++] = 14;

    indices[index++] = 12;
    indices[index++] = 14;
    indices[index++] = 15;
  }

  var rightStartPositionIndex = Math.floor(positionIndex / 3);

  if (rightWidth > 0) {
    // 前面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = min_right_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;

    //右面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;

    // 背面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = min_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;

    //左面
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = min_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = min_right_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;

    //底面
    positions[positionIndex++] = min_left_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = half_right_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = max_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;
    positions[positionIndex++] = min_right_length;
    positions[positionIndex++] = -half_right_range;
    positions[positionIndex++] = -length;

    var angle = Math.atan2(length, half_right_range);
    var angles = [angle, maxRightAngle, angle, -minRightAngle];
    var computeNormal =
      vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent;
    for (let i = 0; i < 4; i++) {
      if (computeNormal) {
        var computeTangent = vertexFormat.tangent || vertexFormat.bitangent;
        var normal = normalScratch;
        var tangent = tangentScratch;
        var bitangent = bitangentScratch;
        var normalScale = 0.0;

        if (computeTangent) {
          tangent = Cartesian3.normalize(
            Cartesian3.cross(Cartesian3.UNIT_Z, normal, tangent),
            tangent
          );
        }

        // normal
        if (vertexFormat.normal) {
          normal.z = Math.sin(angles[i]);
          normalScale = Math.cos(angles[i]);
          normal.x = normalScale * Math.cos(0.25 * i * CesiumMath.TWO_PI);
          normal.y = normalScale * Math.sin(0.25 * i * CesiumMath.TWO_PI);
          normals[normalIndex++] = normal.x;
          normals[normalIndex++] = normal.y;
          normals[normalIndex++] = normal.z;
          normals[normalIndex++] = normal.x;
          normals[normalIndex++] = normal.y;
          normals[normalIndex++] = normal.z;
          normals[normalIndex++] = normal.x;
          normals[normalIndex++] = normal.y;
          normals[normalIndex++] = normal.z;
        }
        // tangent
        if (vertexFormat.tangent) {
          tangents[tangentIndex++] = tangent.x;
          tangents[tangentIndex++] = tangent.y;
          tangents[tangentIndex++] = tangent.z;
          tangents[tangentIndex++] = tangent.x;
          tangents[tangentIndex++] = tangent.y;
          tangents[tangentIndex++] = tangent.z;
          tangents[tangentIndex++] = tangent.x;
          tangents[tangentIndex++] = tangent.y;
          tangents[tangentIndex++] = tangent.z;
        }
        // bitangent
        if (vertexFormat.bitangent) {
          bitangent = Cartesian3.normalize(
            Cartesian3.cross(normal, tangent, bitangent),
            bitangent
          );
          bitangents[bitangentIndex++] = bitangent.x;
          bitangents[bitangentIndex++] = bitangent.y;
          bitangents[bitangentIndex++] = bitangent.z;
          bitangents[bitangentIndex++] = bitangent.x;
          bitangents[bitangentIndex++] = bitangent.y;
          bitangents[bitangentIndex++] = bitangent.z;
          bitangents[bitangentIndex++] = bitangent.x;
          bitangents[bitangentIndex++] = bitangent.y;
          bitangents[bitangentIndex++] = bitangent.z;
        }
      }
    }
    //底面
    if (vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent) {
      // normal
      if (vertexFormat.normal) {
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = -1.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = -1.0;
        normals[normalIndex++] = 0.0;
        normals[normalIndex++] = -0.0;
        normals[normalIndex++] = -1.0;
        normals[normalIndex++] = -0.0;
        normals[normalIndex++] = -0.0;
        normals[normalIndex++] = -1.0;
      }
      // tangent
      if (vertexFormat.tangent) {
        tangents[tangentIndex++] = -1.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = -1;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = -1.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = -1.0;
        tangents[tangentIndex++] = 0.0;
        tangents[tangentIndex++] = 0.0;
      }
      // bitangent
      if (vertexFormat.bitangent) {
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 0.0;
        bitangents[bitangentIndex++] = 1.0;
        bitangents[bitangentIndex++] = 0.0;
      }
    }
    // uv
    if (vertexFormat.st) {
      for (let i = 0; i < 3 * 4; i++) {
        var position = Cartesian3.fromArray(positions, i * 3, positionScratch);
        st[stIndex++] =
          (position.x + leftHalfAngle) / (leftHalfAngle + rightHalfAngle);
        st[stIndex++] =
          (position.y + backHalfAngle) / (frontHalfAngle + backHalfAngle);
      }

      st[stIndex++] = 0.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 1.0;
      st[stIndex++] = 0.0;
      st[stIndex++] = 0.0;
      st[stIndex++] = 0.0;
    }

    // face
    indices[index++] = rightStartPositionIndex;
    indices[index++] = rightStartPositionIndex + 2;
    indices[index++] = rightStartPositionIndex + 1;

    indices[index++] = rightStartPositionIndex + 3;
    indices[index++] = rightStartPositionIndex + 5;
    indices[index++] = rightStartPositionIndex + 4;

    indices[index++] = rightStartPositionIndex + 6;
    indices[index++] = rightStartPositionIndex + 8;
    indices[index++] = rightStartPositionIndex + 7;
    indices[index++] = rightStartPositionIndex + 9;
    indices[index++] = rightStartPositionIndex + 11;
    indices[index++] = rightStartPositionIndex + 10;

    indices[index++] = rightStartPositionIndex + 12;
    indices[index++] = rightStartPositionIndex + 13;
    indices[index++] = rightStartPositionIndex + 14;

    indices[index++] = rightStartPositionIndex + 12;
    indices[index++] = rightStartPositionIndex + 14;
    indices[index++] = rightStartPositionIndex + 15;
  }
  var attributes = new GeometryAttributes();
  if (vertexFormat.position) {
    attributes.position = new GeometryAttribute({
      componentDatatype: ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: positions,
    });
  }

  if (vertexFormat.normal) {
    attributes.normal = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: normals,
    });
  }

  if (vertexFormat.tangent) {
    attributes.tangent = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: tangents,
    });
  }

  if (vertexFormat.bitangent) {
    attributes.bitangent = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: bitangents,
    });
  }

  if (vertexFormat.st) {
    attributes.st = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 2,
      values: st,
    });
  }

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
    primitiveType: PrimitiveType.TRIANGLES,
    boundingSphere: boundingSphere,
    offsetAttribute: sarSensorGeometry._offsetAttribute,
  });
};

export default SarSensorGeometry;
