import Cartesian3 from "../Core/Cartesian3.js";
import Check from "../Core/Check.js";
import Color from "../Core/Color.js";
import ColorGeometryInstanceAttribute from "../Core/ColorGeometryInstanceAttribute.js";
import RectangleSensorGeometry from "../Core/RectangleSensorGeometry.js";
import RectangleSensorOutlineGeometry from "../Core/RectangleSensorOutlineGeometry.js";
import defined from "../Core/defined.js";
import DeveloperError from "../Core/DeveloperError.js";
import DistanceDisplayConditionGeometryInstanceAttribute from "../Core/DistanceDisplayConditionGeometryInstanceAttribute.js";
import GeometryInstance from "../Core/GeometryInstance.js";
import GeometryOffsetAttribute from "../Core/GeometryOffsetAttribute.js";
import Iso8601 from "../Core/Iso8601.js";
import OffsetGeometryInstanceAttribute from "../Core/OffsetGeometryInstanceAttribute.js";
import ShowGeometryInstanceAttribute from "../Core/ShowGeometryInstanceAttribute.js";
import HeightReference from "../Scene/HeightReference.js";
import MaterialAppearance from "../Scene/MaterialAppearance.js";
import PerInstanceColorAppearance from "../Scene/PerInstanceColorAppearance.js";
import ColorMaterialProperty from "./ColorMaterialProperty.js";
import DynamicGeometryUpdater from "./DynamicGeometryUpdater.js";
import GeometryUpdater from "./GeometryUpdater.js";
import heightReferenceOnEntityPropertyChanged from "./heightReferenceOnEntityPropertyChanged.js";
import Property from "./Property.js";

var defaultOffset = Cartesian3.ZERO;

var offsetScratch = new Cartesian3();
var positionScratch = new Cartesian3();
var scratchColor = new Color();

function RectangleSensorGeometryOptions(entity) {
  this.id = entity;
  this.vertexFormat = undefined;
  this.length = undefined;
  this.leftHalfAngle = undefined;
  this.rightHalfAngle = undefined;
  this.frontHalfAngle = undefined;
  this.backHalfAngle = undefined;
  this.offsetAttribute = undefined;
}

/**
 * A {@link GeometryUpdater} for rectangleSensors.
 * Clients do not normally create this class directly, but instead rely on {@link DataSourceDisplay}.
 * @alias RectangleSensorGeometryUpdater
 * @constructor
 *
 * @param {Entity} entity The entity containing the geometry to be visualized.
 * @param {Scene} scene The scene where visualization is taking place.
 */
function RectangleSensorGeometryUpdater(entity, scene) {
  GeometryUpdater.call(this, {
    entity: entity,
    scene: scene,
    geometryOptions: new RectangleSensorGeometryOptions(entity),
    geometryPropertyName: "rectangleSensor",
    observedPropertyNames: [
      "availability",
      "position",
      "orientation",
      "rectangleSensor",
    ],
  });

  this._onEntityPropertyChanged(entity, "rectangleSensor", entity.rectangleSensor, undefined);
}

if (defined(Object.create)) {
  RectangleSensorGeometryUpdater.prototype = Object.create(GeometryUpdater.prototype);
  RectangleSensorGeometryUpdater.prototype.constructor = RectangleSensorGeometryUpdater;
}

Object.defineProperties(RectangleSensorGeometryUpdater.prototype, {
  /**
   * Gets the terrain offset property
   * @type {TerrainOffsetProperty}
   * @memberof RectangleSensorGeometryUpdater.prototype
   * @readonly
   * @private
   */
  terrainOffsetProperty: {
    get: function () {
      return this._terrainOffsetProperty;
    },
  },
});

/**
 * Creates the geometry instance which represents the fill of the geometry.
 *
 * @param {JulianDate} time The time to use when retrieving initial attribute values.
 * @returns {GeometryInstance} The geometry instance representing the filled portion of the geometry.
 *
 * @exception {DeveloperError} This instance does not represent a filled geometry.
 */
