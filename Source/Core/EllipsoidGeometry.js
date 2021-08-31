import arrayFill from "./arrayFill.js";
import BoundingSphere from "./BoundingSphere.js";
import Cartesian2 from "./Cartesian2.js";
import Cartesian3 from "./Cartesian3.js";
import ComponentDatatype from "./ComponentDatatype.js";
import defaultValue from "./defaultValue.js";
import defined from "./defined.js";
import DeveloperError from "./DeveloperError.js";
import Ellipsoid from "./Ellipsoid.js";
import Geometry from "./Geometry.js";
import GeometryAttribute from "./GeometryAttribute.js";
import GeometryAttributes from "./GeometryAttributes.js";
import GeometryOffsetAttribute from "./GeometryOffsetAttribute.js";
import IndexDatatype from "./IndexDatatype.js";
import CesiumMath from "./Math.js";
import PrimitiveType from "./PrimitiveType.js";
import VertexFormat from "./VertexFormat.js";

var scratchPosition = new Cartesian3();
var scratchNormal = new Cartesian3();
var scratchTangent = new Cartesian3();
var scratchBitangent = new Cartesian3();
var scratchNormalST = new Cartesian3();
var defaultRadii = new Cartesian3(1.0, 1.0, 1.0);

var cos = Math.cos;
var sin = Math.sin;

/**
 * A description of an ellipsoid centered at the origin.
 *
 * @alias EllipsoidGeometry
 * @constructor
 *
 * @param {Object} [options] Object with the following properties:
 * @param {Cartesian3} [options.radii=Cartesian3(1.0, 1.0, 1.0)] The radii of the ellipsoid in the x, y, and z directions.
 * @param {Cartesian3} [options.innerRadii=options.radii] The inner radii of the ellipsoid in the x, y, and z directions.
 * @param {Number} [options.minimumClock=0.0] The minimum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
 * @param {Number} [options.maximumClock=2*PI] The maximum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
 * @param {Number} [options.minimumCone=0.0] The minimum angle measured from the positive z-axis and toward the negative z-axis.
 * @param {Number} [options.maximumCone=PI] The maximum angle measured from the positive z-axis and toward the negative z-axis.
 * @param {Number} [options.stackPartitions=64] The number of times to partition the ellipsoid into stacks.
 * @param {Number} [options.slicePartitions=64] The number of times to partition the ellipsoid into radial slices.
 * @param {VertexFormat} [options.vertexFormat=VertexFormat.DEFAULT] The vertex attributes to be computed.
 *
 * @exception {DeveloperError} options.slicePartitions cannot be less than three.
 * @exception {DeveloperError} options.stackPartitions cannot be less than three.
 *
 * @see EllipsoidGeometry#createGeometry
 *
 * @example
 * var ellipsoid = new Cesium.EllipsoidGeometry({
 *   vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
 *   radii : new Cesium.Cartesian3(1000000.0, 500000.0, 500000.0)
 * });
 * var geometry = Cesium.EllipsoidGeometry.createGeometry(ellipsoid);
 */
function EllipsoidGeometry(options) {
  options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  var radii = defaultValue(options.radii, defaultRadii);
  var innerRadii = defaultValue(options.innerRadii, radii);
  var minimumClock = defaultValue(options.minimumClock, 0.0);
  var maximumClock = defaultValue(options.maximumClock, CesiumMath.TWO_PI);
  var minimumCone = defaultValue(options.minimumCone, 0.0);
  var maximumCone = defaultValue(options.maximumCone, CesiumMath.PI);
  var stackPartitions = Math.round(defaultValue(options.stackPartitions, 64));
  var slicePartitions = Math.round(defaultValue(options.slicePartitions, 64));
  var vertexFormat = defaultValue(options.vertexFormat, VertexFormat.DEFAULT);

  //>>includeStart('debug', pragmas.debug);
  if (slicePartitions < 3) {
    throw new DeveloperError(
      "options.slicePartitions cannot be less than three."
    );
  }
  if (stackPartitions < 3) {
    throw new DeveloperError(
      "options.stackPartitions cannot be less than three."
    );
  }
  //>>includeEnd('debug');

  this._radii = Cartesian3.clone(radii);
  this._innerRadii = Cartesian3.clone(innerRadii);
  this._minimumClock = minimumClock;
  this._maximumClock = maximumClock;
  this._minimumCone = minimumCone;
  this._maximumCone = maximumCone;
  this._stackPartitions = stackPartitions;
  this._slicePartitions = slicePartitions;
  this._vertexFormat = VertexFormat.clone(vertexFormat);
  this._offsetAttribute = options.offsetAttribute;
  this._workerName = "createEllipsoidGeometry";
}

