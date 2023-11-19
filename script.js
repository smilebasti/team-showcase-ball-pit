let circles = [];
let bounds = {
  t: -200,
  r: 200,
  b: 200,
  l: -200,
  strength: 0.1
};
const taus = Math.PI * 2;

bounds.w = abs(bounds.l - bounds.r);
bounds.h = abs(bounds.t - bounds.b);

var im = new Image();

// On Loading first Balls start in Center with some force
function setup() {
  for (let i = 0; i < 5; i++) {
    let c = new CircleBody();
    c.pos.set(Vector.random2D(true, 50));  // random starting position 250 away from center
    c.r = 30; //random(15, 20);     //random Circle radius
    //c.applyForce(Vector.random2D()); //intizial push
    circles.push(c);  // don't know
  }
}

// create new circle when left mouse clicked
window.addEventListener('click', ({ x, y }) => {
  if (circles.length >= 500) {  // more than 500 breaks
    return;
  }
  let c = new CircleBody();
  c.r = 30; //random(15, 20);
  c.pos.set(x - width_half, y - height_half);
  circles.push(c);
});

// delete circle when hovered over circle and right mouse clicked on it
window.addEventListener('contextmenu', e => {
  e.preventDefault();
  let { x, y } = e;
  let mouse = createVector(x, y).sub(width_half, height_half);
  let ci = circles.findIndex(({ pos, r }) => mouse.dist(pos) < r);
  if (ci !== -1) {
    circles.splice(ci, 1);
  }
});

function draw() {
  //draws box
  ctx.strokeStyle= 'hsl(0, 0%, 100%)';
  ctx.beginPath();
  ctx.rect(bounds.l, bounds.t, bounds.w, bounds.h);
  ctx.stroke();
  

  if (circles.length === 0) {
    return;
  }

  ctx.beginPath();
  circles.forEach(c => {

    /*ctx.fill();
    ctx.beginPath();
    currentColor = c.color;
    ctx.fillStyle = `hsl(${currentColor}, 100%, 50%)`; // uses the set color to fill the circle
    */
    
    c.draw();  //draws the circle
    
    
    im.addEventListener('load', function (e) {
      ctx.beginPath();
      ctx.fillStyle = ctx.createPattern(this, 'repeat'); //no-
      ctx.fill(); //${currentColor
      //ctx.drawImage(this, c.pos.x, c.pos.y);
      //ctx.closePath();
    }, true);
    im.src = "./Face-smile.png";
    
    
    c.calcUpdate();
  });
  ctx.fill();
  circles.forEach(c => {
    c.update();
  });
}

// Circle creation attribute values
class CircleBody {
  constructor() {
    let pos = createVector();
    let vel = createVector();
    let acc = createVector();
    Object.assign(this, { pos, vel, acc });
    this._pos = pos.copy();
    this._vel = vel.copy();
    this._acc = acc.copy();
    this.r = 20;
    this.color = floor(random(0, 12)) * 30; // sets color rgb 0-360
    this.img = im;
  }
  applyForce(...force) {
    this.acc.add(...force);
  }
  calcUpdate() {
    let { pos, vel, acc, r } = this;
    this._pos = pos.copy();
    this._vel = vel.copy();
    this._acc = acc.copy();
    circles.forEach(c => {
      if (c === this) {
        return;
      }
      let diff = c._pos.copy().sub(pos);
      let d = diff.mag();
      if (d < c.r + r) {
        diff.setMag(abs(c.r - r - d)).limit(0.4);
        c.applyForce(diff);
        this.applyForce(diff.rotate(PI));
      }
    });
  }
  update() {
    let { pos, vel, acc, r } = this;
    if (pos.x - r < bounds.l) {
      this.applyForce(bounds.strength, 0);
    } else
      if (pos.x + r > bounds.r) {
        this.applyForce(-bounds.strength, 0);
      }
    if (pos.y - r < bounds.t) {
      this.applyForce(0, bounds.strength);
    } else
      if (pos.y + r > bounds.b) {
        this.applyForce(0, -bounds.strength);
      }
    vel.add(acc).mult(0.98);
    acc.set(0, 0);
    pos.add(vel);
  }
  draw() {
    let { x, y } = this.pos;
    ctx.moveTo(x + this.r, y);
    ctx.arc(x, y, this.r, 0, taus);
    
    
  }
}