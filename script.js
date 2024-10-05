// colors
const light = [
  "#ECE4B7",
  "#F1FFFA",
  "#FDFFFF",
  "#FFD23F",
  "#262626",
  "#E7E247",
  "#2E4057",
  "#FAFF81",
  "#C5EFCB",
  "#EAF2EF",
];
const dark1 = [
  "#364652",
  "#6461A0",
  "#570000",
  "#540D6E",
  "#D2E4C4",
  "#3D3B30",
  "#F6D8AE",
  "#161032",
  "#020402",
  "#912F56",
];
let randomColorNum;
let padding = 125;

// Custom message and target date
let customMessage = "Time elapsed since 2pm February 7th 2019";
let customTargetDate = new Date(2019, 1, 7, 14, 0, 0);

// Function to get options from chrome.storage
function getOptions(callback) {
  chrome.storage.sync.get(
    {
      message: "Time elapsed since 2pm February 7th 2019",
      targetDate: "2019-02-07 14:00:00",
    },
    function (items) {
      callback(items.message, new Date(items.targetDate));
    }
  );
}

// Call getOptions at the start of your script
getOptions(function (message, targetDate) {
  console.log("Custom message:", message);
  console.log("Target date:", targetDate);

  // Update global variables
  customMessage = message;
  customTargetDate = targetDate;

  // Initial generation of art and time update
  generateArt();
  updateTimeElapsed();
});

function setup() {
  pixelDensity(5);
  createCanvas(windowWidth, windowHeight);
  noLoop();
  generateArt();
}

function draw() {
  // This function is intentionally left empty as we're using noLoop()
}

function generateArt() {
  randomColorNum = floor(random(light.length));
  background(light[randomColorNum]);
  stroke(dark1[randomColorNum]);
  fill(dark1[randomColorNum]);
  document.getElementById("time-elapsed").style.color = dark1[randomColorNum];

  shiningObject();
  underGround(padding);
  grassFlower(padding);
  borderMargin(padding);
  generateTree();

  // Update time elapsed
  updateTimeElapsed();
}

