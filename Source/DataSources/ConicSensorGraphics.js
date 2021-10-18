import defaultValue from "../Core/defaultValue.js";
import defined from "../Core/defined.js";
import DeveloperError from "../Core/DeveloperError.js";
import Event from "../Core/Event.js";
import createMaterialPropertyDescriptor from "./createMaterialPropertyDescriptor.js";
import createPropertyDescriptor from "./createPropertyDescriptor.js";

/**
 * @typedef {Object} ConicSensorGraphics.ConstructorOptions
 *
 * Initialization options for the ConicSensorGraphics constructor
 *
 * @property {Property | boolean} [show=true] A boolean Property specifying the visibility of the conicSensor.
 * @property {Property | number} [length] A numeric Property specifying the length of the conicSensor.
 * @property {Property | number} [topInnerRadius] A numeric Property specifying the inner radius of the top of the conicSensor.
 * @property {Property | number} [topOuterRadius] A numeric Property specifying the outer radius of the top of the conicSensor.
 * @property {Property | number} [bottomInnerRadius] A numeric Property specifying the inner radius of the bottom of the conicSensor.
 * @property {Property | number} [bottomOuterRadius] A numeric Property specifying the outer radius of the bottom of the conicSensor.
 * @property {Property | number} [thetaSegments] A numeric Property specifying the theta segments of the conicSensor.
 * @property {Property | number} [phiSegments] A numeric Property specifying the phi segments of the conicSensor.
 * @property {Property | number} [thetaStart] A numeric Property specifying the theta start of the conicSensor.
 * @property {Property | number} [thetaLength] A numeric Property specifying the theta length of the conicSensor.
 * @property {Property | HeightReference} [heightReference=HeightReference.NONE] A Property specifying what the height from the entity position is relative to.
 * @property {Property | boolean} [fill=true] A boolean Property specifying whether the conicSensor is filled with the provided material.
 * @property {MaterialProperty | Color} [material=Color.WHITE] A Property specifying the material used to fill the conicSensor.
 * @property {Property | boolean} [outline=false] A boolean Property specifying whether the conicSensor is outlined.
 * @property {Property | Color} [outlineColor=Color.BLACK] A Property specifying the {@link Color} of the outline.
 * @property {Property | number} [outlineWidth=1.0] A numeric Property specifying the width of the outline.
 * @property {Property | number} [numberOfVerticalLines=16] A numeric Property specifying the number of vertical lines to draw along the perimeter for the outline.
 * @property {Property | number} [slices=128] The number of edges around the perimeter of the conicSensor.
 * @property {Property | ShadowMode} [shadows=ShadowMode.DISABLED] An enum Property specifying whether the conicSensor casts or receives shadows from light sources.
 * @property {Property | DistanceDisplayCondition} [distanceDisplayCondition] A Property specifying at what distance from the camera that this conicSensor will be displayed.
 */

/**
 * Describes a conicSensor, truncated cone, or cone defined by a length, top radius, and bottom radius.
 * The center position and orientation are determined by the containing {@link Entity}.
 *
 * @alias ConicSensorGraphics
 * @constructor
 *
 * @param {ConicSensorGraphics.ConstructorOptions} [options] Object describing initialization options
 */