/**
 * The number of elements used to pack the object into an array.
 * @type {Number}
 */
EllipsoidGeometry.packedLength =
  2 * Cartesian3.packedLength + VertexFormat.packedLength + 7;

/**
 * Stores the provided instance into the provided array.
 *
 * @param {EllipsoidGeometry} value The value to pack.
 * @param {Number[]} array The array to pack into.
 * @param {Number} [startingIndex=0] The index into the array at which to start packing the elements.
 *
 * @returns {Number[]} The array that was packed into
 */
EllipsoidGeometry.pack = function (value, array, startingIndex) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(value)) {
    throw new DeveloperError("value is required");
  }
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');

  startingIndex = defaultValue(startingIndex, 0);

  Cartesian3.pack(value._radii, array, startingIndex);
  startingIndex += Cartesian3.packedLength;

  Cartesian3.pack(value._innerRadii, array, startingIndex);
  startingIndex += Cartesian3.packedLength;

  VertexFormat.pack(value._vertexFormat, array, startingIndex);
  startingIndex += VertexFormat.packedLength;

  array[startingIndex++] = value._minimumClock;
  array[startingIndex++] = value._maximumClock;
  array[startingIndex++] = value._minimumCone;
  array[startingIndex++] = value._maximumCone;
  array[startingIndex++] = value._stackPartitions;
  array[startingIndex++] = value._slicePartitions;
  array[startingIndex] = defaultValue(value._offsetAttribute, -1);

  return array;
};

var scratchRadii = new Cartesian3();
var scratchInnerRadii = new Cartesian3();
var scratchVertexFormat = new VertexFormat();
var scratchOptions = {
  radii: scratchRadii,
  innerRadii: scratchInnerRadii,
  vertexFormat: scratchVertexFormat,
  minimumClock: undefined,
  maximumClock: undefined,
  minimumCone: undefined,
  maximumCone: undefined,
  stackPartitions: undefined,
  slicePartitions: undefined,
  offsetAttribute: undefined,
};

/**
 * Retrieves an instance from a packed array.
 *
 * @param {Number[]} array The packed array.
 * @param {Number} [startingIndex=0] The starting index of the element to be unpacked.
 * @param {EllipsoidGeometry} [result] The object into which to store the result.
 * @returns {EllipsoidGeometry} The modified result parameter or a new EllipsoidGeometry instance if one was not provided.
 */
