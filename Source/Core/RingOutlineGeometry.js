import Check from "./Check.js";
import CesiumMath from "./Math.js";
import defaultValue from "./defaultValue.js";
import defined from "./defined.js";
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
 * @alias RingOutlineGeometry
 * @constructor
 * @exception {DeveloperError} radius must be greater than zero.
 * @exception {DeveloperError} granularity must be greater than zero.
 *
 * @see RingOutlineGeometry.createGeometry
 * @see Packable
 *
 * @example
 * // Create a Ring.
 * var ring = new Cesium.RingOutlineGeometry({
 *   center : Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
 *   radius : 100000.0
 * });
 * var geometry = Cesium.RingOutlineGeometry.createGeometry(ring);
 */
function RingOutlineGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  var innerRadius = defaultValue(options.innerRadius, 0.0);
  var outerRadius = options.outerRadius;
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
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createRingOutlineGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
RingOutlineGeometry.packedLength = 7;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {RingOutlineGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
RingOutlineGeometry.pack = function(value, array, startingIndex) {
//>>includeStart('debug', pragmas.debug);
  if (!defined(value)) {
    throw new DeveloperError("value is required");
  }
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');
  startingIndex = defaultValue(startingIndex, 0);

  array[startingIndex++] = value._innerRadius;
  array[startingIndex++] = value._outerRadius;
  array[startingIndex++] = value._thetaSegments;
  array[startingIndex++] = value._phiSegments;
  array[startingIndex++] = value._thetaStart;
  array[startingIndex++] = value._thetaLength;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchOptions = {
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
 * @param {RingOutlineGeometry} [result] The object into which to store the result.
 * @returns {RingOutlineGeometry} The modified result parameter or a new RingOutlineGeometry instance if one was not provided.
 */
RingOutlineGeometry.unpack = function(array, startingIndex, result) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');

  startingIndex = defaultValue(startingIndex, 0);

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
    return new RingOutlineGeometry(scratchOptions);
  }

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
 * @param {RingOutlineGeometry} ringGeometry A description of the ring.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
RingOutlineGeometry.createGeometry = function(ringGeometry) {
  var innerRadius = ringGeometry._innerRadius;
  var outerRadius = ringGeometry._outerRadius;
  var thetaSegments = ringGeometry._thetaSegments;
  var phiSegments = ringGeometry._phiSegments;
  var thetaStart = ringGeometry._thetaStart;
  var thetaLength = ringGeometry._thetaLength;

  thetaStart = thetaStart !== undefined ? thetaStart : 0;
  thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;
  thetaSegments = thetaSegments !== undefined ? Math.max(3, thetaSegments) : 8;
  phiSegments = phiSegments !== undefined ? Math.max(1, phiSegments) : 1;
  console.log(thetaSegments);
  console.log(phiSegments);
  // buffers
  var positionIndex = 0;
  var index = 0;
  var vertexCount = (phiSegments + 1) * (thetaSegments + 1);
  var numIndices = phiSegments * thetaSegments * 6;
  var indices = IndexDatatype.createTypedArray(vertexCount, numIndices);
  var positions = new Float64Array(vertexCount * 3);

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
      positions[positionIndex++] = x
      positions[positionIndex++] = y
      positions[positionIndex++] = 0.0;
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

      // lins
      indices[index++] = a;
      indices[index++] = b;
      // indices[index++] = d;
      // indices[index++] = b;
      indices[index++] = d;
      indices[index++] = a;

      // indices[index++] = c;
      // indices[index++] = d;
      indices[index++] = c;
      indices[index++] = b;

    }
  }

  var attributes = new GeometryAttributes();
  attributes.position = new GeometryAttribute({
    componentDatatype : ComponentDatatype.DOUBLE,
    componentsPerAttribute : 3,
    values : positions,
  });

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
    primitiveType: PrimitiveType.LINES,
    boundingSphere: new BoundingSphere(Cartesian3.ZERO, Math.sqrt(2.0)),
    offsetAttribute: ringGeometry._offsetAttribute,
  });

};

export default RingOutlineGeometry;
