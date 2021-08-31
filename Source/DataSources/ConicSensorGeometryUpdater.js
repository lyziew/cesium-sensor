import Cartesian3 from "../Core/Cartesian3.js";
import Check from "../Core/Check.js";
import Color from "../Core/Color.js";
import ColorGeometryInstanceAttribute from "../Core/ColorGeometryInstanceAttribute.js";
import ConicSensorGeometry from "../Core/ConicSensorGeometry.js";
import ConicSensorOutlineGeometry from "../Core/ConicSensorOutlineGeometry.js";
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

function ConicSensorGeometryOptions(entity) {
  this.id = entity;
  this.vertexFormat = undefined;
  this.length = undefined;
  this.topRadius = undefined;
  this.bottomRadius = undefined;
  this.slices = undefined;
  this.numberOfVerticalLines = undefined;
  this.offsetAttribute = undefined;
}

/**
 * A {@link GeometryUpdater} for conicSensors.
 * Clients do not normally create this class directly, but instead rely on {@link DataSourceDisplay}.
 * @alias ConicSensorGeometryUpdater
 * @constructor
 *
 * @param {Entity} entity The entity containing the geometry to be visualized.
 * @param {Scene} scene The scene where visualization is taking place.
 */
function ConicSensorGeometryUpdater(entity, scene) {
  GeometryUpdater.call(this, {
    entity: entity,
    scene: scene,
    geometryOptions: new ConicSensorGeometryOptions(entity),
    geometryPropertyName: "conicSensor",
    observedPropertyNames: [
      "availability",
      "position",
      "orientation",
      "conicSensor",
    ],
  });

  this._onEntityPropertyChanged(entity, "conicSensor", entity.conicSensor, undefined);
}

if (defined(Object.create)) {
  ConicSensorGeometryUpdater.prototype = Object.create(GeometryUpdater.prototype);
  ConicSensorGeometryUpdater.prototype.constructor = ConicSensorGeometryUpdater;
}

Object.defineProperties(ConicSensorGeometryUpdater.prototype, {
  /**
   * Gets the terrain offset property
   * @type {TerrainOffsetProperty}
   * @memberof ConicSensorGeometryUpdater.prototype
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
ConicSensorGeometryUpdater.prototype.createFillGeometryInstance = function (time) {
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
    geometry: new ConicSensorGeometry(this._options),
    modelMatrix: entity.computeModelMatrixForHeightReference(
      time,
      entity.conicSensor.heightReference,
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
ConicSensorGeometryUpdater.prototype.createOutlineGeometryInstance = function (
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
    geometry: new ConicSensorOutlineGeometry(this._options),
    modelMatrix: entity.computeModelMatrixForHeightReference(
      time,
      entity.conicSensor.heightReference,
      this._options.length * 0.5,
      this._scene.mapProjection.ellipsoid
    ),
    attributes: attributes,
  });
};

ConicSensorGeometryUpdater.prototype._computeCenter = function (time, result) {
  return Property.getValueOrUndefined(this._entity.position, time, result);
};

ConicSensorGeometryUpdater.prototype._isHidden = function (entity, conicSensor) {
  return (
    !defined(entity.position) ||
    !defined(conicSensor.length) ||
    !defined(conicSensor.topRadius) ||
    !defined(conicSensor.bottomRadius) ||
    GeometryUpdater.prototype._isHidden.call(this, entity, conicSensor)
  );
};

ConicSensorGeometryUpdater.prototype._isDynamic = function (entity, conicSensor) {
  return (
    !entity.position.isConstant || //
    !Property.isConstant(entity.orientation) || //
    !conicSensor.length.isConstant || //
    !conicSensor.topRadius.isConstant || //
    !conicSensor.bottomRadius.isConstant || //
    !Property.isConstant(conicSensor.slices) || //
    !Property.isConstant(conicSensor.outlineWidth) || //
    !Property.isConstant(conicSensor.numberOfVerticalLines)
  );
};

ConicSensorGeometryUpdater.prototype._setStaticOptions = function (
  entity,
  conicSensor
) {
  var heightReference = Property.getValueOrDefault(
    conicSensor.heightReference,
    Iso8601.MINIMUM_VALUE,
    HeightReference.NONE
  );
  var options = this._options;
  options.vertexFormat =
    this._materialProperty instanceof ColorMaterialProperty
    ? PerInstanceColorAppearance.VERTEX_FORMAT
    : MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat;
  options.length = conicSensor.length.getValue(Iso8601.MINIMUM_VALUE);
  options.topRadius = conicSensor.topRadius.getValue(Iso8601.MINIMUM_VALUE);
  options.bottomRadius = conicSensor.bottomRadius.getValue(Iso8601.MINIMUM_VALUE);
  options.slices = Property.getValueOrUndefined(
    conicSensor.slices,
    Iso8601.MINIMUM_VALUE
  );
  options.numberOfVerticalLines = Property.getValueOrUndefined(
    conicSensor.numberOfVerticalLines,
    Iso8601.MINIMUM_VALUE
  );
  options.offsetAttribute =
    heightReference !== HeightReference.NONE
    ? GeometryOffsetAttribute.ALL
    : undefined;
};

ConicSensorGeometryUpdater.prototype._onEntityPropertyChanged = heightReferenceOnEntityPropertyChanged;

ConicSensorGeometryUpdater.DynamicGeometryUpdater = DynamicConicSensorGeometryUpdater;

/**
 * @private
 */
function DynamicConicSensorGeometryUpdater(
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
  DynamicConicSensorGeometryUpdater.prototype = Object.create(
    DynamicGeometryUpdater.prototype
  );
  DynamicConicSensorGeometryUpdater.prototype.constructor = DynamicConicSensorGeometryUpdater;
}

DynamicConicSensorGeometryUpdater.prototype._isHidden = function (
  entity,
  conicSensor,
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
    !defined(options.topRadius) || //
    !defined(options.bottomRadius) ||
    DynamicGeometryUpdater.prototype._isHidden.call(
      this,
      entity,
      conicSensor,
      time
    )
  );
};

DynamicConicSensorGeometryUpdater.prototype._setOptions = function (
  entity,
  conicSensor,
  time
) {
  var heightReference = Property.getValueOrDefault(
    conicSensor.heightReference,
    time,
    HeightReference.NONE
  );
  var options = this._options;
  options.length = Property.getValueOrUndefined(conicSensor.length, time);
  options.topRadius = Property.getValueOrUndefined(conicSensor.topRadius, time);
  options.bottomRadius = Property.getValueOrUndefined(
    conicSensor.bottomRadius,
    time
  );
  options.slices = Property.getValueOrUndefined(conicSensor.slices, time);
  options.numberOfVerticalLines = Property.getValueOrUndefined(
    conicSensor.numberOfVerticalLines,
    time
  );
  options.offsetAttribute =
    heightReference !== HeightReference.NONE
    ? GeometryOffsetAttribute.ALL
    : undefined;
};
export default ConicSensorGeometryUpdater;
