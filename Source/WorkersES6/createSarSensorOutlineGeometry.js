import SarSensorOutlineGeometry from "../Core/SarSensorOutlineGeometry";
import defined from "../Core/defined.js";

function createSarSensorOutlineGeometry(sarSensorGeometry, offset) {
  if (defined(offset)) {
    sarSensorGeometry = SarSensorOutlineGeometry.unpack(sarSensorGeometry, offset);
  }
  return SarSensorOutlineGeometry.createGeometry(sarSensorGeometry);
}
export default createSarSensorOutlineGeometry;
