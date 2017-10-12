// The function expressions are after these two return statements.
// Try out different functions to see what they do.
var deltaX = function(x, y) {return 2*x - 1.2*x*y;};
var deltaY = function(x, y) {return 0.9*x*y - y;};

var unit = 10;             // Sets the number of units visible on the window's minor axis. think of it like a zoom.
var vectorSpacing = 1;   // Designates how dense to make the direction field.
var vectorLength = 1;      // Set this to zero to view vector field.

// Click anywhere on the screen to project a curve, using euler's method.
// The positon of the mouse will determine be treated as t = 0.
// The curve will appear red when t is negative, green at t = 0, and blue when t is positive.
var eulersBegin = -10;     // Follow eulers method to get a curve from t = 0 to t = this value. 
var eulersEnd = 10;      // Follow eulers method to get a curve from t = 0 to t = this value. 
var timeInterval = 0.0002;


// everything below this line is not intended to be changed.

var canvas = document.getElementById('myCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext('2d');

var line = function(fx, fy, tx, ty, color) {
  context.beginPath();
  context.moveTo(fx, fy);
  context.lineTo(tx, ty);
  context.strokeStyle = color;
  context.stroke();
};

// Draw grid
var midX = canvas.width/2;
var midY = canvas.height/2;
var vert = function(x, color) {
  line(x, 0, x, canvas.height, color);
}
var horiz = function(y, color) {
  line(0, y, canvas.width, y, color);
}
var getUnit = function(n) {
  return parseInt(Math.min(canvas.width, canvas.height)/(2*n));
}
unit = getUnit(unit);
for (var x = unit; x < midX; x += unit) {
  vert(midX + x, '#777777');
  vert(midX - x, '#777777');
}
for (var y = unit; y < midY; y += unit) {
  horiz(midY + y, '#777777');
  horiz(midY - y, '#777777');
}
vert(midX, '#000000');
horiz(midY, '#000000');

var normalize = function(fx, fy, tx, ty, u) {
  var dx = tx - fx;
  var dy = ty - fy;
  var mag = Math.sqrt(dx**2 + dy**2);
  return [u*dx/mag, u*dy/mag];
};

var vector = function(fx, fy, tx, ty, norm) {
  var fx = fx*unit + midX;
  var fy = -fy*unit + midY;
  tx = tx*unit + fx;
  ty = -ty*unit + fy;
  if (norm) {
    u = normalize(fx, fy, tx, ty, norm*unit);
    tx = u[0] + fx;
    ty = u[1] + fy;
  }
  return [fx, fy, tx, ty];
};

var arrow = function(fx, fy, tx, ty, norm){
  v = vector(fx, fy, tx, ty, norm);
  var s = normalize(v[0], v[1], v[2], v[3], 3); 
  line(v[0], v[1], v[2], v[3], '#000000');
  line(v[2], v[3], v[2] - s[0] - s[1], v[3] + s[0] - s[1], '#000000');
  line(v[2], v[3], v[2] - s[0] + s[1], v[3] - s[0] - s[1], '#000000');
};

var deltaX, deltaY;

var field = function(dx, dy, domain, interval, norm) {
  for (var x = 0; x <= Math.min(midX, domain); x += interval) {
    for (var y = 0; y <= Math.min(midY, domain); y += interval) {
      arrow(x, y, dx(x, y), dy(x, y), norm);
      arrow(x, -y, dx(x, -y), dy(x, -y), norm);
      arrow(-x, y, dx(-x, y), dy(-x, y), norm);
      arrow(-x, -y, dx(-x, -y), dy(-x, -y), norm);
    }
  }
};


var eulers = function(mouseX, mouseY, lower, upper, deltaT) {
  var x = (mouseX - midX)/unit;
  var y = -(mouseY - midY)/unit;
  console.log(x, y);
  var dx, dy, v;
  for (t = 0; t >= lower; t -= deltaT) {
    dx = -deltaX(x, y);
    dy = -deltaY(x, y);
    v = vector(x, y, dx, dy, deltaT);
    line(v[0], v[1], v[2], v[3],
	 'rgb(' + String(parseInt(255*t/lower)) + ', ' + String(255 - parseInt(255*t/lower)) + ', 0)');
    x = (v[2] - midX)/unit;
    y = -(v[3] - midY)/unit;
  }
  x = (mouseX - midX)/unit;
  y = -(mouseY - midY)/unit;
  for (var t = 0; t <= upper; t += deltaT) {
    dx = deltaX(x, y)*deltaT;
    dy = deltaY(x, y)*deltaT;
    v = vector(x, y, dx, dy);
    line(v[0], v[1], v[2], v[3],
	 'rgb(0, ' + String(255 - parseInt(255*t/upper)) + ', ' + String(parseInt(255*t/upper)));
    x = (v[2] - midX)/unit;
    y = -(v[3] - midY)/unit;
  }
};

field(deltaX, 
      deltaY,
      23, vectorSpacing, vectorLength);

// listen to mouse
var mouse = {x: undefined, y: undefined};
window.addEventListener('mousemove', function(e) {
  mouse.x = e.x;
  mouse.y = e.y;
});
document.onclick = function(e) {
  eulers(mouse.x, mouse.y, eulersBegin, eulersEnd, timeInterval);
};
