// The function expressions are after these two return statements.
// Try out different functions to see what they do.
var zoom = 10;             // Sets the number of units visible on the window's minor axis. think of it like a zoom.
var gridMark = 1;          // Sets spacing of grid markers, relative to a unit.
var vectorSpacing = 1;     // Designates how dense to make the direction field.

// Click anywhere on the screen to project a curve, using euler's method.
// The positon of the mouse will be treated as t = 0.
var eulersBegin = 0;     // Follow eulers method to get a curve from t = 0 to t = this value. 
var eulersEnd = 1;        // Follow eulers method to get a curve from t = 0 to t = this value. 
var timeInterval = 0.001; // Determines accuracy of euler's method.

//set up connection to index.html, define context variable.
var canvas = document.getElementById('myCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext('2d');

// shorthand for drawing a line on the canvas.
var drawLine = function(fv, tv, color) {
  context.beginPath();
  context.moveTo(fv.x, fv.y);
  context.lineTo(tv.x, tv.y);
  context.strokeStyle = color;
  context.stroke();
};

// basic 2d vector object.
var Vector2 = function(x, y) {
  this.x = x;
  this.y = y;
  this.set = function(x, y) {
    this.x = x;
    this.y = y;
  };
  this.copy = function() {
    return new Vector2(this.x, this.y);
  };
  this.add = function(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  };
  this.mult = function(s) {
    return new Vector2(this.x*s, this.y*s);
  };
  this.mag = function() {
    return (this.x**2 + this.y**2)**0.5;
  };
  this.distance = function(v) {
    return ((this.x - v.x)**2 + (this.y - v.y)**2)**0.5;
  };
  this.normalize = function(s) {
    if (!s) {s = 1;};
    return this.mult(1/this.mag()).mult(s);
  };
  this.transform = function(matrix) {
    return new Vector2(this.x*matrix.a + this.y*matrix.b, this.x*matrix.c + this.y*matrix.d);
  };
  this.size = function() {
    return this.transform(flipVert).mult(unit);
  };
  this.pix = function() {
    return this.size().add(center);
  };
  this.units = function() {
    return this.add(center.mult(-1)).mult(1/unit).transform(flipVert);
  };
  this.draw = function(fv, max) {
    if (!max) {max = vectorSpacing;}
    var sv = this.normalize(3); // used to draw the arrowhead.
    var tv = this.normalize(vectorSpacing*this.mag()/max).size();
    if (fv) {
      fv = fv.pix();
    } else {
      fv = center;
    }
    tv = tv.add(fv);
    drawLine(fv, tv, '#000000');
    drawLine(tv, {'x': tv.x - sv.x + sv.y, 'y': tv.y + sv.x + sv.y}, '#000000');
    drawLine(tv, {'x': tv.x - sv.x - sv.y, 'y': tv.y - sv.x + sv.y}, '#000000');
  };
};

// Draw grid
var origin = new Vector2(0, 0);
var center = new Vector2(canvas.width/2, canvas.height/2);
var vert = function(x, color) {drawLine(new Vector2(x, 0), new Vector2(x, canvas.height), color);};
var horiz = function(y, color) {drawLine(new Vector2(0, y), new Vector2(canvas.width, y), color);};
var getUnit = function(z) {return Math.min(center.x, center.y)/z;};
var unit = getUnit(zoom);
var domain = new Vector2(Math.floor(center.x/unit),
			 Math.floor(center.y/unit));
var drawGrid = function(u, iVar, dVar) {
  if (!iVar) {iVar = '';}
  if (!dVar) {dVar = '';}
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!u) {u = unit;} else {unit = getUnit(u);}
  var c, v;
  for (var i = 0; i < 4; i++){
    c = [center.x, center.y][Math.floor(i/2)];
    v = [vert, horiz][Math.floor(i/2)]; 
    for (var x = gridMark*unit; x < c; x += gridMark*unit) {
      v(c + (-1)**i*x, '#777777');
    }
    v(c, '#000000');
  }
  context.font = '30px TimesNewRoman';
  context.fillText(iVar, canvas.width - 25, center.y - 5);
  context.fillText(dVar, center.x + 5, 25);
};


