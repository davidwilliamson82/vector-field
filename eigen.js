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
var i = new C(0, 1);
var zero = new C(0, 0);
var one = new C(1, 0);
var two = new C(2, 0);

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
  this.mul = function(c) {
    return new CVector(this.x.mul(c), this.y.mul(c));
  };
};

var eigenValues = function(matrix) {
  draw(matrix);
  var numTrace = new C(matrix.trace(), 0);
  var discriminant = cRoot(matrix.trace()**2 - 4*matrix.det());
  return [numTrace.add(discriminant).div(two),
	  numTrace.sub(discriminant).div(two)];
};


var eigenVectors = function(matrix) {
  var ev = eigenValues(matrix);
  var aC = new C(matrix.a, 0);
  var bC = new C(matrix.b, 0);
  var getVector = function(val) {
    var xCoeff = zero.sub(aC.sub(val));
    if (xCoeff.r + xCoeff.i == 0) {
      return new CVector(zero, one);
    } else if (bC.r + bC.i == 0) {
      return new CVector(one, zero);
    } else {
      return new CVector(one, xCoeff.div(bC));
    }
  };
  var vecs = [getVector(ev[0]), getVector(ev[1])];
  console.log('lambda1: ' + ev[0].r + ' + ' + ev[0].i + 'i\nv1: ('
	      + vecs[0].x.r + ' + ' + vecs[0].x.i + 'i, '
	      + vecs[0].y.r + ' + ' + vecs[0].y.i + 'i)'); 
  console.log('lambda2: ' + ev[1].r + ' + ' + ev[1].i + 'i\nv2: ('
	      + vecs[1].x.r + ' + ' + vecs[1].x.i + 'i, '
	      + vecs[1].y.r + ' + ' + vecs[1].y.i + 'i)');
  
  return [{'value': ev[0], 'vector': vecs[0]},
	  {'value': ev[1], 'vector': vecs[1]}];
};

var eigen = function(matrix) {
  currentMatrix = matrix;
  var v = eigenVectors(currentMatrix)[0];
  var value = v.value;
  var vector = v.vector;
  if (vector.x.i < 0 || vector.y.i < 0) {
    vector = vector.mul(i);
  };
  var e = function(t) {return Math.exp(value.r*t);};
  var cos = function(t) {return Math.cos(value.i*t);};
  var sin = function(t) {return Math.sin(value.i*t);};
  return function(k1, k2, t) {
    return [e(t)*(k1*(cos(t)*vector.x.r - sin(t)*vector.x.i) + k2*(cos(t)*vector.x.i + sin(t)*vector.x.r)),
	    e(t)*(k1*(cos(t)*vector.y.r - sin(t)*vector.y.i) + k2*(cos(t)*vector.y.i + sin(t)*vector.y.r))];
  };
};

/*
var cToR = function(complex) {
  return new C(Math.exp(complex.r)*Math.cos(complex.i),
	       Math.exp(complex.r)*Math.sin(complex.i));
};

/*
this.mul = function(other) {
    return new C(this.r*other.r - this.i*other.i,
		 this.r*other.i + this.i*other.r);
  };
*/
