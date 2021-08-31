import RingOutlineGeometry from "../Core/RingOutlineGeometry.js";
import defined from "../Core/defined.js";

function createRingOutlineGeometry(ringGeometry, offset) {
  if (defined(offset)) {
    ringGeometry = RingOutlineGeometry.unpack(ringGeometry, offset);
  }
  return RingOutlineGeometry.createGeometry(ringGeometry);
}
export default createRingOutlineGeometry;