function ConicSensorGraphics(options) {
  this._definitionChanged = new Event();
  this._show = undefined;
  this._showSubscription = undefined;
  this._length = undefined;
  this._lengthSubscription = undefined;
  this._topInnerRadius = undefined;
  this._topInnerRadiusSubscription = undefined;
  this._topOuterRadius = undefined;
  this._topOuterRadiusSubscription = undefined;
  this._bottomInnerRadius = undefined;
  this._bottomInnerRadiusSubscription = undefined;
  this._bottomOuterRadius = undefined;
  this._bottomOuterRadiusSubscription = undefined;
  this._thetaSegments = undefined;
  this._thetaSegmentsSubscription = undefined;
  this._phiSegments = undefined;
  this._phiSegmentsSubscription = undefined;
  this._thetaStart = undefined;
  this._thetaStartSubscription = undefined;
  this._thetaLength = undefined;
  this._thetaLengthSubscription = undefined;
  this._heightReference = undefined;
  this._heightReferenceSubscription = undefined;
  this._fill = undefined;
  this._fillSubscription = undefined;
  this._material = undefined;
  this._materialSubscription = undefined;
  this._outline = undefined;
  this._outlineSubscription = undefined;
  this._outlineColor = undefined;
  this._outlineColorSubscription = undefined;
  this._outlineWidth = undefined;
  this._outlineWidthSubscription = undefined;
  this._numberOfVerticalLines = undefined;
  this._numberOfVerticalLinesSubscription = undefined;
  this._slices = undefined;
  this._slicesSubscription = undefined;
  this._shadows = undefined;
  this._shadowsSubscription = undefined;
  this._distanceDisplayCondition = undefined;
  this._distanceDisplayConditionSubscription = undefined;

  this.merge(defaultValue(options, defaultValue.EMPTY_OBJECT));
}

Object.defineProperties(ConicSensorGraphics.prototype, {
  /**
   * Gets the event that is raised whenever a property or sub-property is changed or modified.
   * @memberof ConicSensorGraphics.prototype
   *
   * @type {Event}
   * @readonly
   */
  definitionChanged: {
    get: function () {
      return this._definitionChanged;
    },
  },

  /**
   * Gets or sets the boolean Property specifying the visibility of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default true
   */
  show: createPropertyDescriptor("show"),

  /**
   * Gets or sets the numeric Property specifying the length of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  length: createPropertyDescriptor("length"),

  /**
   * Gets or sets the numeric Property specifying the radius of the top of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  topInnerRadius: createPropertyDescriptor("topInnerRadius"),

  /**
   * Gets or sets the numeric Property specifying the radius of the bottom of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  topOuterRadius: createPropertyDescriptor("topOuterRadius"),

  /**
   * Gets or sets the numeric Property specifying the radius of the bottom of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  bottomInnerRadius: createPropertyDescriptor("bottomInnerRadius"),

  /**
   * Gets or sets the numeric Property specifying the radius of the bottom of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  bottomOuterRadius: createPropertyDescriptor("bottomOuterRadius"),
  /**
   * Gets or sets the numeric Property specifying the radius of the bottom of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  thetaSegments: createPropertyDescriptor("thetaSegments"),

  /**
   * Gets or sets the numeric Property specifying the radius of the bottom of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  phiSegments: createPropertyDescriptor("phiSegments"),

  /**
   * Gets or sets the numeric Property specifying the radius of the bottom of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  thetaStart: createPropertyDescriptor("thetaStart"),

  /**
   * Gets or sets the numeric Property specifying the radius of the bottom of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  thetaLength: createPropertyDescriptor("thetaLength"),

  /**
   * Gets or sets the Property specifying the {@link HeightReference}.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default HeightReference.NONE
   */
  heightReference: createPropertyDescriptor("heightReference"),

  /**
   * Gets or sets the boolean Property specifying whether the conicSensor is filled with the provided material.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default true
   */
  fill: createPropertyDescriptor("fill"),

  /**
   * Gets or sets the Property specifying the material used to fill the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {MaterialProperty|undefined}
   * @default Color.WHITE
   */
  material: createMaterialPropertyDescriptor("material"),

  /**
   * Gets or sets the boolean Property specifying whether the conicSensor is outlined.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default false
   */
  outline: createPropertyDescriptor("outline"),

  /**
   * Gets or sets the Property specifying the {@link Color} of the outline.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default Color.BLACK
   */
  outlineColor: createPropertyDescriptor("outlineColor"),

  /**
   * Gets or sets the numeric Property specifying the width of the outline.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default 1.0
   */
  outlineWidth: createPropertyDescriptor("outlineWidth"),

  /**
   * Gets or sets the Property specifying the number of vertical lines to draw along the perimeter for the outline.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default 16
   */
  numberOfVerticalLines: createPropertyDescriptor("numberOfVerticalLines"),

  /**
   * Gets or sets the Property specifying the number of edges around the perimeter of the conicSensor.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default 128
   */
  slices: createPropertyDescriptor("slices"),

  /**
   * Get or sets the enum Property specifying whether the conicSensor
   * casts or receives shadows from light sources.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   * @default ShadowMode.DISABLED
   */
  shadows: createPropertyDescriptor("shadows"),

  /**
   * Gets or sets the {@link DistanceDisplayCondition} Property specifying at what distance from the camera that this conicSensor will be displayed.
   * @memberof ConicSensorGraphics.prototype
   * @type {Property|undefined}
   */
  distanceDisplayCondition: createPropertyDescriptor(
    "distanceDisplayCondition"
  ),
});

