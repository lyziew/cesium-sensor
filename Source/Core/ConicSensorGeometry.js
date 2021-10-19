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
 * A description of a conicSensor.
 *
 * @alias ConicSensorGeometry
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {Number} options.length The length of the conicSensor.
 * @param {Number} options.topInnerRadius The radius of the top of the conicSensor.
 * @param {Number} options.topOuterRadius The radius of the top of the conicSensor.
 * @param {Number} options.bottomInnerRadius The radius of the bottom of the conicSensor.
 * @param {Number} options.bottomOuterRadius The radius of the bottom of the conicSensor.
 * @param {Number} [options.thetaSegments=32] The number of edges around the perimeter of the conicSensor.
 * @param {Number} [options.phiSegments=1] The number of edges around the perimeter of the conicSensor.
 * @param {Number} [options.thetaStart=0] The number of edges around the perimeter of the conicSensor.
 * @param {Number} [options.thetaLength=CesiumMath.TWO_PI] The number of edges around the perimeter of the conicSensor.
 * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
 *
 * @exception {DeveloperError} options.slices must be greater than or equal to 3.
 *
 * @see ConicSensorGeometry.createGeometry
 *
 * @example
 * // create conicSensor geometry
 * var conicSensor = new Cesium.ConicSensorGeometry({
 *     length: 200000,
 *     topRadius: 80000,
 *     bottomRadius: 200000,
 * });
 * var geometry = Cesium.ConicSensorGeometry.createGeometry(conicSensor);
 */
function ConicSensorGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var vertexFormat = defaultValue(options.vertexFormat, VertexFormat.DEFAULT);
  var length = options.length;
  var topInnerRadius = defaultValue(options.topInnerRadius, 0.0);
  var topOuterRadius = defaultValue(options.topOuterRadius, 0.0);
  var bottomInnerRadius = defaultValue(options.bottomInnerRadius, 0.0);
  var bottomOuterRadius = options.bottomOuterRadius;
  var thetaSegments = defaultValue(options.thetaSegments, 32);
  var phiSegments = defaultValue(options.phiSegments, 1);
  var thetaStart = defaultValue(options.thetaStart, 0.0);
  var thetaLength = defaultValue(options.thetaLength, CesiumMath.TWO_PI);

  //>>includeStart('debug', pragmas.debug);
  if (!defined(length)) {
    throw new DeveloperError("options.length must be defined.");
  }
  if (!defined(bottomOuterRadius)) {
    throw new DeveloperError("options.bottomOuterRadius must be defined.");
  }

  if (thetaSegments < 3) {
    throw new DeveloperError(
      "options.slices must be greater than or equal to 3."
    );
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
  this._topInnerRadius = topInnerRadius;
  this._topOuterRadius = topOuterRadius;
  this._bottomInnerRadius = bottomInnerRadius;
  this._bottomOuterRadius = bottomOuterRadius;
  this._thetaSegments = thetaSegments;
  this._phiSegments = phiSegments;
  this._thetaStart = thetaStart;
  this._thetaLength = thetaLength;
  this._vertexFormat = VertexFormat.clone(vertexFormat);
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createConicSensorGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
ConicSensorGeometry.packedLength = VertexFormat.packedLength + 10;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {ConicSensorGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
ConicSensorGeometry.pack = function (value, array, startingIndex) {
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
  array[startingIndex++] = value._topInnerRadius;
  array[startingIndex++] = value._topOuterRadius;
  array[startingIndex++] = value._bottomInnerRadius;
  array[startingIndex++] = value._bottomOuterRadius;
  array[startingIndex++] = value._thetaSegments;
  array[startingIndex++] = value._phiSegments;
  array[startingIndex++] = value._thetaStart;
  array[startingIndex++] = value._thetaLength;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchVertexFormat = new VertexFormat();
var scratchOptions = {
  vertexFormat: scratchVertexFormat,
  length: undefined,
  topInnerRadius: undefined,
  topOuterRadius: undefined,
  bottomInnerRadius: undefined,
  bottomOuterRadius: undefined,
  thetaSegments: undefined,
  phiSegments: undefined,
  thetaStart: undefined,
  thetaLength: undefined,
  offsetAttribute: undefined,
};

/**
 * Retrieves an instance from a packed array.
 *
 * @param {Number[]} array The packed array.
 * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
 * @param {ConicSensorGeometry} [result] The object into which to store the result.
 * @returns {ConicSensorGeometry} The modified result parameter or a new ConicSensorGeometry instance if one was not provided.
 */
ConicSensorGeometry.unpack = function (array, startingIndex, result) {
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
  var topInnerRadius = array[startingIndex++];
  var topOuterRadius = array[startingIndex++];
  var bottomInnerRadius = array[startingIndex++];
  var bottomOuterRadius = array[startingIndex++];
  var thetaSegments = array[startingIndex++];
  var phiSegments = array[startingIndex++];
  var thetaStart = array[startingIndex++];
  var thetaLength = array[startingIndex++];
  var offsetAttribute = array[startingIndex];

  if (!defined(result)) {
    scratchOptions.length = length;
    scratchOptions.topInnerRadius = topInnerRadius;
    scratchOptions.topOuterRadius = topOuterRadius;
    scratchOptions.bottomInnerRadius = bottomInnerRadius;
    scratchOptions.bottomOuterRadius = bottomOuterRadius;
    scratchOptions.thetaSegments = thetaSegments;
    scratchOptions.phiSegments = phiSegments;
    scratchOptions.thetaStart = thetaStart;
    scratchOptions.thetaLength = thetaLength;
    scratchOptions.offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;
    return new ConicSensorGeometry(scratchOptions);
  }

  result._vertexFormat = VertexFormat.clone(vertexFormat, result._vertexFormat);
  result._length = length;
  result._topInnerRadius = topInnerRadius;
  result._topOuterRadius = topOuterRadius;
  result._bottomInnerRadius = bottomInnerRadius;
  result._bottomOuterRadius = bottomOuterRadius;
  result._thetaSegments = thetaSegments;
  result._phiSegments = phiSegments;
  result._thetaStart = thetaStart;
  result._thetaLength = thetaLength;
  result._offsetAttribute =
    offsetAttribute === -1 ? undefined : offsetAttribute;

  return result;
};

/**
 * Computes the geometric representation of a conicSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {ConicSensorGeometry} conicSensorGeometry A description of the conicSensor.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
ConicSensorGeometry.createGeometry = function (conicSensorGeometry) {
  var vertexFormat = conicSensorGeometry._vertexFormat;
  var length = conicSensorGeometry._length;
  var topInnerRadius = conicSensorGeometry._topInnerRadius;
  var topOuterRadius = conicSensorGeometry._topOuterRadius;
  var bottomInnerRadius = conicSensorGeometry._bottomInnerRadius;
  var bottomOuterRadius = conicSensorGeometry._bottomOuterRadius;
  var thetaSegments = conicSensorGeometry._thetaSegments;
  var phiSegments = conicSensorGeometry._phiSegments;
  var thetaStart = conicSensorGeometry._thetaStart;
  var thetaLength = conicSensorGeometry._thetaLength;
  // 起始弧度
  thetaStart = thetaStart !== undefined ? thetaStart : 0;
  // 总弧度
  thetaLength = thetaLength !== undefined ? thetaLength : CesiumMath.TWO_PI;
  // 上下表面角度切分
  thetaSegments = thetaSegments !== undefined ? Math.max(3, thetaSegments) : 32;
  // 内外横向表面切分
  phiSegments = phiSegments !== undefined ? Math.max(1, phiSegments) : 1;

  if (
    length <= 0 ||
    topInnerRadius < 0 ||
    topOuterRadius < 0 ||
    bottomInnerRadius < 0 ||
    bottomOuterRadius === 0
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
  var vertexCount =
    (phiSegments + 1) * (thetaSegments + 1) * 2 + (thetaSegments + 1) * 4;
  // 上下面 + 内外面
  var numIndices =
    phiSegments * thetaSegments * 2 * 2 * 3 + thetaSegments * 2 * 2 * 3;
  if (thetaLength !== CesiumMath.TWO_PI) {
    //2个截面
    numIndices += +4 * 3;
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
  // 顶面

  // some helper variables
  var radius = topInnerRadius;
  var radiusStep = (topOuterRadius - topInnerRadius) / phiSegments;
  // generate vertices, normals and uvs
  for (let j = 0; j <= phiSegments; j++) {
    for (let i = 0; i <= thetaSegments; i++) {
      // values are generate from the inside of the ring to the outside
      var segment = thetaStart + (i / thetaSegments) * thetaLength;

      // vertex
      var x = radius * Math.cos(segment);
      var y = radius * Math.sin(segment);

      positions[positionIndex++] = x;
      positions[positionIndex++] = y;
      positions[positionIndex++] = 0;

      if (
        vertexFormat.normal ||
        vertexFormat.tangent ||
        vertexFormat.bitangent
      ) {
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

  var topStart = 0;
  for (let j = 0; j < phiSegments; j++) {
    var thetaSegmentLevel = j * (thetaSegments + 1);

    for (let i = 0; i < thetaSegments; i++) {
      var segment = i + thetaSegmentLevel;

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
  radiusStep = (bottomInnerRadius - bottomOuterRadius) / phiSegments;
  for (let j = 0; j <= phiSegments; j++) {
    for (let i = 0; i <= thetaSegments; i++) {
      // values are generate from the inside of the ring to the outside
      var segment = thetaStart + (i / thetaSegments) * thetaLength;

      // vertex
      var x = radius * Math.cos(segment);
      var y = radius * Math.sin(segment);
      positions[positionIndex++] = x;
      positions[positionIndex++] = y;
      positions[positionIndex++] = -length;

      if (
        vertexFormat.normal ||
        vertexFormat.tangent ||
        vertexFormat.bitangent
      ) {
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
  var bottomStart = (phiSegments + 1) * (thetaSegments + 1);
  for (let j = 0; j < phiSegments; j++) {
    var thetaSegmentLevel = j * (thetaSegments + 1);

    for (let i = 0; i < thetaSegments; i++) {
      var segment = i + thetaSegmentLevel;

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
  for (let i = thetaSegments; i >= 0; i--) {
    var segment = thetaStart + (i / thetaSegments) * thetaLength;
    var cos = Math.cos(segment);
    var sin = Math.sin(segment);
    positions[positionIndex++] = topInnerRadius * cos;
    positions[positionIndex++] = topInnerRadius * sin;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = bottomInnerRadius * cos;
    positions[positionIndex++] = bottomInnerRadius * sin;
    positions[positionIndex++] = -length;

    var theta = Math.atan2(
      Math.abs(topInnerRadius - bottomInnerRadius),
      length
    );
    var normalScale = Math.cos(theta);

    var normal = new Cartesian3();
    var tangent = new Cartesian3();
    var bitangent = new Cartesian3();
    normal.z = Math.sin(theta);
    normal.x = normalScale * cos;
    normal.y = normalScale * sin;
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

      tangent = Cartesian3.normalize(
        Cartesian3.cross(Cartesian3.UNIT_Z, normal, tangent),
        tangent
      );
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

  var innserStart = (phiSegments + 1) * (thetaSegments + 1) * 2;
  for (let i = 0; i < thetaSegments; i++) {
    var a = innserStart + i * 2;
    var b = innserStart + i * 2 + 1;
    var c = innserStart + i * 2 + 3;
    var d = innserStart + i * 2 + 2;
    // faces
    indices[index++] = a;
    indices[index++] = b;
    indices[index++] = d;
    indices[index++] = b;
    indices[index++] = c;
    indices[index++] = d;
  }

  // 外面

  for (let i = 0; i < thetaSegments + 1; i++) {
    var segment = thetaStart + (i / thetaSegments) * thetaLength;
    var cos = Math.cos(segment);
    var sin = Math.sin(segment);
    positions[positionIndex++] = topOuterRadius * cos;
    positions[positionIndex++] = topOuterRadius * sin;
    positions[positionIndex++] = 0;

    positions[positionIndex++] = bottomOuterRadius * cos;
    positions[positionIndex++] = bottomOuterRadius * sin;
    positions[positionIndex++] = -length;

    var theta = Math.atan2(
      Math.abs(bottomOuterRadius - topOuterRadius),
      length
    );
    var normalScale = Math.cos(theta);

    var normal = new Cartesian3();
    var tangent = new Cartesian3();
    var bitangent = new Cartesian3();
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

      tangent = Cartesian3.normalize(
        Cartesian3.cross(Cartesian3.UNIT_Z, normal, tangent),
        tangent
      );
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

  var outerStart =
    (phiSegments + 1) * (thetaSegments + 1) * 2 + (thetaSegments + 1) * 2;
  for (let i = 0; i < thetaSegments; i++) {
    var a = outerStart + i * 2;
    var b = outerStart + i * 2 + 1;
    var c = outerStart + i * 2 + 3;
    var d = outerStart + i * 2 + 2;
    // faces
    indices[index++] = a;
    indices[index++] = b;
    indices[index++] = d;
    indices[index++] = b;
    indices[index++] = c;
    indices[index++] = d;
  }

  // 两个截面
  var ist = outerStart - 2;
  var isd = outerStart - 1;
  var iet = innserStart;
  var ied = innserStart + 1;
  var ost = outerStart;
  var osd = outerStart + 1;
  var oet = vertexCount - 2;
  var oed = vertexCount - 1;

  if (thetaLength !== CesiumMath.TWO_PI) {
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

  var radiusScratch = new Cartesian2();
  radiusScratch.x = length;
  radiusScratch.y = Math.max(topOuterRadius, bottomOuterRadius);

  var boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, 0),
    Cartesian2.magnitude(radiusScratch)
  );

  if (defined(conicSensorGeometry._offsetAttribute)) {
    length = positions.length;
    var applyOffset = new Uint8Array(length / 3);
    var offsetValue =
      conicSensorGeometry._offsetAttribute === GeometryOffsetAttribute.NONE
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
    offsetAttribute: conicSensorGeometry._offsetAttribute,
  });
};

export default ConicSensorGeometry;
