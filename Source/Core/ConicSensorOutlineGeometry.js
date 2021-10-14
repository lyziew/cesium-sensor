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
import PrimitiveType from "./PrimitiveType.js";
import CesiumMath from "./Math";

/**
 * A description of the outline of a conicSensor.
 *
 * @alias ConicSensorOutlineGeometry
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {Number} options.length The length of the conicSensor.
 * @param {Number} options.topRadius The radius of the top of the conicSensor.
 * @param {Number} options.bottomRadius The radius of the bottom of the conicSensor.
 * @param {Number} [options.slices=128] The number of edges around the perimeter of the conicSensor.
 * @param {Number} [options.numberOfVerticalLines=16] Number of lines to draw between the top and bottom surfaces of the conicSensor.
 *
 * @exception {DeveloperError} options.length must be greater than 0.
 * @exception {DeveloperError} options.topRadius must be greater than 0.
 * @exception {DeveloperError} options.bottomRadius must be greater than 0.
 * @exception {DeveloperError} bottomRadius and topRadius cannot both equal 0.
 * @exception {DeveloperError} options.slices must be greater than or equal to 3.
 *
 * @see ConicSensorOutlineGeometry.createGeometry
 *
 * @example
 * // create conicSensor geometry
 * let conicSensor = new Cesium.ConicSensorOutlineGeometry({
 *     length: 200000,
 *     topRadius: 80000,
 *     bottomRadius: 200000,
 * });
 * let geometry = Cesium.ConicSensorOutlineGeometry.createGeometry(conicSensor);
 */
function ConicSensorOutlineGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  let length = options.length;
  let topInnerRadius = defaultValue(options.topInnerRadius, 0.0);
  let topOuterRadius = defaultValue(options.topOuterRadius, 0.0);
  let bottomInnerRadius = defaultValue(options.bottomInnerRadius, 0.0);
  let bottomOuterRadius = options.bottomOuterRadius;
  let thetaSegments = defaultValue(options.thetaSegments, 32);
  let phiSegments = defaultValue(options.phiSegments, 1);
  let thetaStart = defaultValue(options.thetaStart, 0.0);
  let thetaLength = defaultValue(options.thetaLength, CesiumMath.TWO_PI);

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
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createConicSensorOutlineGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
ConicSensorOutlineGeometry.packedLength = 10;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {ConicSensorOutlineGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
ConicSensorOutlineGeometry.pack = function (value, array, startingIndex) {
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

let scratchOptions = {
  length: undefined,
  topInnerRadius : undefined,
  topOuterRadius : undefined,
  bottomInnerRadius : undefined,
  bottomOuterRadius : undefined,
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
 * @param {ConicSensorOutlineGeometry} [result] The object into which to store the result.
 * @returns {ConicSensorOutlineGeometry} The modified result parameter or a new ConicSensorOutlineGeometry instance if one was not provided.
 */
ConicSensorOutlineGeometry.unpack = function (array, startingIndex, result) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');

  startingIndex = defaultValue(startingIndex, 0);

  let length = array[startingIndex++];
  let topInnerRadius = array[startingIndex++];
  let topOuterRadius = array[startingIndex++];
  let bottomInnerRadius = array[startingIndex++];
  let bottomOuterRadius = array[startingIndex++];
  let thetaSegments = array[startingIndex++];
  let phiSegments = array[startingIndex++];
  let thetaStart = array[startingIndex++];
  let thetaLength = array[startingIndex++];
  let offsetAttribute = array[startingIndex];

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
    return new ConicSensorOutlineGeometry(scratchOptions);
  }

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
 * Computes the geometric representation of an outline of a conicSensor, including its vertices, indices, and a bounding sphere.
 *
 * @param {ConicSensorOutlineGeometry} conicSensorGeometry A description of the conicSensor outline.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
ConicSensorOutlineGeometry.createGeometry = function (conicSensorGeometry) {
  let length = conicSensorGeometry._length;
  let topInnerRadius = conicSensorGeometry._topInnerRadius;
  let topOuterRadius = conicSensorGeometry._topOuterRadius;
  let bottomInnerRadius = conicSensorGeometry._bottomInnerRadius;
  let bottomOuterRadius = conicSensorGeometry._bottomOuterRadius;
  let thetaSegments = conicSensorGeometry._thetaSegments;
  let phiSegments = conicSensorGeometry._phiSegments;
  let thetaStart = conicSensorGeometry._thetaStart;
  let thetaLength = conicSensorGeometry._thetaLength;

  thetaStart = thetaStart !== undefined ? thetaStart : 0;
  thetaLength = thetaLength !== undefined ? thetaLength : CesiumMath.TWO_PI;
  thetaSegments = thetaSegments !== undefined ? Math.max(3, thetaSegments) : 8;
  phiSegments = phiSegments !== undefined ? Math.max(1, phiSegments) : 1;

  if (
    length <= 0 ||
    topInnerRadius < 0 ||
    topOuterRadius < 0 ||
    bottomInnerRadius < 0 ||
    (bottomOuterRadius === 0)
  ) {
    return;
  }

  // buffers
  let index = 0;
  let positionIndex = 0;
  // 上下顶 + 外面 + 内面
  let vertexCount = (phiSegments + 1) * (thetaSegments + 1) * 2 + (thetaSegments + 1) * 4;
  // 上下面 + 内外面
  let numIndices = ((phiSegments + 1) * thetaSegments + phiSegments * (thetaSegments + 1) ) * 4 + (thetaSegments + 1) * 4

  let indices = IndexDatatype.createTypedArray(vertexCount, numIndices);
  let positions = new Float64Array(vertexCount * 3);
  // 顶面
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
      positions[positionIndex++] = 0;
    }
    // increase the radius for next row of vertices
    radius += radiusStep;
  }

  let topStart = 0;
  for (let j = 0; j < phiSegments; j++) {
    let thetaSegmentLevel = j * (thetaSegments + 1);
    for (let i = 0; i <= thetaSegments; i++) {
      let segment = i + thetaSegmentLevel;
      let a = topStart + segment;
      let b = topStart + segment + thetaSegments + 1;
      // line
      indices[index++] = a;
      indices[index++] = b;
    }
  }

  for (let j = 0; j <= phiSegments; j++) {
    let thetaSegmentLevel = j * (thetaSegments + 1);
    for (let i = 0; i < thetaSegments; i++) {
      let segment = i + thetaSegmentLevel;
      let a = topStart + segment;
      let b = topStart + segment + 1;
      // line
      indices[index++] = a;
      indices[index++] = b;
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
      positions[positionIndex++] = -length;
    }
    // increase the radius for next row of vertices
    radius += radiusStep;
  }

  let bottomStart = (phiSegments + 1) * (thetaSegments + 1);
  for (let j = 0; j < phiSegments; j++) {
    let thetaSegmentLevel = j * (thetaSegments + 1);
    for (let i = 0; i <= thetaSegments; i++) {
      let segment = i + thetaSegmentLevel;
      let a = bottomStart + segment;
      let b = bottomStart + segment + thetaSegments + 1;
      // line
      indices[index++] = a;
      indices[index++] = b;
    }
  }

  for (let j = 0; j <= phiSegments; j++) {
    let thetaSegmentLevel = j * (thetaSegments + 1);
    for (let i = 0; i < thetaSegments; i++) {
      let segment = i + thetaSegmentLevel;
      let a = bottomStart + segment;
      let b = bottomStart + segment + 1;
      // line
      indices[index++] = a;
      indices[index++] = b;
    }
  }

  // 内面
  for(let i = thetaSegments; i >=0; i--) {
    let segment = thetaStart + i / thetaSegments * thetaLength;
    let cos = Math.cos(segment);
    let sin = Math.sin(segment);
    positions[positionIndex++] = topInnerRadius * cos;
    positions[positionIndex++] = topInnerRadius * sin;
    positions[positionIndex++] = 0;
    positions[positionIndex++] = bottomInnerRadius * cos;
    positions[positionIndex++] = bottomInnerRadius * sin;
    positions[positionIndex++] = -length;
  }

  let innserStart = (phiSegments + 1) * (thetaSegments + 1) * 2;
  for (let i = 0; i <= thetaSegments; i++) {
    let a = innserStart + i * 2;
    let b = innserStart + i * 2 + 1
    // faces
    indices[index++] = a;
    indices[index++] = b;
  }

  // 外面
  for(let i = 0; i<thetaSegments + 1; i++) {
    let segment = thetaStart + i / thetaSegments * thetaLength;
    let cos = Math.cos(segment);
    let sin = Math.sin(segment);
    positions[positionIndex++] = topOuterRadius * cos;
    positions[positionIndex++] = topOuterRadius * sin;
    positions[positionIndex++] = 0;

    positions[positionIndex++] = bottomOuterRadius * cos;
    positions[positionIndex++] = bottomOuterRadius * sin;
    positions[positionIndex++] = -length;
  }

  let outerStart = (phiSegments + 1) * (thetaSegments + 1) * 2 + (thetaSegments + 1) * 2;
  for (let i = 0; i <= thetaSegments; i++) {
    let a = outerStart + i * 2;
    let b = outerStart + i * 2 + 1;
    // faces
    indices[index++] = a;
    indices[index++] = b;
  }

  let attributes = new GeometryAttributes();
  attributes.position = new GeometryAttribute({
    componentDatatype: ComponentDatatype.DOUBLE,
    componentsPerAttribute: 3,
    values: positions,
  });

  let radiusScratch = new Cartesian2();
  radiusScratch.x = length;
  radiusScratch.y = Math.max(topOuterRadius,bottomOuterRadius);

  let boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, 0),
    Cartesian2.magnitude(radiusScratch)
  );

  if (defined(conicSensorGeometry._offsetAttribute)) {
    length = positions.length;
    let applyOffset = new Uint8Array(length / 3);
    let offsetValue =
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
    primitiveType: PrimitiveType.LINES,
    boundingSphere: boundingSphere,
    offsetAttribute: conicSensorGeometry._offsetAttribute,
  });
};
export default ConicSensorOutlineGeometry;
