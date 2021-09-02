import RectangleSensorOutlineGeometry from "../Core/RectangleSensorOutlineGeometry";
import defined from "../Core/defined.js";

function createRectangleSensorOutlineGeometry(rectangleSensorGeometry, offset) {
  if (defined(offset)) {
    rectangleSensorGeometry = RectangleSensorOutlineGeometry.unpack(rectangleSensorGeometry, offset);
  }
  return RectangleSensorOutlineGeometry.createGeometry(rectangleSensorGeometry);
}
export default createRectangleSensorOutlineGeometry;
