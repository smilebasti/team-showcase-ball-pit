let circles = [];
let bounds = {
  x: 0, // center x of the pit
  y: 0, // center y of the pit
  r: 0, // radius of the pit
  strength: 0.05
};
const taus = Math.PI * 2;
const circlevolume = 6000;

var im = new Image();
var backim = new Image();

function spawnCircle() {
  var newvolume = (circlevolume * circles.length) + circlevolume;
  bounds.r = Math.sqrt(newvolume / Math.PI);
  let c = new CircleBody();

  // Generate a random angle and radius to position the circle outside of the pit
  let angle = Math.random() * Math.PI * 2;
  let radius = bounds.r + c.r + Math.random() * 500; // Add some extra distance to ensure it's outside

  // Calculate the x and y coordinates based on the angle and radius
  c.pos.set(bounds.x + Math.cos(angle) * radius, bounds.y + Math.sin(angle) * radius);

  c.r = 30; //random(15, 20);     //random Circle radius
  //c.applyForce(Vector.random2D()); //intizial push
  circles.push(c);  // don't know
}

function setup() {
  // Spawn a circle every 3 seconds
  setInterval(spawnCircle, 1500);
}

backim.src = "test.jpg";
backim.addEventListener('load', function (e) {
  draw();
}, true);

function draw() {
  //draws pit
  ctx.save();
  ctx.beginPath();
  ctx.arc(bounds.x, bounds.y, bounds.r, 0, taus);
  ctx.clip();
  ctx.drawImage(backim, bounds.x - bounds.r, bounds.y - bounds.r, bounds.r * 2, bounds.r * 2);
  ctx.restore();

  if (circles.length === 0) {
    return;
  }

  circles.forEach(c => {
    c.draw();  //draws the circle
    c.calcUpdate();
  });

  //ctx.fill();
  circles.forEach(c => {
    c.update();
  });
}

im.src = "./test.jpg";
im.addEventListener('load', function (e) {
  draw();
}, true);



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
    this.r = 60; // Initial radius
    this.initialRadius = 70; // Store the initial radius
    this.targetRadius = 30; // Target radius
    this.spawnTime = Date.now(); // Store the time when the circle was spawned
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
        diff.setMag(abs(c.r - r - d)).limit(0.2);
        c.applyForce(diff);
        this.applyForce(diff.rotate(PI));
      }
    });
  }

  update() {
    let { pos, vel, acc, r } = this;
    let distanceFromCenter = Math.hypot(pos.x - bounds.x, pos.y - bounds.y);
    if (distanceFromCenter + r > bounds.r) {
      let angle = atan2(pos.y - bounds.y, pos.x - bounds.x);
      let forceX = cos(angle) * -bounds.strength;
      let forceY = sin(angle) * -bounds.strength;
      this.applyForce(forceX, forceY);
    }
    vel.add(acc).mult(0.98);
    acc.set(0, 0);
    pos.add(vel);

    // Update the radius over time
    let timeElapsed = Date.now() - this.spawnTime;
    if (timeElapsed < 3000) { // 1 second
      this.r = this.initialRadius - (this.initialRadius - this.targetRadius) * (timeElapsed / 3000);
    } else {
      this.r = this.targetRadius;
    }
  }

  draw() {
    let { x, y } = this.pos;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, this.r, 0, taus); // you can use any shape

    ctx.clip();
    ctx.drawImage(this.img, x - this.r, y - this.r, this.r * 2, this.r * 2);
    ctx.restore();
  }
}