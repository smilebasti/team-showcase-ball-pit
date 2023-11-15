let circles = [];
let bounds = {
  t: -200,
  r: 200,
  b: 200,
  l: -200,
  strength: 0.1 };

bounds.w = abs(bounds.l - bounds.r);
bounds.h = abs(bounds.t - bounds.b);


// On Loading first Balls start in Center with some force
function setup() {
  for (let i = 0; i < 5; i++) {
    let c = new CircleBody();
    c.pos.set(Vector.random2D(true, 50));  // random starting position 250 away from center
    c.r = 25; //random(15, 20);     //random Circle radius
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
  //c.r = random(15, 20);
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
  stroke('hsl(0, 0%, 100%)');
  rect(bounds.l, bounds.t, bounds.w, bounds.h);

  if (circles.length === 0) {
    return;
  }

  circles.sort((a, b) => a.color - b.color);

  ctx.beginPath();
  let currentColor = circles[0].color;
  fill(`hsl(${currentColor}, 100%, 50%)`);
  circles.forEach(c => {
    if (c.color !== currentColor) {
      ctx.fill();
      ctx.beginPath();
      currentColor = c.color;
      fill(`hsl(${currentColor}, 100%, 50%)`);
    }
    c.draw();
    c.calcUpdate();
  });
  ctx.fill();
  circles.forEach(c => {
    c.update();
  });
}

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
    circle(x, y, this.r, false);
  }}