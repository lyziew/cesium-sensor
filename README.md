<p align="center">
<img src="https://github.com/CesiumGS/cesium/wiki/logos/Cesium_Logo_Color.jpg" width="50%" />
</p>

[![Build Status](https://travis-ci.org/CesiumGS/cesium.svg?branch=master)](https://travis-ci.org/CesiumGS/cesium)
[![npm](https://img.shields.io/npm/v/cesium)](https://www.npmjs.com/package/cesium)
[![Docs](https://img.shields.io/badge/docs-online-orange.svg)](https://cesium.com/docs/)

CesiumJS is a JavaScript library for creating 3D globes and 2D maps in a web browser without a plugin. It uses WebGL for hardware-accelerated graphics, and is cross-platform, cross-browser, and tuned for dynamic-data visualization.

[CesiumJS Homepage](https://cesium.com/cesiumjs)

[CesiumJS Features Checklist](https://github.com/CesiumGS/cesium/wiki/CesiumJS-Features-Checklist)

### :rocket: Get Started

Visit the [Downloads page](https://cesium.com/downloads/) or use the npm module:

```
npm install cesium

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
 * @typedef {Object} RectangleSensorGraphics.ConstructorOptions
 *
 * Initialization options for the RectangleSensorGraphics constructor
 *
 * @property {Property | boolean} [show=true] A boolean Property specifying the visibility of the rectangleSensor.
 * @property {Property | number} [length] A numeric Property specifying the length of the rectangleSensor.
 * @property {Property | number} [leftHalfAngle] A numeric Property specifying the left half angle of the rectangleSensor.
 * @property {Property | number} [rightHalfAngle] A numeric Property specifying the right half angle of the rectangleSensor.
 * @property {Property | number} [frontHalfAngle] A numeric Property specifying the front half angle of the rectangleSensor.
 * @property {Property | number} [backHalfAngle] A numeric Property specifying the back half angle of the rectangleSensor.
 * @property {Property | HeightReference} [heightReference=HeightReference.NONE] A Property specifying what the height from the entity position is relative to.
 * @property {Property | boolean} [fill=true] A boolean Property specifying whether the rectangleSensor is filled with the provided material.
 * @property {MaterialProperty | Color} [material=Color.WHITE] A Property specifying the material used to fill the rectangleSensor.
 * @property {Property | boolean} [outline=false] A boolean Property specifying whether the rectangleSensor is outlined.
 * @property {Property | Color} [outlineColor=Color.BLACK] A Property specifying the {@link Color} of the outline.
 * @property {Property | number} [outlineWidth=1.0] A numeric Property specifying the width of the outline.
 * @property {Property | number} [numberOfVerticalLines=16] A numeric Property specifying the number of vertical lines to draw along the perimeter for the outline.
 * @property {Property | number} [slices=128] The number of edges around the perimeter of the rectangleSensor.
 * @property {Property | ShadowMode} [shadows=ShadowMode.DISABLED] An enum Property specifying whether the rectangleSensor casts or receives shadows from light sources.
 * @property {Property | DistanceDisplayCondition} [distanceDisplayCondition] A Property specifying at what distance from the camera that this rectangleSensor will be displayed.
 */

 /**
 * @typedef {Object} SarSensorGraphics.ConstructorOptions
 *
 * Initialization options for the SarSensorGraphics constructor
 *
 * @property {Property | boolean} [show=true] A boolean Property specifying the visibility of the sarSensor.
 * @property {Property | number} [length] A numeric Property specifying the length of the sarSensor.
 * @property {Property | number} [minLeftAngle] A numeric Property specifying the min left angle of the sarSensor.
 * @property {Property | number} [maxLeftAngle] A numeric Property specifying the max left angle of the sarSensor.
 * @property {Property | number} [minRightAngle] A numeric Property specifying the min right angle of the sarSensor.
 * @property {Property | number} [maxRightAngle] A numeric Property specifying the max right angle of the sarSensor.
 * @property {Property | number} [leftWidth] A numeric Property specifying the left range of the sarSensor.
 * @property {Property | number} [rightWidth] A numeric Property specifying the right range of the sarSensor.
 * @property {Property | HeightReference} [heightReference=HeightReference.NONE] A Property specifying what the height from the entity position is relative to.
 * @property {Property | boolean} [fill=true] A boolean Property specifying whether the sarSensor is filled with the provided material.
 * @property {MaterialProperty | Color} [material=Color.WHITE] A Property specifying the material used to fill the sarSensor.
 * @property {Property | boolean} [outline=false] A boolean Property specifying whether the sarSensor is outlined.
 * @property {Property | Color} [outlineColor=Color.BLACK] A Property specifying the {@link Color} of the outline.
 * @property {Property | number} [outlineWidth=1.0] A numeric Property specifying the width of the outline.
 * @property {Property | number} [numberOfVerticalLines=16] A numeric Property specifying the number of vertical lines to draw along the perimeter for the outline.
 * @property {Property | number} [slices=128] The number of edges around the perimeter of the sarSensor.
 * @property {Property | ShadowMode} [shadows=ShadowMode.DISABLED] An enum Property specifying whether the sarSensor casts or receives shadows from light sources.
 * @property {Property | DistanceDisplayCondition} [distanceDisplayCondition] A Property specifying at what distance from the camera that this sarSensor will be displayed.
 */
```

Have questions? Ask them on the [community forum](https://community.cesium.com/).

Interested in contributing? See [CONTRIBUTING.md](CONTRIBUTING.md). :heart:

### :snowflake: Mission

Our mission is to create the leading 3D globe and map for static and time-dynamic content, with the best possible performance, precision, visual quality, platform support, community, and ease of use.

### :green_book: License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0.html). CesiumJS is free for both commercial and non-commercial use.

### :earth_americas: Where Does the 3D Content Come From?

CesiumJS can stream 3D content such as terrain, imagery, and 3D Tiles from the commercial [Cesium ion](https://cesium.com/blog/2018/03/01/hello-cesium-ion/)
platform and other content sources. You are free to use any combination of content sources with CesiumJS that you please.
Using Cesium ion helps support CesiumJS development. :heart:

### :clap: Featured Demos

<p>
<a href="https://cesium.com/blog/2018/08/21/cybercity/"><img src="https://images.prismic.io/cesium/2018-08-21-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://apps.agi.com/SatelliteViewer/?Status=Operational"><img src="https://images.prismic.io/cesium/2018-03-29-comspoc-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2018/02/05/historic-pharsalia-cabin-point-cloud/"><img src="https://images.prismic.io/cesium/2018-02-05-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2017/12/12/onesky/"><img src="https://images.prismic.io/cesium/2017-12-12-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2017/11/20/nasa-storm-virtual-globe/"><img src="https://images.prismic.io/cesium/2017-11-20-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2017/11/16/gefs/"><img src="https://images.prismic.io/cesium/2017-11-16-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2019/01/04/norad-tracks-santa/"><img src="https://images.prismic.io/cesium/2019-01-04-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2017/07/23/drcog/"><img src="https://images.prismic.io/cesium/2017-07-23-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://demos.cesium.com/NewYork/"><img src="https://images.prismic.io/cesium/2017-05-05-nyc-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2018/09/27/swisstopo-live/"><img src="https://images.prismic.io/cesium/2018-09-27-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2016/12/12/stk-czml/"><img src="https://images.prismic.io/cesium/2016-12-12-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2016/09/29/contextcapture/"><img src="https://images.prismic.io/cesium/2016-09-29-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2016/04/20/flightradar24/"><img src="https://images.prismic.io/cesium/2016-04-20-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2016/02/03/fodarearth/"><img src="https://images.prismic.io/cesium/2016-02-03-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2015/08/19/mars-trek/"><img src="https://images.prismic.io/cesium/2015-08-19-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2015/07/16/hiroshima-archive/"><img src="https://images.prismic.io/cesium/2015-07-16-cover.jpg" width="30%" /></a>&nbsp;
<a href="https://cesium.com/blog/2019/06/13/red-bull-x-alps-in-cesium/"><img src="https://images.prismic.io/cesium/2015-10-02-cover.jpg" width="30%" /></a>&nbsp;
<br/>
<br/>
</p>
<h4><a href="https://cesium.com/blog/categories/userstories">See all demos</a></h4>
