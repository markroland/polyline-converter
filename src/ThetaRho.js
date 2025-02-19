/** Class representing a Theta-Rho Sisyphus track */
class ThetaRho {

  /**
   * Create the Theta-Rho track file used by Sisyphus tables
   *
   * https://sisyphus-industries.com/community/community-tracks/new-tool-for-creating-simple-algorithmic-tracks/#post-296
   *
   **/
  convert(path, max_segment_length = 0.01) {

    // Initialize variables
    var theta;
    var current_theta;
    var previous_theta;
    var delta_theta;

    var rho;

    // Rotate the path by a quarter revolution
    path = this.ThrRotatePath(path, Math.PI/2);

    // Flip on the X axis
    // path = this.ThrScalePath(path, [-1, 1]);

    // Calculate the radius
    let max_radius = 0.0;
    let bbox = this.boundingBox(path);
    let center_point = [
      bbox[0][0] + (bbox[0][1] - bbox[0][0])/2,
      bbox[1][0] + (bbox[1][1] - bbox[1][0])/2,
    ];
    for (let point of path) {
      let distance_from_center = this.distance(point, center_point);
      if (distance_from_center > max_radius) {
        max_radius = distance_from_center;
      }
    }

    // Initialize thetaRho command string with the standard header
    var thetaRho = [];

    // Subdivide Path to increase smoothness
    path = this.subdividePath(path, max_segment_length);

    // The first point is initialized so that when looping
    // through successive points the Theta value can be compared
    // to the previous Theta position.
    previous_theta = this.calcTheta(path[0][0], path[0][1]);
    thetaRho.push(
      previous_theta.toFixed(4) +
      " " +
      this.calcRho(path[0][0], path[0][1], max_radius).toFixed(4)
    );

    // Loop through the rest of the path coordinates
    for (let i = 1; i < path.length; i++) {

      // Calculate current Theta from 0 to 2-Pi
      current_theta = this.calcTheta(path[i][0], path[i][1]);

      // Add on the full rotations previously completed
      current_theta += Math.floor(previous_theta / (2 * Math.PI)) * (2 * Math.PI);

      // Compute the difference to the last point.
      delta_theta = current_theta - previous_theta;

      // Correct delta so that it takes the shortest path
      if (delta_theta < -Math.PI) {
        delta_theta += 2.0 * Math.PI;
      } else if (delta_theta > Math.PI) {
        delta_theta -= 2.0 * Math.PI;
      }

      // Add change in theta to previous theta position
      theta = previous_theta + delta_theta;

      // Save theta position as previous for next iteration
      previous_theta = theta;

      // Calculate Rho
      rho = this.calcRho(
        path[i][0],
        path[i][1],
        max_radius
      );

      // Make sure Rho stays in bounds
      if (rho > 1.0) {
        rho = 1.0;
        // continue;
      }

      // Save coordinates to path
      thetaRho.push(theta.toFixed(4) + " " + rho.toFixed(4));
    }

    // Convert to a text string
    return thetaRho.join("\n");
  }

  /**
   * Convert Theta-Rho coordinates into rectangular coordinates
   * thr_path An array of [theta,rho] coordinates
   * width Width of path-drawing area
   * height Height of path-drawing area
   **/
  toRectangular(thr_path, width = 100, height = 100) {

    // Set initial values
    let path = [];

    const max_r = Math.min(width, height) / 2;

    // Convert starting point from Theta-Rho to XY
    for (let point of thr_path) {
      path.push([
        max_r * point[1] * Math.cos(point[0]),
        max_r * point[1] * Math.sin(point[0])
      ]);
    }

    // Rotate the path by a quarter revolution
    path = this.rotatePath(path, Math.PI/2);

    // Flip on the X axis
    path = this.scalePath(path, [-1, 1]);

    return path;
  }

  /**
   * Convert Theta-Rho coordinates into G-code coordinates
   * thr_path An array of [theta,rho] coordinates
   * width Width of path-drawing area
   * height Height of path-drawing area
   **/
  toGcode(thr_path, width = 100, height = 100) {

    // Set initial values
    let path = [];

    const max_r = Math.min(width, height) / 2;

    // Convert starting point from Theta-Rho to XY
    for (let point of thr_path) {
      path.push([
        max_r * point[1] * Math.cos(point[0]),
        max_r * point[1] * Math.sin(point[0])
      ]);
    }

    // Rotate the path by a quarter revolution
    path = this.rotatePath(path, Math.PI/2);

    // Flip on the X axis
    path = this.scalePath(path, [-1, 1]);

    // Translate the path
    path = this.translatePath(path, [width / 2, height / 2]);

    return path;
  }

  /**
   * Scale Path
   * path An array of [x,y] coordinates
   * scale An array of [x,y] scale factors
   **/
  ThrScalePath(path, scale) {
    return path.map(function(a){
      return [
        a[0] * scale[0],
        a[1] * scale[1]
      ];
    });
  }

  /**
   * Rotate points x and y by angle theta about center point (0,0)
   * https://en.wikipedia.org/wiki/Rotation_matrix
   **/
  ThrRotatePath(path, theta) {
    return path.map(function(a){
      return [
        a[0] * Math.cos(theta) - a[1] * Math.sin(theta),
        a[0] * Math.sin(theta) + a[1] * Math.cos(theta)
      ];
    });
  }

