class Geometry {

	center( geometry ) {
		geometry.computeBoundingBox();
		geometry.boundingBox.getCenter( geometry._offset ).negate();
		geometry.translate( geometry._offset.x, geometry._offset.y, geometry._offset.z );
	}

}

export { Geometry };
