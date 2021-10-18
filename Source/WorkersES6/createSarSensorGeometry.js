import SarSensorGeometry from "../Core/SarSensorGeometry";
import defined from "../Core/defined.js";

function createSarSensorGeometry(sarSensorGeometry, offset) {
  if (defined(offset)) {
    sarSensorGeometry = SarSensorGeometry.unpack(sarSensorGeometry, offset);
  }
  return SarSensorGeometry.createGeometry(sarSensorGeometry);
}
export default createSarSensorGeometry;
