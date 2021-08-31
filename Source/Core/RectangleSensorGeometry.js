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
  var leftHalfAngle = defaultValue(options.topInnerRadius, CesiumMath.PI_OVER_SIX);
  var rightHalfAngle = defaultValue(options.topOuterRadius, CesiumMath.PI_OVER_SIX);
  var frontHalfAngle = defaultValue(options.topInnerRadius, CesiumMath.PI_OVER_SIX);
  var backHalfAngle = defaultValue(options.topOuterRadius, CesiumMath.PI_OVER_SIX);
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
  var vertexCount = 10;
  // 上下面 + 内外面 + 2个截面
  var numIndices = 6;
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

  // 顶点
  positions[positionIndex++] = 0;
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -length/2;
  // 前点
  positions[positionIndex++] = 0;
  positions[positionIndex++] = length * Math.sin(frontHalfAngle);
  positions[positionIndex++] = -3 * length/2;
  // 后点
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -length * Math.sin(backHalfAngle);
  positions[positionIndex++] = -3 * length/2;
  // 左点
  positions[positionIndex++] = -length * Math.sin(leftHalfAngle);
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -3 * length/2;
  // 右点
  positions[positionIndex++] = length * Math.sin(rightHalfAngle);
  positions[positionIndex++] = 0;
  positions[positionIndex++] = -3 * length/2;
  // some helper variables
  let radius = topInnerRadius;
  let radiusStep = ((topOuterRadius - topInnerRadius) / phiSegments);
  // generate vertices, normals and uvs
  for (let j = 0; j <= phiSegments; j++) {

    for (let i = 0; i <= thetaSegments; i++) {

      // values are generate from the inside of the ring to the outside
      let segment = thetaStart + i / thetaSegments * thetaLength;

      // vertex
      let x = radius * Math.cos(segment);
      let y = radius * Math.sin(segment);

      positions[positionIndex++] = x;
      positions[positionIndex++] = y;
      positions[positionIndex++] = -length / 2 ;

      if (vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent) {
        // normal
        if (vertexFormat.normal) {
          normals[normalIndex++] = 0;
          normals[normalIndex++] = 0;
          normals[normalIndex++] = 1;
        }

        // tangent
        if (vertexFormat.tangent) {
          tangents[tangentIndex++] = 1;
          tangents[tangentIndex++] = 0;
          tangents[tangentIndex++] = 0;
        }

        // bitangent
        if (vertexFormat.bitangent) {
          bitangents[bitangentIndex++] = 0;
          bitangents[bitangentIndex++] = 1;
          bitangents[bitangentIndex++] = 0;
        }
      }

      // uv
      if (vertexFormat.st) {
        st[stIndex++] = (x / topOuterRadius + 1) / 2;
        st[stIndex++] = (y / topOuterRadius + 1) / 2;
      }
    }

    // increase the radius for next row of vertices
    radius += radiusStep;

  }

  let topStart = 0;
  for (let j = 0; j < phiSegments; j++) {

    let thetaSegmentLevel = j * (thetaSegments + 1);

    for (let i = 0; i < thetaSegments; i++) {

      let segment = i + thetaSegmentLevel;

      var a = topStart + segment;
      var b = topStart + segment + thetaSegments + 1;
      var c = topStart + segment + thetaSegments + 2;
      var d = topStart + segment + 1;

      // faces
      indices[index++] = a;
      indices[index++] = b;
      indices[index++] = d;
      indices[index++] = b;
      indices[index++] = c;
      indices[index++] = d;
    }
  }
  // 底面
  radius = bottomOuterRadius;
  radiusStep = ((bottomInnerRadius - bottomOuterRadius) / phiSegments);
  for (let j = 0; j <= phiSegments; j++) {

    for (let i = 0; i <= thetaSegments; i++) {

      // values are generate from the inside of the ring to the outside
      let segment = thetaStart + i / thetaSegments * thetaLength;

      // vertex
      let x = radius * Math.cos(segment);
      let y = radius * Math.sin(segment);
      positions[positionIndex++] = x;
      positions[positionIndex++] = y;
      positions[positionIndex++] = -length / 2 * 3;

      if (vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent) {
        // normal
        if (vertexFormat.normal) {
          normals[normalIndex++] = 0;
          normals[normalIndex++] = 0;
          normals[normalIndex++] = -1;
        }

        // tangent
        if (vertexFormat.tangent) {
          tangents[tangentIndex++] = 1;
          tangents[tangentIndex++] = 0;
          tangents[tangentIndex++] = 0;
        }

        // bitangent
        if (vertexFormat.bitangent) {
          bitangents[bitangentIndex++] = 0;
          bitangents[bitangentIndex++] = -1;
          bitangents[bitangentIndex++] = 0;
        }
      }

      // uv
      if (vertexFormat.st) {
        st[stIndex++] = (x / bottomOuterRadius + 1) / 2;
        st[stIndex++] = (y / bottomOuterRadius + 1) / 2;
      }
    }

    // increase the radius for next row of vertices
    radius += radiusStep;

  }
  let bottomStart = (phiSegments + 1) * (thetaSegments + 1);
  for (let j = 0; j < phiSegments; j++) {

    let thetaSegmentLevel = j * (thetaSegments + 1);

    for (let i = 0; i < thetaSegments; i++) {

      let segment = i + thetaSegmentLevel;

      var a = bottomStart + segment;
      var b = bottomStart + segment + thetaSegments + 1;
      var c = bottomStart + segment + thetaSegments + 2;
      var d = bottomStart + segment + 1;

      // faces
      indices[index++] = a;
      indices[index++] = b;
      indices[index++] = d;
      indices[index++] = b;
      indices[index++] = c;
      indices[index++] = d;
    }
  }

  // 内面
  for(let i = thetaSegments; i >=0; i--) {
    let segment = thetaStart + i / thetaSegments * thetaLength;
    let cos = Math.cos(segment);
    let sin = Math.sin(segment);
    positions[positionIndex++] = topInnerRadius * cos;
    positions[positionIndex++] = topInnerRadius * sin;
    positions[positionIndex++] = -length / 2;
    positions[positionIndex++] = bottomInnerRadius * cos;
    positions[positionIndex++] = bottomInnerRadius * sin;
    positions[positionIndex++] = -length / 2 * 3;

    let theta = Math.atan2(Math.abs(topInnerRadius - bottomInnerRadius), length);
    let normalScale = Math.cos(theta);

    let normal = new Cartesian3();
    let tangent = new Cartesian3();
    let bitangent = new Cartesian3();
    normal.z = -Math.sin(theta);
    normal.x = -normalScale * cos;
    normal.y = -normalScale * sin;
    if (vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent) {
      // normal
      if (vertexFormat.normal) {
        normals[normalIndex++] = normal.x;
        normals[normalIndex++] = normal.y;
        normals[normalIndex++] = normal.z;

        normals[normalIndex++] = normal.x;
        normals[normalIndex++] = normal.y;
        normals[normalIndex++] = normal.z;
      }

      tangent = Cartesian3.normalize(Cartesian3.cross(Cartesian3.UNIT_Z, normal,tangent),tangent);
      // tangent
      if (vertexFormat.tangent) {
        tangents[tangentIndex++] = tangent.x;
        tangents[tangentIndex++] = tangent.y;
        tangents[tangentIndex++] = tangent.z;

        tangents[tangentIndex++] = tangent.x;
        tangents[tangentIndex++] = tangent.y;
        tangents[tangentIndex++] = tangent.z;
      }

      bitangent = Cartesian3.normalize(
        Cartesian3.cross(normal, tangent, bitangent),
        bitangent
      );

      // bitangent
      if (vertexFormat.bitangent) {
        bitangents[bitangentIndex++] = bitangent.x;
        bitangents[bitangentIndex++] = bitangent.y;
        bitangents[bitangentIndex++] = bitangent.z;

        bitangents[bitangentIndex++] = bitangent.x;
        bitangents[bitangentIndex++] = bitangent.y;
        bitangents[bitangentIndex++] = bitangent.z;
      }
    }

    // uv
    if (vertexFormat.st) {
      var rad = Math.max(topInnerRadius, bottomInnerRadius);
      st[stIndex++] = (x + rad) / (2.0 * rad);
      st[stIndex++] = (y + rad) / (2.0 * rad);

      st[stIndex++] = (x + rad) / (2.0 * rad);
      st[stIndex++] = (y + rad) / (2.0 * rad);
    }
  }

  let innserStart = (phiSegments + 1) * (thetaSegments + 1) * 2;
  for (let i = 0; i < thetaSegments; i++) {
    let a = innserStart + i * 2;
    let b = innserStart + i * 2 + 1
    let c = innserStart + i * 2 + 3;
    let d = innserStart + i * 2 + 2;
    // faces
    indices[index++] = a;
    indices[index++] = b;
    indices[index++] = d;
    indices[index++] = b;
    indices[index++] = c;
    indices[index++] = d;
  }

  // 外面

  for(let i = 0; i<thetaSegments + 1; i++) {
    let segment = thetaStart + i / thetaSegments * thetaLength;
    let cos = Math.cos(segment);
    let sin = Math.sin(segment);
    positions[positionIndex++] = topOuterRadius * cos;
    positions[positionIndex++] = topOuterRadius * sin;
    positions[positionIndex++] = -length / 2;

    positions[positionIndex++] = bottomOuterRadius * cos;
    positions[positionIndex++] = bottomOuterRadius * sin;
    positions[positionIndex++] = -length / 2 * 3;

    let theta = Math.atan2(Math.abs(bottomOuterRadius - topOuterRadius), length);
    let normalScale = Math.cos(theta);

    let normal = new Cartesian3();
    let tangent = new Cartesian3();
    let bitangent = new Cartesian3();
    normal.z = Math.sin(theta);
    normal.x = normalScale * Math.cos(segment);
    normal.y = normalScale * Math.sin(segment);
    if (vertexFormat.normal || vertexFormat.tangent || vertexFormat.bitangent) {
      // normal
      if (vertexFormat.normal) {
        normals[normalIndex++] = normal.x;
        normals[normalIndex++] = normal.y;
        normals[normalIndex++] = normal.z;

        normals[normalIndex++] = normal.x;
        normals[normalIndex++] = normal.y;
        normals[normalIndex++] = normal.z;
      }

      tangent = Cartesian3.normalize(Cartesian3.cross(Cartesian3.UNIT_Z, normal,tangent),tangent);
      // tangent
      if (vertexFormat.tangent) {
        tangents[tangentIndex++] = tangent.x;
        tangents[tangentIndex++] = tangent.y;
        tangents[tangentIndex++] = tangent.z;

        tangents[tangentIndex++] = tangent.x;
        tangents[tangentIndex++] = tangent.y;
        tangents[tangentIndex++] = tangent.z;
      }

      bitangent = Cartesian3.normalize(
        Cartesian3.cross(normal, tangent, bitangent),
        bitangent
      );

      // bitangent
      if (vertexFormat.bitangent) {
        bitangents[bitangentIndex++] = bitangent.x;
        bitangents[bitangentIndex++] = bitangent.y;
        bitangents[bitangentIndex++] = bitangent.z;

        bitangents[bitangentIndex++] = bitangent.x;
        bitangents[bitangentIndex++] = bitangent.y;
        bitangents[bitangentIndex++] = bitangent.z;
      }
    }

    // uv
    if (vertexFormat.st) {
      var rad = Math.max(topOuterRadius, bottomOuterRadius);
      st[stIndex++] = (x + rad) / (2.0 * rad);
      st[stIndex++] = (y + rad) / (2.0 * rad);

      st[stIndex++] = (x + rad) / (2.0 * rad);
      st[stIndex++] = (y + rad) / (2.0 * rad);
    }
  }

  let outerStart = (phiSegments + 1) * (thetaSegments + 1) * 2 + (thetaSegments + 1) * 2;
  for (let i = 0; i < thetaSegments; i++) {
    let a = outerStart + i * 2;
    let b = outerStart + i * 2 + 1;
    let c = outerStart + i * 2 + 3;
    let d = outerStart + i * 2 + 2;
    // faces
    indices[index++] = a;
    indices[index++] = b;
    indices[index++] = d;
    indices[index++] = b;
    indices[index++] = c;
    indices[index++] = d;
  }

  // 两个截面
  let ist = outerStart -2;
  let isd = outerStart - 1;
  let iet = innserStart + 0;
  let ied = innserStart + 1;
  let ost = outerStart + 0;
  let osd = outerStart + 1;
  let oet = vertexCount -2;
  let oed = vertexCount -1;

  indices[index++] = ost;
  indices[index++] = isd;
  indices[index++] = osd;

  indices[index++] = ost;
  indices[index++] = ist;
  indices[index++] = isd;

  indices[index++] = iet;
  indices[index++] = oed;
  indices[index++] = ied;

  indices[index++] = iet;
  indices[index++] = oet;
  indices[index++] = oed;

  console.log(index);
  console.log(numIndices);
  console.log(positionIndex / 3);
  console.log(vertexCount);

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

  var radiusScratch = new Cartesian2();
  radiusScratch.x = length;
  radiusScratch.y = Math.max(topOuterRadius,bottomOuterRadius);

  var boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, -length/2),
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
