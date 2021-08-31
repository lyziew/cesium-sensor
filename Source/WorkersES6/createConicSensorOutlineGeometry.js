import ConicSensorOutlineGeometry from "../Core/ConicSensorOutlineGeometry.js";
import defined from "../Core/defined.js";

function createConicSensorOutlineGeometry(conicSensorGeometry, offset) {
  if (defined(offset)) {
    conicSensorGeometry = ConicSensorOutlineGeometry.unpack(conicSensorGeometry, offset);
  }
  return ConicSensorOutlineGeometry.createGeometry(conicSensorGeometry);
}
export default createConicSensorOutlineGeometry;