var drawCurve = function(f, color) {
  var fv = new Vector2(-center.x/unit, f(-center.x/unit)).pix();
  var tv = fv.copy();
  for (var i = 1/unit - center.x/unit;  i < center.x/unit; i += 1/unit) {
    tv.set(i, f(i));
    tv = tv.pix();
    drawLine(fv, tv, color);
    fv = tv.copy();
  }
};


//complex numbers
var C = function(r, i) {
  this.r = r;
  this.i = i;
  this.add = function(other) {
    return new C(this.r + other.r,
		 this.i + other.i);
  };
  this.mul = function(other) {
    return new C(this.r*other.r - this.i*other.i,
		 this.r*other.i + this.i*other.r);
  };
  this.sub = function(other) {
    return new C(this.r - other.r,
		 this.i - other.i);
  };
  this.conjugate = function() {
    return new C(this.r, -this.i);
  };
  this.div = function(other) {
    var numer = this.mul(other.conjugate());
    var denom = other.r**2 + other.i**2;
    return new C(numer.r/denom, numer.i/denom);
  };
};

var c0 = new C(0, 0);
var c1 = new C(1, 0);
var c2 = new C(2, 0);

var cRoot = function(n) {
  if (n < 0) {
    return new C(0, Math.sqrt(-n));
  } else {
    return new C(Math.sqrt(n), 0);
  }
};

var CVector = function(x, y) {
  this.x = x;
  this.y = y;
  this.add = function(v) {
    return new CVector(this.x.add(v.x), this.y.add(v.y));
  };
  this.mult = function(c) {
    return new CVector(this.x.mult(c), this.y.mult(c));
  };
};

var planes = ['ty', 'tx', 'xy'];
var Equation = function(text, plane) {
  if (plane != undefined) {
    this.plane = plane;
  } else {
    this.plane = 0;
  }
  this.text = text;
  this.f = function(x, y, t) {return eval(text);};
  this.add = function(eq) {
    return new Equation(this.text + eq.text);
  };
  this.mult = function(scalar) {
    return new Equation(String(scalar) + '*(' + this.text + ')');
  };
  this.delta = function(x, y, t) {
    return new Vector2(function(x, y, t) {return 1;}, this.f(x, y, t));
  };
  this.draw = function(plane, constant, color) {
    var i, d, fv, tv;
    gAxes = this.plane;
    gSystem = this;
    if (plane) {this.plane = planes.indexOf(plane);}
    drawGrid(zoom, planes[this.plane][0], planes[this.plane][1]);
    if (!color) {color = '#8888ff';}
    if (!constant) {constant = 0;}
    fv = origin.copy();
    tv = origin.copy();
    for (i = -parseInt(domain.x/vectorSpacing)*vectorSpacing; i <= domain.x; i += vectorSpacing) {
      for (d = -parseInt(domain.y/vectorSpacing)*vectorSpacing; d <= domain.y; d += vectorSpacing) {
	fv.set(i, d);
	fv = fv.pix();
	tv.set(1, this.f([constant, d, i][this.plane], [d, constant, d][this.plane], [i, i, constant][this.plane]));
	tv = tv.normalize(vectorSpacing/3).size();
	drawLine(fv.add(tv.mult(-1)), fv.add(tv), color);
      }
    }    
  };
};

var System = function(dx, dy) {
  this.dx = dx;
  this.dy = dy;
  this.delta = function(x, y, t) {
    return new Vector2(dx.f(x, y, t), dy.f(x, y, t));
  };
  this.drawXY = function(constant) {
    gSystem = this;
    gAxes = 2;
    drawGrid(zoom, 'x', 'y');
    var vs = [];
    for (var x = -parseInt(domain.x/vectorSpacing)*vectorSpacing; x <= domain.x; x += vectorSpacing) {
      for (var y = -parseInt(domain.y/vectorSpacing)*vectorSpacing; y <= domain.y; y += vectorSpacing) {
	vs.push([new Vector2(x, y), this.delta(x, y, constant)]);
      }
    }
    var max = Math.max.apply(null, vs.map(function(e) {return e[1].mag();}));
    vs.map(function(e) {e[1].draw(e[0], max);});
  };
};