RectangleSensorGeometryUpdater.prototype.createFillGeometryInstance = function (time) {
  //>>includeStart('debug', pragmas.debug);
  Check.defined("time", time);

  if (!this._fillEnabled) {
    throw new DeveloperError(
      "This instance does not represent a filled geometry."
    );
  }
  //>>includeEnd('debug');

  var entity = this._entity;
  var isAvailable = entity.isAvailable(time);

  var show = new ShowGeometryInstanceAttribute(
    isAvailable &&
    entity.isShowing &&
    this._showProperty.getValue(time) &&
    this._fillProperty.getValue(time)
  );
  var distanceDisplayCondition = this._distanceDisplayConditionProperty.getValue(
    time
  );
  var distanceDisplayConditionAttribute = DistanceDisplayConditionGeometryInstanceAttribute.fromDistanceDisplayCondition(
    distanceDisplayCondition
  );

  var attributes = {
    show: show,
    distanceDisplayCondition: distanceDisplayConditionAttribute,
    color: undefined,
    offset: undefined,
  };
  if (this._materialProperty instanceof ColorMaterialProperty) {
    var currentColor;
    if (
      defined(this._materialProperty.color) &&
      (this._materialProperty.color.isConstant || isAvailable)
    ) {
      currentColor = this._materialProperty.color.getValue(time, scratchColor);
    }
    if (!defined(currentColor)) {
      currentColor = Color.WHITE;
    }
    attributes.color = ColorGeometryInstanceAttribute.fromColor(currentColor);
  }

  if (defined(this._options.offsetAttribute)) {
    attributes.offset = OffsetGeometryInstanceAttribute.fromCartesian3(
      Property.getValueOrDefault(
        this._terrainOffsetProperty,
        time,
        defaultOffset,
        offsetScratch
      )
    );
  }

  return new GeometryInstance({
    id: entity,
    geometry: new RectangleSensorGeometry(this._options),
    modelMatrix: entity.computeModelMatrixForHeightReference(
      time,
      entity.rectangleSensor.heightReference,
      this._options.length * 0.5,
      this._scene.mapProjection.ellipsoid
    ),
    attributes: attributes,
  });
};

/**
 * Creates the geometry instance which represents the outline of the geometry.
 *
 * @param {JulianDate} time The time to use when retrieving initial attribute values.
 * @returns {GeometryInstance} The geometry instance representing the outline portion of the geometry.
 *
 * @exception {DeveloperError} This instance does not represent an outlined geometry.
 */
RectangleSensorGeometryUpdater.prototype.createOutlineGeometryInstance = function (
  time
) {
  //>>includeStart('debug', pragmas.debug);
  Check.defined("time", time);

  if (!this._outlineEnabled) {
    throw new DeveloperError(
      "This instance does not represent an outlined geometry."
    );
  }
  //>>includeEnd('debug');

  var entity = this._entity;
  var isAvailable = entity.isAvailable(time);
  var outlineColor = Property.getValueOrDefault(
    this._outlineColorProperty,
    time,
    Color.BLACK,
    scratchColor
  );
  var distanceDisplayCondition = this._distanceDisplayConditionProperty.getValue(
    time
  );

  var attributes = {
    show: new ShowGeometryInstanceAttribute(
      isAvailable &&
      entity.isShowing &&
      this._showProperty.getValue(time) &&
      this._showOutlineProperty.getValue(time)
    ),
    color: ColorGeometryInstanceAttribute.fromColor(outlineColor),
    distanceDisplayCondition: DistanceDisplayConditionGeometryInstanceAttribute.fromDistanceDisplayCondition(
      distanceDisplayCondition
    ),
    offset: undefined,
  };
  if (defined(this._options.offsetAttribute)) {
    attributes.offset = OffsetGeometryInstanceAttribute.fromCartesian3(
      Property.getValueOrDefault(
        this._terrainOffsetProperty,
        time,
        defaultOffset,
        offsetScratch
      )
    );
  }

  return new GeometryInstance({
    id: entity,
    geometry: new RectangleSensorOutlineGeometry(this._options),
    modelMatrix: entity.computeModelMatrixForHeightReference(
      time,
      entity.rectangleSensor.heightReference,
      this._options.length * 0.5,
      this._scene.mapProjection.ellipsoid
    ),
    attributes: attributes,
  });
};

RectangleSensorGeometryUpdater.prototype._computeCenter = function (time, result) {
  return Property.getValueOrUndefined(this._entity.position, time, result);
};

RectangleSensorGeometryUpdater.prototype._isHidden = function (entity, rectangleSensor) {
  return (
    !defined(entity.position) ||
    !defined(rectangleSensor.length) ||
    GeometryUpdater.prototype._isHidden.call(this, entity, rectangleSensor)
  );
};

