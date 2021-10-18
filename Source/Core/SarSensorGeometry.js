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
 * @alias RarSensorGeometry
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
 * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
 *
 * @exception {DeveloperError} options.length must be greater than 0.
 *
 * @see RarSensorGeometry.createGeometry
 *
 * @example
 * // create sarSensor geometry
 * var sarSensor = new Cesium.RarSensorGeometry({
 *     length: 200000,
 *     leftRange: 2000
 * });
 * var geometry = Cesium.RarSensorGeometry.createGeometry(sarSensor);
 */
function RarSensorGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var vertexFormat = defaultValue(options.vertexFormat, VertexFormat.DEFAULT);
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
  this._vertexFormat = VertexFormat.clone(vertexFormat);
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createSarSensorGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
RarSensorGeometry.packedLength = VertexFormat.packedLength + 8;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {RarSensorGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
RarSensorGeometry.pack = function (value, array, startingIndex) {
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
  array[startingIndex++] = value._leftRange;
  array[startingIndex++] = value._rightRange;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchVertexFormat = new VertexFormat();
var scratchOptions = {
  vertexFormat: scratchVertexFormat,
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
 * @param {RarSensorGeometry} [result] The object into which to store the result.
 * @returns {RarSensorGeometry} The modified result parameter or a new RarSensorGeometry instance if one was not provided.
 */
RarSensorGeometry.unpack = function (array, startingIndex, result) {
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
    return new RarSensorGeometry(scratchOptions);
  }

  result._vertexFormat = VertexFormat.clone(vertexFormat, result._vertexFormat);
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
 * Computes the geometric representation of a sarSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {RarSensorGeometry} sarSensorGeometry A description of the sarSensor.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
RarSensorGeometry.createGeometry = function (sarSensorGeometry) {
  let vertexFormat = sarSensorGeometry._vertexFormat;
  let length = sarSensorGeometry._length;
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
  let positionIndex = 0;
  let normalIndex = 0;
  let tangentIndex = 0;
  let bitangentIndex = 0;
  let stIndex = 0;
  let index = 0;
  // 四个三角面 + 底面四边形
  let vertexCount = (3 * 4 + 4) * 2;
  let numIndices = 6 * 3 * 2;
  if(leftRange === 0 || rightRange === 0) {
    vertexCount = 3 * 4 + 4;
    numIndices = 6 *3;
  }
  let indices  = IndexDatatype.createTypedArray(vertexCount, numIndices);
  let positions = new Float64Array(vertexCount * 3);
  let normals = vertexFormat.normal
                ? new Float32Array(vertexCount * 3)
                : undefined;
  let tangents = vertexFormat.tangent
                 ? new Float32Array(vertexCount * 3)
                 : undefined;
  let bitangents = vertexFormat.bitangent
                   ? new Float32Array(vertexCount * 3)
                   : undefined;
  let st = vertexFormat.st ? new Float32Array(vertexCount * 2) : undefined;

  let min_left_length = length * Math.sin(minLeftAngle);
  let max_left_length = length * Math.sin(maxLeftAngle);
  let min_right_length = length * Math.sin(minRightAngle);
  let max_right_length = length * Math.sin(maxRightAngle);
  let half_left_range = leftRange / 2;
  let half_right_range = rightRange / 2;


  if(leftRange > 0) {
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

    let angle = Math.atan2(length,half_left_range);
    let angles = [angle,-minLeftAngle,angle,maxLeftAngle];
    let computeNormal =
      vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent;
    for(let i=0; i<4;i++) {
      if (computeNormal) {
        let computeTangent = vertexFormat.tangent || vertexFormat.bitangent;
        let normal = normalScratch;
        let tangent = tangentScratch;
        let bitangent = bitangentScratch;
        let normalScale = 0.0;

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
    let maxRange = Math.max(leftRange,rightRange);
    if (vertexFormat.st) {
      for (i = 0; i < 3 * 4; i++) {
        let position = Cartesian3.fromArray(positions, i * 3, positionScratch);
        st[stIndex++] = (position.x + max_left_length) / (max_left_length + max_right_length);
        st[stIndex++] = (position.y / maxRange) + 0.5;
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
    indices[index++] = 7
    ;
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

  let rightStartPositionIndex = Math.floor(positionIndex / 3);

  if(rightRange > 0) {
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

    let angle = Math.atan2(length,half_right_range);
    let angles = [angle,maxRightAngle,angle,-minRightAngle];
    let computeNormal =
      vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent;
    for(let i=0; i<4;i++) {
      if (computeNormal) {
        let computeTangent = vertexFormat.tangent || vertexFormat.bitangent;
        let normal = normalScratch;
        let tangent = tangentScratch;
        let bitangent = bitangentScratch;
        let normalScale = 0.0;

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
      for (i = 0; i < 3 * 4; i++) {
        let position = Cartesian3.fromArray(positions, i * 3, positionScratch);
        st[stIndex++] = (position.x + leftHalfAngle) / (leftHalfAngle + rightHalfAngle);
        st[stIndex++] = (position.y + backHalfAngle) / (frontHalfAngle + backHalfAngle);
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
    indices[index++] = rightStartPositionIndex + 7
    ;
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
  let attributes = new GeometryAttributes();
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
  let ll = max_left_length * max_left_length + half_left_range * half_left_range;
  let rr = max_right_length * max_right_length + half_right_range * half_right_range;
  radiusScratch.y = Math.max(Math.sqrt(ll), Math.sqrt(rr));

  let boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, 0),
    Cartesian2.magnitude(radiusScratch)
  );

  if (defined(sarSensorGeometry._offsetAttribute)) {
    length = positions.length;
    let applyOffset = new Uint8Array(length / 3);
    let offsetValue =
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

export default RarSensorGeometry;