// Matrix object
var Matrix2 = function(a, b, c, d) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.d = d;
  System.call(this,
	      new Equation('x*' + String(this.a) + ' + y*' + String(this.b)),
	      new Equation('x*' + String(this.c) + ' + y*' + String(this.d)));
  this.trace = function() {return this.a + this.d;};
  this.det = function() {return this.a*this.d - this.b*this.c;};
  this.dis = function() {return this.trace()**2 - 4*this.det();};
  this.td = function() {return new Vector2(this.trace(),
					   this.det()).pix();};
//  this.delta = function(x, y) {return new Vector2(x*this.a + y*this.b, x*this.c + y*this.d);};
  this.set = function(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  };
  // draw discriminate = 0 curve.
  this.drawTD = function(p, q, r, s) {
    drawGrid(zoom, 'T', 'D');
    drawCurve(function(T) {return new Vector2(T, T**2/4).pix();});
    if (!(p || q || r || s)) {
      context.beginPath();
      context.arc(this.td().x, this.td().y, 6, 0, 2*Math.PI);
      context.strokeStyle = '#0000ff';
      context.stroke();
    } else {

    }
  };
  // draws a modified vector field.
  
  this.values = function() {
    var numTrace = new C(this.trace(), 0);
    var discriminant = cRoot(this.trace()**2 - 4*this.det());
    return [numTrace.add(discriminant).div(c2),
	    numTrace.sub(discriminant).div(c2)];
  };
//TODO: eigenvector for (-1, 0, -6, -3) looks wrong?
  this.vectors = function() {
    var ev = this.values();
    var cA = new C(this.a, 0);
    var cB = new C(this.b, 0);
    var getVector = function(val) {
      var xCoeff = c0.sub(cA.sub(val));
      if (xCoeff.r + xCoeff.i == 0) {
	return new CVector(c0, c1);
      } else if (cB.r + cB.i == 0) {
	return new CVector(c1, c0);
      } else {
	return new CVector(c1, xCoeff.div(cB));
      }
    };
    var vecs = [getVector(ev[0]), getVector(ev[1])];
    return [{'value': ev[0], 'vector': vecs[0]},
	    {'value': ev[1], 'vector': vecs[1]}];
  };

  this.info = function() {
    var eigen = this.vectors();
    console.log('trace: ' + this.trace() + '\ndeterminate: ' +  this.det());
    console.log('lambda1: ' + eigen[0].value.r + ' + ' + eigen[0].value.i + 'i\nv1: ('
		+ eigen[0].vector.x.r + ' + ' + eigen[0].vector.x.i + 'i, '
		+ eigen[0].vector.y.r + ' + ' + eigen[0].vector.y.i + 'i)'); 
    console.log('lambda2: ' + eigen[1].value.r + ' + ' + eigen[1].value.i + 'i\nv2: ('
		+ eigen[1].vector.x.r + ' + ' + eigen[1].vector.x.i + 'i, '
		+ eigen[1].vector.y.r + ' + ' + eigen[1].vector.y.i + 'i)');
  };
  
  this.general = function() {
    current = this;
    var cSolve = function(v) {
      if (v.vector.x.i < 0 || v.vector.y.i < 0) {
	v.vector = v.vector.mult(i);
      };
      var e = function(t) {return Math.exp(v.value.r*t);};
      var cos = function(t) {return Math.cos(v.value.i*t);};
      var sin = function(t) {return Math.sin(v.value.i*t);};
      var coeff = function(t) {return new C(cos(t) + sin(t)).mult(e(t));};
      var vOut = function(t) {return v.vector.mult(coeff(t));};
      return function(k1, k2, t) {
	return [new Vector2(vOut.x.r, vOut.y.r).mult(k1),
		new Vector2(vOut.x.i, vOut.y.i).mult(k2)];
      };
    };
    return(cSolve(this.vectors()[0]));
  };
};



