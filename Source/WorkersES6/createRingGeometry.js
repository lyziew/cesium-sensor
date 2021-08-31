import RingGeometry from "../Core/RingGeometry.js";
import defined from "../Core/defined.js";

function createRingGeometry(ringGeometry, offset) {
  if (defined(offset)) {
    ringGeometry = RingGeometry.unpack(ringGeometry, offset);
  }
  return RingGeometry.createGeometry(ringGeometry);
}
export default createRingGeometry;
