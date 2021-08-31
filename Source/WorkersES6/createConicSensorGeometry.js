import ConicSensorGeometry from "../Core/ConicSensorGeometry.js";
import defined from "../Core/defined.js";

function createConicSensorGeometry(conicSensorGeometry, offset) {
  if (defined(offset)) {
    conicSensorGeometry = ConicSensorGeometry.unpack(conicSensorGeometry, offset);
  }
  return ConicSensorGeometry.createGeometry(conicSensorGeometry);
}
export default createConicSensorGeometry;
