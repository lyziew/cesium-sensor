import Check from "./Check.js";
import CesiumMath from "./Math.js";
import defaultValue from "./defaultValue.js";
import defined from "./defined.js";
import VertexFormat from "./VertexFormat.js";
import DeveloperError from "./DeveloperError";
import IndexDatatype from "./IndexDatatype";
import GeometryAttributes from "./GeometryAttributes";
import GeometryAttribute from "./GeometryAttribute";
import ComponentDatatype from "./ComponentDatatype";
import GeometryOffsetAttribute from "./GeometryOffsetAttribute";
import arrayFill from "./arrayFill";
import Geometry from "./Geometry";
import PrimitiveType from "./PrimitiveType";
import BoundingSphere from "./BoundingSphere";
import Cartesian3 from "./Cartesian3";

/**
 * A description of a ring on the Cartesian. Ring geometry can be rendered with both {@link Primitive} and {@link GroundPrimitive}.
 *
 * @alias RingGeometry
 * @constructor
 * @exception {DeveloperError} radius must be greater than zero.
 * @exception {DeveloperError} granularity must be greater than zero.
 *
 * @see RingGeometry.createGeometry
 * @see Packable
 *
 * @example
 * // Create a Ring.
 * var ring = new Cesium.RingGeometry({
 *   center : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
 *   radius : 100000.0
 * });
 * var geometry = Cesium.RingGeometry.createGeometry(ring);
 */
function RingGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var innerRadius = defaultValue(options.innerRadius, 0.0);
  var outerRadius = options.outerRadius;
  var vertexFormat = defaultValue(options.vertexFormat, VertexFormat.DEFAULT);
  var thetaSegments = defaultValue(options.thetaSegments, 32);
  var phiSegments = defaultValue(options.phiSegments, 1);
  var thetaStart = defaultValue(options.thetaStart, 0.0);
  var thetaLength = defaultValue(options.thetaLength, CesiumMath.TWO_PI);
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.number("options.innerRadius", innerRadius);
  Check.typeOf.number("options.outerRadius", outerRadius);
  if (outerRadius < innerRadius) {
    throw new DeveloperError(
      "outerRadius must be greater than or equal to the innerRadius."
    );
  }
  //>>includeEnd('debug');

  this._innerRadius = innerRadius;
  this._outerRadius = outerRadius;
  this._thetaSegments = thetaSegments;
  this._phiSegments = phiSegments;
  this._thetaStart = thetaStart;
  this._thetaLength = thetaLength;
  this._vertexFormat = VertexFormat.clone(vertexFormat);
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createRingGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
RingGeometry.packedLength = VertexFormat.packedLength + 7;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {RingGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
RingGeometry.pack = function(value, array, startingIndex) {
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

  array[startingIndex++] = value._innerRadius;
  array[startingIndex++] = value._outerRadius;
  array[startingIndex++] = value._thetaSegments;
  array[startingIndex++] = value._phiSegments;
  array[startingIndex++] = value._thetaStart;
  array[startingIndex++] = value._thetaLength;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchVertexFormat = new VertexFormat();
var scratchOptions = {
  vertexFormat : scratchVertexFormat,
  innerRadius : undefined,
  outerRadius : undefined,
  thetaSegments : undefined,
  phiSegments : undefined,
  thetaStart : undefined,
  thetaLength : undefined,
  offsetAttribute : undefined,
};

/**
 * Retrieves an instance from a packed array.
 *
 * @param {Number[]} array The packed array.
 * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
 * @param {RingGeometry} [result] The object into which to store the result.
 * @returns {RingGeometry} The modified result parameter or a new RingGeometry instance if one was not provided.
 */
RingGeometry.unpack = function(array, startingIndex, result) {
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

  var innerRadius = array[startingIndex++];
  var outerRadius = array[startingIndex++];
  var thetaSegments = array[startingIndex++];
  var phiSegments = array[startingIndex++];
  var thetaStart = array[startingIndex++];
  var thetaLength = array[startingIndex++];
  var offsetAttribute = array[startingIndex];

  if (!defined(result)) {
    scratchOptions.innerRadius = innerRadius;
    scratchOptions.outerRadius = outerRadius;
    scratchOptions.thetaSegments = thetaSegments;
    scratchOptions.phiSegments = phiSegments;
    scratchOptions.thetaStart = thetaStart;
    scratchOptions.thetaLength = thetaLength;
    scratchOptions.offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;
    return new RingGeometry(scratchOptions);
  }

  result._vertexFormat = VertexFormat.clone(vertexFormat, result._vertexFormat);
  result._innerRadius = innerRadius;
  result._outerRadius = outerRadius;
  result._thetaSegments = thetaSegments;
  result._phiSegments = phiSegments;
  result._thetaStart = thetaStart;
  result._thetaLength = thetaLength;
  result._offsetAttribute =
    offsetAttribute === -1 ? undefined : offsetAttribute;

  return result;
};

/**
 * Computes the geometric representation of a ring on an ellipsoid, including its vertices, indices, and a bounding sphere.
 *
 * @param {RingGeometry} ringGeometry A description of the ring.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
RingGeometry.createGeometry = function(ringGeometry) {
  var vertexFormat = ringGeometry._vertexFormat;
  var innerRadius = ringGeometry._innerRadius;
  var outerRadius = ringGeometry._outerRadius;
  var thetaSegments = ringGeometry._thetaSegments;
  var phiSegments = ringGeometry._phiSegments;
  var thetaStart = ringGeometry._thetaStart;
  var thetaLength = ringGeometry._thetaLength;

  thetaStart = thetaStart !== undefined ? thetaStart : 0;
  thetaLength = thetaLength !== undefined ? thetaLength : CesiumMath.TWO_PI;
  thetaSegments = thetaSegments !== undefined ? Math.max(3, thetaSegments) : 8;
  phiSegments = phiSegments !== undefined ? Math.max(1, phiSegments) : 1;

  // buffers
  var positionIndex = 0;
  var normalIndex = 0;
  var tangentIndex = 0;
  var bitangentIndex = 0;
  var stIndex = 0;
  var index = 0;
  var vertexCount = (phiSegments + 1) * (thetaSegments + 1);
  var numIndices = phiSegments * thetaSegments * 2 * 3;
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

  // some helper variables
  var segment;
  var radius = innerRadius;
  var radiusStep = ((outerRadius - innerRadius) / phiSegments);
  var j, i;

  // generate vertices, normals and uvs
  for (j = 0; j <= phiSegments; j++) {

    for (i = 0; i <= thetaSegments; i++) {

      // values are generate from the inside of the ring to the outside
      segment = thetaStart + i / thetaSegments * thetaLength;

      // vertex
      var x = radius * Math.cos(segment);
      var y = radius * Math.sin(segment);
      positions[positionIndex++] = x;
      positions[positionIndex++] = y;
      positions[positionIndex++] = 0.0;

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
        st[stIndex++] = (x / outerRadius + 1) / 2;
        st[stIndex++] = (y / outerRadius + 1) / 2;
      }
    }

    // increase the radius for next row of vertices
    radius += radiusStep;

  }

  // indices

  for (j = 0; j < phiSegments; j++) {

    var thetaSegmentLevel = j * (thetaSegments + 1);

    for (i = 0; i < thetaSegments; i++) {

      segment = i + thetaSegmentLevel;

      var a = segment;
      var b = segment + thetaSegments + 1;
      var c = segment + thetaSegments + 2;
      var d = segment + 1;

      // faces
      indices[index++] = a;
      indices[index++] = b;
      indices[index++] = d;
      indices[index++] = b;
      indices[index++] = c;
      indices[index++] = d;
    }
  }

  var attributes = new GeometryAttributes();
  if (vertexFormat.position) {
    attributes.position = new GeometryAttribute({
      componentDatatype : ComponentDatatype.DOUBLE,
      componentsPerAttribute : 3,
      values : positions,
    });
  }

  if (vertexFormat.normal) {
    attributes.normal = new GeometryAttribute({
      componentDatatype : ComponentDatatype.FLOAT,
      componentsPerAttribute : 3,
      values : normals,
    });
  }

  if (vertexFormat.tangent) {
    attributes.tangent = new GeometryAttribute({
      componentDatatype : ComponentDatatype.FLOAT,
      componentsPerAttribute : 3,
      values : tangents,
    });
  }

  if (vertexFormat.bitangent) {
    attributes.bitangent = new GeometryAttribute({
      componentDatatype : ComponentDatatype.FLOAT,
      componentsPerAttribute : 3,
      values : bitangents,
    });
  }

  if (vertexFormat.st) {
    attributes.st = new GeometryAttribute({
      componentDatatype : ComponentDatatype.FLOAT,
      componentsPerAttribute : 2,
      values : st,
    });
  }

  if (defined(ringGeometry._offsetAttribute)) {
    var length = positions.length;
    var applyOffset = new Uint8Array(length / 3);
    var offsetValue = ringGeometry._offsetAttribute === GeometryOffsetAttribute.NONE ? 0 : 1;
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
    boundingSphere: new BoundingSphere(Cartesian3.ZERO, Math.sqrt(2.0)),
    offsetAttribute: ringGeometry._offsetAttribute,
  });

};

export default RingGeometry;