function updateTimeElapsed() {
  const now = new Date();
  const difference = now - customTargetDate;
  const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor(
    (difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
  );
  const days = Math.floor(
    (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
  );
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  const timeElapsed = `${years} years, ${months} months, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  document.getElementById("time-value").textContent = timeElapsed;
  document.getElementById("message").textContent = customMessage;
}

function shiningObject() {
  push();

  // setup
  const sunBeamWith = random(0.15, 0.45);
  translate(
    random(width / 5, width - width / 5),
    random(height / 10, height - height / 1.75)
  );
  const moonOrSun = random();

  // moon or sun
  if (moonOrSun > 0.5) {
    // first part of the sun
    fill(0, 0, 0, 0);
    strokeWeight(sunBeamWith / 3);
    let sunFirstPart = random(75, 100);
    let numLines1 = random(350, 450);
    for (let i = 0; i < numLines1; i++) {
      let angle = (i * TWO_PI) / numLines1;
      let offsetEnd = random(25, 45);
      let x = (sunFirstPart + offsetEnd) * cos(angle);
      let y = (sunFirstPart + offsetEnd) * sin(angle);
      handDrawnLine(0, 0, x, y, 0.1);
    }

    // second part of the sun
    fill(light[randomColorNum]);
    strokeWeight(0);
    circle(0, 0, sunFirstPart * 2.2);
    fill(0, 0, 0, 0);
    strokeWeight(sunBeamWith / 2);
    let numLines2 = random(350, 450);
    for (let i = 0; i < numLines2; i++) {
      let angle = (i * TWO_PI) / numLines2;
      let offsetEnd = random(10, 25);
      let x = (sunFirstPart + offsetEnd) * cos(angle);
      let y = (sunFirstPart + offsetEnd) * sin(angle);
      handDrawnLine(0, 0, x, y, 0.1);
    }

    // third part of the sun
    fill(light[randomColorNum]);
    strokeWeight(0);
    circle(0, 0, sunFirstPart * 1.5);
    fill(0, 0, 0, 0);
    strokeWeight(sunBeamWith);
    let numLines3 = random(250, 350);
    for (let i = 0; i < numLines3; i++) {
      let angle = (i * TWO_PI) / numLines3;
      let offsetEnd = random(10, 25);
      let x = (sunFirstPart / 1.5 + offsetEnd) * cos(angle);
      let y = (sunFirstPart / 1.5 + offsetEnd) * sin(angle);
      handDrawnLine(0, 0, x, y, 0.1);
    }

    // final
    fill(light[randomColorNum]);
    strokeWeight(sunBeamWith * 1.5);
    circle(0, 0, sunFirstPart / 1.5);
  } else {
    // setup
    strokeWeight(0);
    let moonWidth = random(10, 12);
    let moonSizee = random(50, 100);

    push();
    fill(dark1[randomColorNum]);
    rotate(-PI / 2);
    arc(0, 0, moonSizee, moonSizee, 0, PI * 4);
    fill(light[randomColorNum]);
    arc(moonWidth, moonWidth, moonSizee, moonSizee, 0, PI * 4);
    pop();
  }

  pop();
}

function twistedVertex(_sx, _sy, _ex, _ey, _t) {
  const dLen = dist(_sx, _sy, _ex, _ey) * _t;
  const secL = random(0.2, 0.4);
  const trdL = secL * 2.0;
  vertex(_sx, _sy);
  bezierVertex(
    lerp(_sx, _ex, secL) + random(-1.0, 1.0) * dLen,
    lerp(_sy, _ey, secL) + random(-1.0, 1.0) * dLen,
    lerp(_sx, _ex, trdL) + random(-1.0, 1.0) * dLen,
    lerp(_sy, _ey, trdL) + random(-1.0, 1.0) * dLen,
    _ex,
    _ey
  );
}

function handDrawnLine(x1, y1, x2, y2, t) {
  beginShape();
  twistedVertex(x1, y1, x2, y2, t);
  endShape();
}

function handDrawnFlower(x1, y1, x2, y2, t) {
  beginShape();
  twistedVertex(x1, y1, x2, y2, t);
  endShape();

  push();
  fill(dark1[randomColorNum]);
  circle(x2, y2, random(3, 5));
  pop();
}

function branch(depth) {
  strokeWeight(5);

  if (depth < 12) {
    handDrawnLine(0, 0, 0, -height / 12, random(0.05, 0.1));
    translate(0, -height / 12);
    rotate(random(-0.05, 0.05));

    if (random() < 0.65) {
      rotate(0.3);
      scale(0.8);

      push();
      branch(depth + 1);
      pop();

      rotate(-0.6);

      push();
      branch(depth + 1);
      pop();
    } else {
      branch(depth);
    }
  }
}

function underGround(ground) {
  push();
  translate(0, -ground);
  fill(0, 0, 0, 0);
  strokeWeight(1.25);
  for (let x = 0; x < width; x += random(3, 5)) {
    handDrawnLine(x, height - random(5, 15) - height / 100, x, height, 0.1);
    handDrawnLine(
      x,
      height - random(5, 15) - height / 25,
      x,
      height - random(5, 15) - height / 100,
      0.1
    );
    handDrawnLine(
      x,
      height - random(5, 15) - height / 15,
      x,
      height - random(5, 15) - height / 25,
      0.1
    );
    handDrawnLine(
      x,
      height - height / 10,
      x,
      height - random(5, 15) - height / 15,
      0.1
    );
  }
  pop();
}

function grassFlower(ground) {
  push();
  translate(0, -ground);
  fill(0, 0, 0, 0);

  strokeWeight(0.5);
  for (let x = 0; x < width; x += random(1.5)) {
    handDrawnLine(
      x,
      height - height / 10,
      x + random(-5, 5),
      height - height / 8 - noise(x / 5) * 60 + 30,
      0.1
    );
  }

  strokeWeight(1);
  for (let x = 0; x < width; x += random(150)) {
    handDrawnFlower(
      x,
      height - height / 10,
      x + random(-15, 15),
      height - height / 5 - noise(x) * 70 + 50,
      random(0.15, 0.2)
    );
  }

  pop();
}

function borderMargin(pad) {
  noFill();
  stroke(light[randomColorNum]);
  strokeWeight(pad);
  rect(pad / 2, pad / 2, width - pad, height - pad);

  const borderMargin = random(5, 25);
  stroke(dark1[randomColorNum]);
  strokeWeight(1);
  handDrawnLine(
    pad - borderMargin,
    pad,
    width - pad + borderMargin,
    pad,
    0.001
  );
  handDrawnLine(
    pad - borderMargin,
    height - pad,
    width - pad + borderMargin,
    height - pad,
    0.001
  );
  handDrawnLine(
    pad,
    pad - borderMargin,
    pad,
    height - pad + borderMargin,
    0.01
  );
  handDrawnLine(
    width - pad,
    pad - borderMargin,
    width - pad,
    height - pad + borderMargin,
    0.001
  );
}

function generateTree() {
  push();
  fill(0, 0, 0, 0);
  translate(width / 2, height - height / 10 - padding);
  branch(random(0, 10));
  pop();
}

function mouseClicked() {
  generateArt();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateArt();
}

// Update time every second
setInterval(updateTimeElapsed, 1000);
