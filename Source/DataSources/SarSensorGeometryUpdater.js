import Cartesian3 from "../Core/Cartesian3.js";
import Check from "../Core/Check.js";
import Color from "../Core/Color.js";
import ColorGeometryInstanceAttribute from "../Core/ColorGeometryInstanceAttribute.js";
import SarSensorGeometry from "../Core/SarSensorGeometry.js";
import SarSensorOutlineGeometry from "../Core/SarSensorOutlineGeometry.js";
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

function SarSensorGeometryOptions(entity) {
  this.id = entity;
  this.vertexFormat = undefined;
  this.length = undefined;
  this.minLeftAngle = undefined;
  this.maxLeftAngle = undefined;
  this.minRightAngle = undefined;
  this.maxRightAngle = undefined;
  this.leftRange = undefined;
  this.rightRange = undefined;
  this.offsetAttribute = undefined;
}

/**
 * A {@link GeometryUpdater} for sarSensors.
 * Clients do not normally create this class directly, but instead rely on {@link DataSourceDisplay}.
 * @alias SarSensorGeometryUpdater
 * @constructor
 *
 * @param {Entity} entity The entity containing the geometry to be visualized.
 * @param {Scene} scene The scene where visualization is taking place.
 */
function SarSensorGeometryUpdater(entity, scene) {
  GeometryUpdater.call(this, {
    entity: entity,
    scene: scene,
    geometryOptions: new SarSensorGeometryOptions(entity),
    geometryPropertyName: "sarSensor",
    observedPropertyNames: [
      "availability",
      "position",
      "orientation",
      "sarSensor",
    ],
  });

  this._onEntityPropertyChanged(entity, "sarSensor", entity.sarSensor, undefined);
}

if (defined(Object.create)) {
  SarSensorGeometryUpdater.prototype = Object.create(GeometryUpdater.prototype);
  SarSensorGeometryUpdater.prototype.constructor = SarSensorGeometryUpdater;
}

Object.defineProperties(SarSensorGeometryUpdater.prototype, {
  /**
   * Gets the terrain offset property
   * @type {TerrainOffsetProperty}
   * @memberof SarSensorGeometryUpdater.prototype
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
SarSensorGeometryUpdater.prototype.createFillGeometryInstance = function (time) {
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
    geometry: new SarSensorGeometry(this._options),
    modelMatrix: entity.computeModelMatrixForHeightReference(
      time,
      entity.sarSensor.heightReference,
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
SarSensorGeometryUpdater.prototype.createOutlineGeometryInstance = function (
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
    geometry: new SarSensorOutlineGeometry(this._options),
    modelMatrix: entity.computeModelMatrixForHeightReference(
      time,
      entity.sarSensor.heightReference,
      this._options.length * 0.5,
      this._scene.mapProjection.ellipsoid
    ),
    attributes: attributes,
  });
};

SarSensorGeometryUpdater.prototype._computeCenter = function (time, result) {
  return Property.getValueOrUndefined(this._entity.position, time, result);
};

SarSensorGeometryUpdater.prototype._isHidden = function (entity, sarSensor) {
  return (
    !defined(entity.position) ||
    !defined(sarSensor.length) ||
    GeometryUpdater.prototype._isHidden.call(this, entity, sarSensor)
  );
};

SarSensorGeometryUpdater.prototype._isDynamic = function (entity, sarSensor) {
  return (
    !entity.position.isConstant || //
    !Property.isConstant(entity.orientation) || //
    !sarSensor.length.isConstant || //
    !Property.isConstant(sarSensor.minLeftAngle) || //
    !Property.isConstant(sarSensor.maxLeftAngle) || //
    !Property.isConstant(sarSensor.minRightAngle) || //
    !Property.isConstant(sarSensor.maxRightAngle) || //
    !Property.isConstant(sarSensor.leftRange) || //
    !Property.isConstant(sarSensor.rightRange)
  );
};

SarSensorGeometryUpdater.prototype._setStaticOptions = function (
  entity,
  sarSensor
) {
  var heightReference = Property.getValueOrDefault(
    sarSensor.heightReference,
    Iso8601.MINIMUM_VALUE,
    HeightReference.NONE
  );
  var options = this._options;
  options.vertexFormat =
    this._materialProperty instanceof ColorMaterialProperty
    ? PerInstanceColorAppearance.VERTEX_FORMAT
    : MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat;
  options.length = sarSensor.length.getValue(Iso8601.MINIMUM_VALUE);
  options.minLeftAngle = Property.getValueOrUndefined(
    sarSensor.minLeftAngle,
    Iso8601.MINIMUM_VALUE);
  options.maxLeftAngle = Property.getValueOrUndefined(
    sarSensor.maxLeftAngle,
    Iso8601.MINIMUM_VALUE);
  options.minRightAngle = Property.getValueOrUndefined(
    sarSensor.minRightAngle,
    Iso8601.MINIMUM_VALUE);
  options.maxRightAngle = Property.getValueOrUndefined(
    sarSensor.maxRightAngle,
    Iso8601.MINIMUM_VALUE
  );
  options.leftRange = Property.getValueOrUndefined(
    sarSensor.leftRange,
    Iso8601.MINIMUM_VALUE
  );
  options.rightRange = Property.getValueOrUndefined(
    sarSensor.rightRange,
    Iso8601.MINIMUM_VALUE
  );
  options.offsetAttribute =
    heightReference !== HeightReference.NONE
    ? GeometryOffsetAttribute.ALL
    : undefined;
};

SarSensorGeometryUpdater.prototype._onEntityPropertyChanged = heightReferenceOnEntityPropertyChanged;

SarSensorGeometryUpdater.DynamicGeometryUpdater = DynamicSarSensorGeometryUpdater;

/**
 * @private
 */
function DynamicSarSensorGeometryUpdater(
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
  DynamicSarSensorGeometryUpdater.prototype = Object.create(
    DynamicGeometryUpdater.prototype
  );
  DynamicSarSensorGeometryUpdater.prototype.constructor = DynamicSarSensorGeometryUpdater;
}

DynamicSarSensorGeometryUpdater.prototype._isHidden = function (
  entity,
  sarSensor,
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
      sarSensor,
      time
    )
  );
};

DynamicSarSensorGeometryUpdater.prototype._setOptions = function (
  entity,
  sarSensor,
  time
) {
  var heightReference = Property.getValueOrDefault(
    sarSensor.heightReference,
    time,
    HeightReference.NONE
  );
  var options = this._options;
  options.length = Property.getValueOrUndefined(sarSensor.length, time);
  options.minLeftAngle = Property.getValueOrUndefined(sarSensor.minLeftAngle, time);
  options.maxLeftAngle = Property.getValueOrUndefined(sarSensor.maxLeftAngle, time);
  options.minRightAngle = Property.getValueOrUndefined(sarSensor.minRightAngle, time);
  options.maxRightAngle = Property.getValueOrUndefined(sarSensor.maxRightAngle, time);
  options.leftRange = Property.getValueOrUndefined(sarSensor.leftRange, time);
  options.rightRange = Property.getValueOrUndefined(sarSensor.rightRange, time);
  options.offsetAttribute =
    heightReference !== HeightReference.NONE
    ? GeometryOffsetAttribute.ALL
    : undefined;
};
export default SarSensorGeometryUpdater;
