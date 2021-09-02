import RectangleSensorGeometry from "../Core/RectangleSensorGeometry";
import defined from "../Core/defined.js";

function createRectangleSensorGeometry(rectangleSensorGeometry, offset) {
  if (defined(offset)) {
    rectangleSensorGeometry = RectangleSensorGeometry.unpack(rectangleSensorGeometry, offset);
  }
  return RectangleSensorGeometry.createGeometry(rectangleSensorGeometry);
}
export default createRectangleSensorGeometry;