var flipVert = new Matrix2(1, 0, 0, -1);
  
// uses euler's method to graph a particular solution to the system.
var eulers = function(init, input, lower, upper, dt, plane, time) { 
  //console.log('Y_' + init.t + ': (' + init.x +', ' +  init.y + ')');
  //if (plane < 2) {drawGrid(zoom, 't', ['y', 'x'][plane]);}
  var delta = origin;
  // plane sets axes to yt, xt, or xy. 
  if (plane == undefined) {plane = 2;}
  var loc, fv, tv;
  var record = {x: init.x, y: init.y, t: 0};
  for (var j = 0; j < 2; j++) {
    loc = {x: init.x, y: init.y, t: init.t};
    fv = new Vector2([loc.t, loc.t, loc.x][plane],
		     [loc.y, loc.x, loc.y,][plane]).pix(); 
    for (var t = init.t; t <= [init.t - lower, init.t + upper][j]; t += dt) {
      delta = input.delta(loc.x, loc.y, loc.t).mult([-dt, dt][j]);
    //  console.log(input, delta);
      loc = {x: loc.x + delta.x,
	     y: loc.y + delta.y,
	     t: loc.t + [-dt, dt][j]};
      tv = new Vector2([[-dt, dt], [-dt, dt], [delta.x, delta.x]][plane][j],
		       [delta.y, delta.x, delta.y][plane]).size().add(fv);
      //console.log(fv, tv);
      drawLine(fv, tv, '#ff0000');
      if (Math.abs(time - t) < Math.abs(record.t - t)) {
	record = {t: t, x: fv.units().x, y: fv.units().y};
      }
      fv = tv;
    }
  }
  console.log(record);
};



var Logistic = function(k, N, P0) {
  Equation.call(this, String(P0) + '*(1 - y/' + String(N) + ')*y', 0);
  this.P0 = P0;
  this.dP = function(P) {return k*P*(1 - P/N);};
  var A = (N - P0)/P0;
  this.P = function(t) {
    return N/(1 + A*Math.exp(-k*t));
  };
  this.duration = function(Pf) {
    return -Math.log((N/Pf - 1)/A)/k;
  };
};

// listen to mouse
var mouse, mUnits;
window.addEventListener('mousemove', function(e) {
  mUnits = new Vector2(e.x, e.y).units();
  mouse = {x: [0, mUnits.y, mUnits.x][gAxes],
	   y: [mUnits.y, 0, mUnits.y][gAxes],
	   t: [mUnits.x, mUnits.x, 0][gAxes]};
});
document.onclick = function(e) {
  eulers(mouse,
	 gSystem,
	 -domain.x,
	 domain.x,
	 timeInterval,
	 gAxes,
	 0);
};

var gSystem = new Matrix2(0, 0, 0, 0);
var gInits = [origin];
var gAxes = 2;


drawGrid();

var a = 2;
p02 = [new System(new Equation('3*Math.sin(x) + y'), new Equation('4*x + Math.cos(y) - 1')),
       new System(new Equation('-3*Math.sin(x) + y'), new Equation('4*x + Math.cos(y) - 1')),
       new System(new Equation('-3*Math.sin(x) + y'), new Equation('4*x + 3*Math.cos(y) - 3'))];

p11 = new System(new Equation('x*(-x - y + 40)'), new Equation('y*(-1*(x*x) - y*y + 2500)'));
p12 = new System(new Equation('x*(-4*x - y + 160)'), new Equation('y*(-1*(x*x) - y*y + 2500)'));

p17 = new System(new Equation('-1*(x*x*x)'), new Equation('-y + y*y'));

p20 = new System(new Equation('y - x*x'), new Equation('y - a'));