EllipsoidGeometry.unpack = function (array, startingIndex, result) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(array)) {
    throw new DeveloperError("array is required");
  }
  //>>includeEnd('debug');

  startingIndex = defaultValue(startingIndex, 0);

  var radii = Cartesian3.unpack(array, startingIndex, scratchRadii);
  startingIndex += Cartesian3.packedLength;

  var innerRadii = Cartesian3.unpack(array, startingIndex, scratchInnerRadii);
  startingIndex += Cartesian3.packedLength;

  var vertexFormat = VertexFormat.unpack(
    array,
    startingIndex,
    scratchVertexFormat
  );
  startingIndex += VertexFormat.packedLength;

  var minimumClock = array[startingIndex++];
  var maximumClock = array[startingIndex++];
  var minimumCone = array[startingIndex++];
  var maximumCone = array[startingIndex++];
  var stackPartitions = array[startingIndex++];
  var slicePartitions = array[startingIndex++];
  var offsetAttribute = array[startingIndex];

  if (!defined(result)) {
    scratchOptions.minimumClock = minimumClock;
    scratchOptions.maximumClock = maximumClock;
    scratchOptions.minimumCone = minimumCone;
    scratchOptions.maximumCone = maximumCone;
    scratchOptions.stackPartitions = stackPartitions;
    scratchOptions.slicePartitions = slicePartitions;
    scratchOptions.offsetAttribute =
      offsetAttribute === -1 ? undefined : offsetAttribute;
    return new EllipsoidGeometry(scratchOptions);
  }

  result._radii = Cartesian3.clone(radii, result._radii);
  result._innerRadii = Cartesian3.clone(innerRadii, result._innerRadii);
  result._vertexFormat = VertexFormat.clone(vertexFormat, result._vertexFormat);
  result._minimumClock = minimumClock;
  result._maximumClock = maximumClock;
  result._minimumCone = minimumCone;
  result._maximumCone = maximumCone;
  result._stackPartitions = stackPartitions;
  result._slicePartitions = slicePartitions;
  result._offsetAttribute =
    offsetAttribute === -1 ? undefined : offsetAttribute;

  return result;
};

/**
 * Computes the geometric representation of an ellipsoid, including its vertices, indices, and a bounding sphere.
 *
 * @param {EllipsoidGeometry} ellipsoidGeometry A description of the ellipsoid.
 * @returns {Geometry|undefined} The computed vertices and indices.
 */
