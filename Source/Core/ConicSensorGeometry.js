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
 * @param {Number} options.topRadius The radius of the top of the conicSensor.
 * @param {Number} options.bottomRadius The radius of the bottom of the conicSensor.
 * @param {Number} [options.slices=128] The number of edges around the perimeter of the conicSensor.
 * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
 *
 * @exception {DeveloperError} options.slices must be greater than or equal to 3.
 *
 * @see ConicSensorGeometry.createGeometry
 *
 * @example
 * // create conicSensor geometry
 * let conicSensor = new Cesium.ConicSensorGeometry({
 *     length: 200000,
 *     topRadius: 80000,
 *     bottomRadius: 200000,
 * });
 * let geometry = Cesium.ConicSensorGeometry.createGeometry(conicSensor);
 */
function ConicSensorGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);
  let vertexFormat = defaultValue(options.vertexFormat, VertexFormat.DEFAULT);
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

let scratchVertexFormat = new VertexFormat();
let scratchOptions = {
  vertexFormat: scratchVertexFormat,
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

  let vertexFormat = VertexFormat.unpack(
    array,
    startingIndex,
    scratchVertexFormat
  );
  startingIndex += VertexFormat.packedLength;

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
  let vertexFormat = conicSensorGeometry._vertexFormat;
  let length = conicSensorGeometry._length;
  let topInnerRadius = conicSensorGeometry._topInnerRadius;
  let topOuterRadius = conicSensorGeometry._topOuterRadius;
  let bottomInnerRadius = conicSensorGeometry._bottomInnerRadius;
  let bottomOuterRadius = conicSensorGeometry._bottomOuterRadius;
  let thetaSegments = conicSensorGeometry._thetaSegments;
  let phiSegments = conicSensorGeometry._phiSegments;
  let thetaStart = conicSensorGeometry._thetaStart;
  let thetaLength = conicSensorGeometry._thetaLength;
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
    (bottomOuterRadius === 0)
  ) {
    return;
  }

  // buffers
  let positionIndex = 0;
  let normalIndex = 0;
  let tangentIndex = 0;
  let bitangentIndex = 0;
  let stIndex = 0;
  let index = 0;
  // 上下顶 + 外面 + 内面
  let vertexCount = (phiSegments + 1) * (thetaSegments + 1) * 2 + (thetaSegments + 1) * 4;
  // 上下面 + 内外面
  let numIndices = phiSegments * thetaSegments * 2 * 2 * 3 + thetaSegments * 2 * 2
  if(thetaLength !== CesiumMath.TWO_PI) {
    //2个截面
    numIndices+=+ 4 * 3;
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

      let a = topStart + segment;
      let b = topStart + segment + thetaSegments + 1;
      let c = topStart + segment + thetaSegments + 2;
      let d = topStart + segment + 1;

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

      let a = bottomStart + segment;
      let b = bottomStart + segment + thetaSegments + 1;
      let c = bottomStart + segment + thetaSegments + 2;
      let d = bottomStart + segment + 1;

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
      let rad = Math.max(topInnerRadius, bottomInnerRadius);
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
      let rad = Math.max(topOuterRadius, bottomOuterRadius);
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
  let iet = innserStart;
  let ied = innserStart + 1;
  let ost = outerStart;
  let osd = outerStart + 1;
  let oet = vertexCount -2;
  let oed = vertexCount -1;

  if(thetaLength !== CesiumMath.TWO_PI) {
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

  let radiusScratch = new Cartesian2();
  radiusScratch.x = length;
  radiusScratch.y = Math.max(topOuterRadius,bottomOuterRadius);

  let boundingSphere = new BoundingSphere(
    new Cartesian3(0, 0, -length/2),
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
    primitiveType: PrimitiveType.TRIANGLES,
    boundingSphere: boundingSphere,
    offsetAttribute: conicSensorGeometry._offsetAttribute,
  });
};

export default ConicSensorGeometry;