RectangleSensorGeometryUpdater.prototype._isDynamic = function (entity, rectangleSensor) {
  return (
    !entity.position.isConstant || //
    !Property.isConstant(entity.orientation) || //
    !rectangleSensor.length.isConstant || //
    !Property.isConstant(rectangleSensor.leftHalfAngle) || //
    !Property.isConstant(rectangleSensor.rightHalfAngle) || //
    !Property.isConstant(rectangleSensor.frontHalfAngle) || //
    !Property.isConstant(rectangleSensor.backHalfAngle)
  );
};

RectangleSensorGeometryUpdater.prototype._setStaticOptions = function (
  entity,
  rectangleSensor
) {
  var heightReference = Property.getValueOrDefault(
    rectangleSensor.heightReference,
    Iso8601.MINIMUM_VALUE,
    HeightReference.NONE
  );
  var options = this._options;
  options.vertexFormat =
    this._materialProperty instanceof ColorMaterialProperty
    ? PerInstanceColorAppearance.VERTEX_FORMAT
    : MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat;
  options.length = rectangleSensor.length.getValue(Iso8601.MINIMUM_VALUE);
  options.leftHalfAngle = Property.getValueOrUndefined(
    rectangleSensor.leftHalfAngle,
    Iso8601.MINIMUM_VALUE);
  options.rightHalfAngle = Property.getValueOrUndefined(
    rectangleSensor.rightHalfAngle,
    Iso8601.MINIMUM_VALUE);
  options.frontHalfAngle = Property.getValueOrUndefined(
    rectangleSensor.frontHalfAngle,
    Iso8601.MINIMUM_VALUE);
  options.backHalfAngle = Property.getValueOrUndefined(
    rectangleSensor.backHalfAngle,
    Iso8601.MINIMUM_VALUE
  );
  options.offsetAttribute =
    heightReference !== HeightReference.NONE
    ? GeometryOffsetAttribute.ALL
    : undefined;
};

RectangleSensorGeometryUpdater.prototype._onEntityPropertyChanged = heightReferenceOnEntityPropertyChanged;

RectangleSensorGeometryUpdater.DynamicGeometryUpdater = DynamicRectangleSensorGeometryUpdater;

/**
 * @private
 */
function DynamicRectangleSensorGeometryUpdater(
  geometryUpdater,
  primitives,
  groundPrimitives
) {
  DynamicGeometryUpdater.call(
    this,
    geometryUpdater,
    primitives,
    groundPrimitives
  );
}

if (defined(Object.create)) {
  DynamicRectangleSensorGeometryUpdater.prototype = Object.create(
    DynamicGeometryUpdater.prototype
  );
  DynamicRectangleSensorGeometryUpdater.prototype.constructor = DynamicRectangleSensorGeometryUpdater;
}

DynamicRectangleSensorGeometryUpdater.prototype._isHidden = function (
  entity,
  rectangleSensor,
  time
) {
  var options = this._options;
  var position = Property.getValueOrUndefined(
    entity.position,
    time,
    positionScratch
  );
  return (
    !defined(position) ||
    !defined(options.length) ||
    DynamicGeometryUpdater.prototype._isHidden.call(
      this,
      entity,
      rectangleSensor,
      time
    )
  );
};

DynamicRectangleSensorGeometryUpdater.prototype._setOptions = function (
  entity,
  rectangleSensor,
  time
) {
  var heightReference = Property.getValueOrDefault(
    rectangleSensor.heightReference,
    time,
    HeightReference.NONE
  );
  var options = this._options;
  options.length = Property.getValueOrUndefined(rectangleSensor.length, time);
  options.leftHalfAngle = Property.getValueOrUndefined(rectangleSensor.leftHalfAngle, time);
  options.rightHalfAngle = Property.getValueOrUndefined(rectangleSensor.rightHalfAngle, time);
  options.frontHalfAngle = Property.getValueOrUndefined(rectangleSensor.frontHalfAngle, time);
  options.backHalfAngle = Property.getValueOrUndefined(rectangleSensor.backHalfAngle, time);
  options.offsetAttribute =
    heightReference !== HeightReference.NONE
    ? GeometryOffsetAttribute.ALL
    : undefined;
};
export default RectangleSensorGeometryUpdater;
