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
 * A description of a rectangleSensor.
 *
 * @alias RectangleSensorGeometry
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {Number} options.length The length of the rectangleSensor.
 * @param {Number} options.topRadius The radius of the top of the rectangleSensor.
 * @param {Number} options.bottomRadius The radius of the bottom of the rectangleSensor.
 * @param {Number} [options.slices=128] The number of edges around the perimeter of the rectangleSensor.
 * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
 *
 * @exception {DeveloperError} options.slices must be greater than or equal to 3.
 *
 * @see RectangleSensorGeometry.createGeometry
 *
 * @example
 * // create rectangleSensor geometry
 * var rectangleSensor = new Cesium.RectangleSensorGeometry({
 *     length: 200000,
 *     topRadius: 80000,
 *     bottomRadius: 200000,
 * });
 * var geometry = Cesium.RectangleSensorGeometry.createGeometry(rectangleSensor);
 */
function RectangleSensorGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var vertexFormat = defaultValue(options.vertexFormat, VertexFormat.DEFAULT);
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
  this._vertexFormat = VertexFormat.clone(vertexFormat);
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createRectangleSensorGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
RectangleSensorGeometry.packedLength = VertexFormat.packedLength + 6;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {RectangleSensorGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
RectangleSensorGeometry.pack = function (value, array, startingIndex) {
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
  array[startingIndex++] = value._leftHalfAngle;
  array[startingIndex++] = value._rightHalfAngle;
  array[startingIndex++] = value._frontHalfAngle;
  array[startingIndex++] = value._backHalfAngle;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchVertexFormat = new VertexFormat();
var scratchOptions = {
  vertexFormat: scratchVertexFormat,
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
 * @param {RectangleSensorGeometry} [result] The object into which to store the result.
 * @returns {RectangleSensorGeometry} The modified result parameter or a new RectangleSensorGeometry instance if one was not provided.
 */
RectangleSensorGeometry.unpack = function (array, startingIndex, result) {
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
    return new RectangleSensorGeometry(scratchOptions);
  }

  result._vertexFormat = VertexFormat.clone(vertexFormat, result._vertexFormat);
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
 * Computes the geometric representation of a rectangleSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {RectangleSensorGeometry} rectangleSensorGeometry A description of the rectangleSensor.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
RectangleSensorGeometry.createGeometry = function (rectangleSensorGeometry) {
  var vertexFormat = rectangleSensorGeometry._vertexFormat;
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
  var normalIndex = 0;
  var tangentIndex = 0;
  var bitangentIndex = 0;
  var stIndex = 0;
  var index = 0;
  // 上下顶 + 外面 + 内面
  var vertexCount = 3 * 4 + 4;
  // 上下面 + 内外面 + 2个截面
  var numIndices = 18;
  var indices  = IndexDatatype.createTypedArray(vertexCount, numIndices);
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

  let front_length = length * Math.sin(frontHalfAngle);
  let back_length = length * Math.sin(backHalfAngle);
  let left_length = length * Math.sin(leftHalfAngle);
  let right_length = length * Math.sin(rightHalfAngle);
  let x_length = left_length + right_length;
  let y_length = front_length + back_length;
  // 前面
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;

  //右面
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;

  // 背面
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;

  //左面
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;

  //底面
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = front_length;
  positions[positionIndex++] = -length;
  positions[positionIndex++] = right_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;
  positions[positionIndex++] = -left_length;
  positions[positionIndex++] = -back_length;
  positions[positionIndex++] = -length;

  var angles = [frontHalfAngle,rightHalfAngle,backHalfAngle,leftHalfAngle];
  var computeNormal =
    vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent;
  for(let i=0; i<4;i++) {
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
    for (i = 0; i < 3 * 4; i++) {
      var position = Cartesian3.fromArray(positions, i * 3, positionScratch);
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

  // console.log(index);
  // console.log(numIndices);


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
  radiusScratch.y = Math.max(Math.max(left_length,right_length,front_length,back_length));

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
    primitiveType: PrimitiveType.TRIANGLES,
    boundingSphere: boundingSphere,
    offsetAttribute: rectangleSensorGeometry._offsetAttribute,
  });
};

export default RectangleSensorGeometry;