EllipsoidGeometry.createGeometry = function (ellipsoidGeometry) {
  var radii = ellipsoidGeometry._radii;
  if (radii.x <= 0 || radii.y <= 0 || radii.z <= 0) {
    return;
  }

  var innerRadii = ellipsoidGeometry._innerRadii;
  if (innerRadii.x <= 0 || innerRadii.y <= 0 || innerRadii.z <= 0) {
    return;
  }

  var minimumClock = ellipsoidGeometry._minimumClock;
  var maximumClock = ellipsoidGeometry._maximumClock;
  var minimumCone = ellipsoidGeometry._minimumCone;
  var maximumCone = ellipsoidGeometry._maximumCone;
  var vertexFormat = ellipsoidGeometry._vertexFormat;

  // Add an extra slice and stack so that the number of partitions is the
  // number of surfaces rather than the number of joints
  // 整个球体时钟向切割面数量
  var slicePartitions = ellipsoidGeometry._slicePartitions + 1;
  // 整个球体纵向切割面数
  var stackPartitions = ellipsoidGeometry._stackPartitions + 1;

  // 计算相对于整个球体实际时向切割面片数量
  slicePartitions = Math.round(
    (slicePartitions * Math.abs(maximumClock - minimumClock)) /
      CesiumMath.TWO_PI
  );

  // 计算相对于整个球体实纵向切割面片数量
  stackPartitions = Math.round(
    (stackPartitions * Math.abs(maximumCone - minimumCone)) / CesiumMath.PI
  );

  // 最小时向切面数量为2
  if (slicePartitions < 2) {
    slicePartitions = 2;
  }

  // 最小纵向切面数量为2
  if (stackPartitions < 2) {
    stackPartitions = 2;
  }

  var i;
  var j;
  var index = 0;

  // Create arrays for theta and phi. Duplicate first and last angle to
  // allow different normals at the intersections.
  var phis = [minimumCone]; // 纬度划分角度
  var thetas = [minimumClock]; // 经度划分角度
  // 计算每个纵向面片开始的弧度
  for (i = 0; i < stackPartitions; i++) {
    phis.push(
      minimumCone + (i * (maximumCone - minimumCone)) / (stackPartitions - 1)
    );
  }
  phis.push(maximumCone);
  // 计算每时向个面片开始的弧度
  for (j = 0; j < slicePartitions; j++) {
    thetas.push(
      minimumClock + (j * (maximumClock - minimumClock)) / (slicePartitions - 1)
    );
  }
  thetas.push(maximumClock);
  // 纵向面片数量+2
  var numPhis = phis.length;
  // 时向面片数量+2
  var numThetas = thetas.length;

  // Allow for extra indices if there is an inner surface and if we need
  // to close the sides if the clock range is not a full circle
  var extraIndices = 0; // 额外的三角面片索引
  var vertexMultiplier = 1.0; // 顶点系数
  // 判断是否有内面，必须radii和innerRadii完全相等时才无内表面
  var hasInnerSurface =
    innerRadii.x !== radii.x ||
    innerRadii.y !== radii.y ||
    innerRadii.z !== radii.z;
  var isTopOpen = false; // 是否上部打开
  var isBotOpen = false; // 是否下部打开
  var isClockOpen = false; // 是否时钟不封闭

  if (hasInnerSurface) {
    vertexMultiplier = 2.0;// 当有内表面时，内表面和外表面具备两倍的顶点数量
    if (minimumCone > 0.0) {
      isTopOpen = true;
      extraIndices += slicePartitions - 1; // 如果top打开，额外增加 slicePartitions - 1面片
    }
    if (maximumCone < Math.PI) {
      isBotOpen = true;
      extraIndices += slicePartitions - 1;  // 如果bot打开，额外增加 slicePartitions - 1面片
    }
    if ((maximumClock - minimumClock) % CesiumMath.TWO_PI) {
      isClockOpen = true;
      extraIndices += (stackPartitions - 1) * 2 + 1;
    } else {
      extraIndices += 1;
    }
  }

  var vertexCount = numThetas * numPhis * vertexMultiplier;
  var positions = new Float64Array(vertexCount * 3);
  var isInner = arrayFill(new Array(vertexCount), false);
  var negateNormal = arrayFill(new Array(vertexCount), false);

  // 这里计算顶点数量
  var indexCount = slicePartitions * stackPartitions * vertexMultiplier;
  // Multiply by 6 because there are two triangles per sector
  var numIndices =
    6 *
    (indexCount +
      extraIndices +
      1 -
      (slicePartitions + stackPartitions) * vertexMultiplier);
  // 根据顶点数量确定面片数组使用的数据类型，这里只有Uint16和Uint32
  var indices = IndexDatatype.createTypedArray(indexCount, numIndices);

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

  // Calculate sin/cos phi
  var sinPhi = new Array(numPhis);
  var cosPhi = new Array(numPhis);
  for (i = 0; i < numPhis; i++) {
    sinPhi[i] = sin(phis[i]);
    cosPhi[i] = cos(phis[i]);
  }

  // Calculate sin/cos theta
  var sinTheta = new Array(numThetas);
  var cosTheta = new Array(numThetas);
  for (j = 0; j < numThetas; j++) {
    cosTheta[j] = cos(thetas[j]);
    sinTheta[j] = sin(thetas[j]);
  }

  // Create outer surface
  for (i = 0; i < numPhis; i++) {
    for (j = 0; j < numThetas; j++) {
      positions[index++] = radii.x * sinPhi[i] * cosTheta[j];
      positions[index++] = radii.y * sinPhi[i] * sinTheta[j];
      positions[index++] = radii.z * cosPhi[i];
    }
  }

  // Create inner surface
  var vertexIndex = vertexCount / 2.0;
  if (hasInnerSurface) {
    for (i = 0; i < numPhis; i++) {
      for (j = 0; j < numThetas; j++) {
        positions[index++] = innerRadii.x * sinPhi[i] * cosTheta[j];
        positions[index++] = innerRadii.y * sinPhi[i] * sinTheta[j];
        positions[index++] = innerRadii.z * cosPhi[i];

        // Keep track of which vertices are the inner and which ones
        // need the normal to be negated
        isInner[vertexIndex] = true;
        if (i > 0 && i !== numPhis - 1 && j !== 0 && j !== numThetas - 1) {
          negateNormal[vertexIndex] = true;
        }
        vertexIndex++;
      }
    }
  }

  // Create indices for outer surface
  index = 0;
  var topOffset;
  var bottomOffset;
  for (i = 1; i < numPhis - 2; i++) {
    topOffset = i * numThetas;
    bottomOffset = (i + 1) * numThetas;

    for (j = 1; j < numThetas - 2; j++) {
      indices[index++] = bottomOffset + j;
      indices[index++] = bottomOffset + j + 1;
      indices[index++] = topOffset + j + 1;

      indices[index++] = bottomOffset + j;
      indices[index++] = topOffset + j + 1;
      indices[index++] = topOffset + j;
    }
  }

  // Create indices for inner surface
  if (hasInnerSurface) {
    var offset = numPhis * numThetas;
    for (i = 1; i < numPhis - 2; i++) {
      topOffset = offset + i * numThetas;
      bottomOffset = offset + (i + 1) * numThetas;

      for (j = 1; j < numThetas - 2; j++) {
        indices[index++] = bottomOffset + j;
        indices[index++] = topOffset + j;
        indices[index++] = topOffset + j + 1;

        indices[index++] = bottomOffset + j;
        indices[index++] = topOffset + j + 1;
        indices[index++] = bottomOffset + j + 1;
      }
    }
  }

  var outerOffset;
  var innerOffset;
  if (hasInnerSurface) {
    if (isTopOpen) {
      // Connect the top of the inner surface to the top of the outer surface
      innerOffset = numPhis * numThetas;
      for (i = 1; i < numThetas - 2; i++) {
        indices[index++] = i;
        indices[index++] = i + 1;
        indices[index++] = innerOffset + i + 1;

        indices[index++] = i;
        indices[index++] = innerOffset + i + 1;
        indices[index++] = innerOffset + i;
      }
    }

    if (isBotOpen) {
      // Connect the bottom of the inner surface to the bottom of the outer surface
      outerOffset = numPhis * numThetas - numThetas;
      innerOffset = numPhis * numThetas * vertexMultiplier - numThetas;
      for (i = 1; i < numThetas - 2; i++) {
        indices[index++] = outerOffset + i + 1;
        indices[index++] = outerOffset + i;
        indices[index++] = innerOffset + i;

        indices[index++] = outerOffset + i + 1;
        indices[index++] = innerOffset + i;
        indices[index++] = innerOffset + i + 1;
      }
    }
  }

  // Connect the edges if clock is not closed
  if (isClockOpen) {
    for (i = 1; i < numPhis - 2; i++) {
      innerOffset = numThetas * numPhis + numThetas * i;
      outerOffset = numThetas * i;
      indices[index++] = innerOffset;
      indices[index++] = outerOffset + numThetas;
      indices[index++] = outerOffset;

      indices[index++] = innerOffset;
      indices[index++] = innerOffset + numThetas;
      indices[index++] = outerOffset + numThetas;
    }

    for (i = 1; i < numPhis - 2; i++) {
      innerOffset = numThetas * numPhis + numThetas * (i + 1) - 1;
      outerOffset = numThetas * (i + 1) - 1;
      indices[index++] = outerOffset + numThetas;
      indices[index++] = innerOffset;
      indices[index++] = outerOffset;

      indices[index++] = outerOffset + numThetas;
      indices[index++] = innerOffset + numThetas;
      indices[index++] = innerOffset;
    }
  }

  var attributes = new GeometryAttributes();

  if (vertexFormat.position) {
    attributes.position = new GeometryAttribute({
      componentDatatype: ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: positions,
    });
  }

  var stIndex = 0;
  var normalIndex = 0;
  var tangentIndex = 0;
  var bitangentIndex = 0;
  var vertexCountHalf = vertexCount / 2.0;

  var ellipsoid;
  var ellipsoidOuter = Ellipsoid.fromCartesian3(radii);
  var ellipsoidInner = Ellipsoid.fromCartesian3(innerRadii);

  if (
    vertexFormat.st ||
    vertexFormat.normal ||
    vertexFormat.tangent ||
    vertexFormat.bitangent
  ) {
    for (i = 0; i < vertexCount; i++) {
      ellipsoid = isInner[i] ? ellipsoidInner : ellipsoidOuter;
      var position = Cartesian3.fromArray(positions, i * 3, scratchPosition);
      var normal = ellipsoid.geodeticSurfaceNormal(position, scratchNormal);
      if (negateNormal[i]) {
        Cartesian3.negate(normal, normal);
      }

      if (vertexFormat.st) {
        var normalST = Cartesian2.negate(normal, scratchNormalST);
        st[stIndex++] =
          Math.atan2(normalST.y, normalST.x) / CesiumMath.TWO_PI + 0.5;
        st[stIndex++] = Math.asin(normal.z) / Math.PI + 0.5;
      }

      if (vertexFormat.normal) {
        normals[normalIndex++] = normal.x;
        normals[normalIndex++] = normal.y;
        normals[normalIndex++] = normal.z;
      }

      if (vertexFormat.tangent || vertexFormat.bitangent) {
        var tangent = scratchTangent;

        // Use UNIT_X for the poles
        var tangetOffset = 0;
        var unit;
        if (isInner[i]) {
          tangetOffset = vertexCountHalf;
        }
        if (
          !isTopOpen &&
          i >= tangetOffset &&
          i < tangetOffset + numThetas * 2
        ) {
          unit = Cartesian3.UNIT_X;
        } else {
          unit = Cartesian3.UNIT_Z;
        }
        Cartesian3.cross(unit, normal, tangent);
        Cartesian3.normalize(tangent, tangent);

        if (vertexFormat.tangent) {
          tangents[tangentIndex++] = tangent.x;
          tangents[tangentIndex++] = tangent.y;
          tangents[tangentIndex++] = tangent.z;
        }

        if (vertexFormat.bitangent) {
          var bitangent = Cartesian3.cross(normal, tangent, scratchBitangent);
          Cartesian3.normalize(bitangent, bitangent);

          bitangents[bitangentIndex++] = bitangent.x;
          bitangents[bitangentIndex++] = bitangent.y;
          bitangents[bitangentIndex++] = bitangent.z;
        }
      }
    }

    if (vertexFormat.st) {
      attributes.st = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: st,
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
  }

  if (defined(ellipsoidGeometry._offsetAttribute)) {
    var length = positions.length;
    var applyOffset = new Uint8Array(length / 3);
    var offsetValue =
      ellipsoidGeometry._offsetAttribute === GeometryOffsetAttribute.NONE
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
    boundingSphere: BoundingSphere.fromEllipsoid(ellipsoidOuter),
    offsetAttribute: ellipsoidGeometry._offsetAttribute,
  });
};

var unitEllipsoidGeometry;

/**
 * Returns the geometric representation of a unit ellipsoid, including its vertices, indices, and a bounding sphere.
 * @returns {Geometry} The computed vertices and indices.
 *
 * @private
 */
EllipsoidGeometry.getUnitEllipsoid = function () {
  if (!defined(unitEllipsoidGeometry)) {
    unitEllipsoidGeometry = EllipsoidGeometry.createGeometry(
      new EllipsoidGeometry({
        radii: new Cartesian3(1.0, 1.0, 1.0),
        vertexFormat: VertexFormat.POSITION_ONLY,
      })
    );
  }
  return unitEllipsoidGeometry;
};
export default EllipsoidGeometry;