/**
 * Duplicates this instance.
 *
 * @param {ConicSensorGraphics} [result] The object onto which to store the result.
 * @returns {ConicSensorGraphics} The modified result parameter or a new instance if one was not provided.
 */
ConicSensorGraphics.prototype.clone = function (result) {
  if (!defined(result)) {
    return new ConicSensorGraphics(this);
  }
  result.show = this.show;
  result.length = this.length;
  result.topInnerRadius = this.topInnerRadius;
  result.topOuterRadius = this.topOuterRadius;
  result.bottomInnerRadius = this.bottomInnerRadius;
  result.bottomOuterRadius = this.bottomOuterRadius;
  result.thetaSegments = this.thetaSegments;
  result.phiSegments = this.phiSegments;
  result.thetaStart = this.thetaStart;
  result.thetaLength = this.thetaLength;
  result.heightReference = this.heightReference;
  result.fill = this.fill;
  result.material = this.material;
  result.outline = this.outline;
  result.outlineColor = this.outlineColor;
  result.outlineWidth = this.outlineWidth;
  result.numberOfVerticalLines = this.numberOfVerticalLines;
  result.slices = this.slices;
  result.shadows = this.shadows;
  result.distanceDisplayCondition = this.distanceDisplayCondition;
  return result;
};

/**
 * Assigns each unassigned property on this object to the value
 * of the same property on the provided source object.
 *
 * @param {ConicSensorGraphics} source The object to be merged into this object.
 */
ConicSensorGraphics.prototype.merge = function (source) {
  //>>includeStart('debug', pragmas.debug);
  if (!defined(source)) {
    throw new DeveloperError("source is required.");
  }
  //>>includeEnd('debug');

  this.show = defaultValue(this.show, source.show);
  this.length = defaultValue(this.length, source.length);
  this.topInnerRadius = defaultValue(this.topInnerRadius, source.topInnerRadius);
  this.topOuterRadius = defaultValue(this.topOuterRadius, source.topOuterRadius);
  this.bottomInnerRadius = defaultValue(this.bottomInnerRadius, source.bottomInnerRadius);
  this.bottomOuterRadius = defaultValue(this.bottomOuterRadius, source.bottomOuterRadius);
  this.thetaSegments = defaultValue(this.thetaSegments ,source.thetaSegments);
  this.phiSegments = defaultValue(this.phiSegments ,source.phiSegments);
  this.thetaStart = defaultValue(this.thetaStart ,source.thetaStart);
  this.thetaLength = defaultValue(this.thetaLength ,source.thetaLength);
  this.heightReference = defaultValue(
    this.heightReference,
    source.heightReference
  );
  this.fill = defaultValue(this.fill, source.fill);
  this.material = defaultValue(this.material, source.material);
  this.outline = defaultValue(this.outline, source.outline);
  this.outlineColor = defaultValue(this.outlineColor, source.outlineColor);
  this.outlineWidth = defaultValue(this.outlineWidth, source.outlineWidth);
  this.numberOfVerticalLines = defaultValue(
    this.numberOfVerticalLines,
    source.numberOfVerticalLines
  );
  this.slices = defaultValue(this.slices, source.slices);
  this.shadows = defaultValue(this.shadows, source.shadows);
  this.distanceDisplayCondition = defaultValue(
    this.distanceDisplayCondition,
    source.distanceDisplayCondition
  );
};
export default ConicSensorGraphics;