  /**
   * Scale a Path with respect to the origin
   * @param {array} path - A Path array.
   * @param {number|number[]} scale - The amount by which to scale
   * the path. A single numeric value can be applied to all dimensions
   * or a value can be provided for each dimension
   * @returns {array} A Path array
   **/
  scalePath(path, scale) {
    let scale_x = scale;
    let scale_y = scale;
    if (scale.length !== undefined) {
      scale_x = scale[0];
      scale_y = scale[1];
    }
    return path.map(function(a){
      let scaled = [
        a[0] * scale_x,
        a[1] * scale_y
      ];
      return scaled;
    });
  }

  /**
   * Translate a path
   * @param {array} path - A Path array
   * @param {number[]} delta - The amount by which to move
   * the path in each dimension
   * @returns {array} A Path array
   **/
  translatePath(path, delta) {
    return path.map(function(a){
      return [
        a[0] + delta[0],
        a[1] + delta[1]
      ];
    });
  }

  /**
   * Rotate Path by angle theta around a center point ([0,0] by default)
   * @param {array} path - A Path array
   * @param {number} theta - The number of radians to
   * rotate the path. Positive rotation is clockwise.
   * @param {array[]} center - A Point array. The point around which to rotate.
   * @returns {array} A Path array
   **/
  rotatePath(path, theta, center = [0,0]) {
    return path.map(function(a){
      return this.rotatePoint(a, theta, center);
    }, this);
  }

  /**
   * Rotate a point around another point
   * Reference: https://danceswithcode.net/engineeringnotes/rotations_in_2d/rotations_in_2d.html
   * @param {array} point - A Point array
   * @param {number} theta - The number of radians to
   * rotate the path. Positive rotation is clockwise.
   * @param {array[]} center - A Point array. The point around which to rotate.
   * @returns {array} A Point array
   **/
  rotatePoint(point, theta, center = [0,0]) {
    return [
      (point[0] - center[0]) * Math.cos(theta) - (point[1] - center[1]) * Math.sin(theta) + center[0],
      (point[0] - center[0]) * Math.sin(theta) + (point[1] - center[1]) * Math.cos(theta) + center[1]
    ];
  }

  /**
   * Subdivide a path
   * path A path array
   * max_segment_length Smaller values create create a more detailed path (mm)
   * Return Array
   **/
  subdividePath(path, max_segment_length) {

    let new_path = [];
    let delta_x, delta_y;

    // Loop through path coordinates
    let i_max = path.length - 1;
    for (let i = 0; i < i_max; i++) {

      // Calculate the distance between the current and next point
      delta_x = path[i+1][0] - path[i][0];
      delta_y = path[i+1][1] - path[i][1];
      let delta_distance = Math.sqrt(
        Math.pow(delta_x, 2) + Math.pow(delta_y, 2)
      );

      // Calculate the number of steps by which to divide the distance
      let num_substeps = Math.ceil(delta_distance/max_segment_length);

      // Add sub-step coordinates for each subdivision
      for (var j = 0; j < num_substeps; j++) {
        new_path.push([
          path[i][0] + delta_x * (j/num_substeps),
          path[i][1] + delta_y * (j/num_substeps)
        ]);
      }

      // Add last step
      if (i+1 == i_max) {
        new_path.push([
          path[i][0] + delta_x,
          path[i][1] + delta_y
        ]);
      }
    }

    // Add last coordinate
    new_path.concat(path.slice(-1));

    return new_path;
  }

  /**
   * Calculate the angle Theta ranging from 0 to two Pi
   * @param {number} x - The X Coordinate
   * @param {number} y - The Y Coordinate
   * Return {number} The polar angle, Theta, between [0,0] and [x,y]
   **/
  calcTheta(x, y) {

    // Calculator theta in a range from +Pi to -Pi
    let theta = Math.atan2(y, x);

    // Convert -pi-to-0 to pi-to-2pi
    if (theta < 0) {
      theta = (2 * Math.PI) + theta;
    }
    return theta;
  }

  /**
   * Calculate the radius Rho and normalize to a value between 0 and 1
   * @param {number} x - The X Coordinate
   * @param {number} y - The Y Coordinate
   * @param {number} max_radius - The maximum radius of the table
   * Return {number} The radius Rho, normalized between 0 and 1
   **/
  calcRho(x, y, max_radius) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / max_radius;
  }

  // Helper methods

  distance(p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
  }

  /**
   * Return the values from a single column in the input array
   **/
  arrayColumn(arr, col){
    return arr.map(a => a[col]);
  }

  /**
   * Return the minimum value from tne inupt array
   **/
  arrayMin(a) {
    return Math.min(...a);
  }

  /**
   * Return the maximum value from tne inupt array
   **/
  arrayMax(a) {
    return Math.max(...a);
  }

  /**
   *
   **/
  getBoundingBoxMin(path) {
    let x_coordinates = this.arrayColumn(path, 0);
    let y_coordinates = this.arrayColumn(path, 1);
    return [
      this.arrayMin(x_coordinates),
      this.arrayMin(y_coordinates),
    ];
  }

  /**
   *
   **/
  getBoundingBoxMax(path) {
    let x_coordinates = this.arrayColumn(path, 0);
    let y_coordinates = this.arrayColumn(path, 1);
    return [
      this.arrayMax(x_coordinates),
      this.arrayMax(y_coordinates),
    ];
  }

  /**
   * Find the Minimum and Maximum values for X and Y
   **/
  boundingBox(path) {
    let mins = this.getBoundingBoxMin(path);
    let maxs = this.getBoundingBoxMax(path);
    return [
      [mins[0], maxs[0]],
      [mins[1], maxs[1]]
    ];
  }
}

module.exports = ThetaRho;