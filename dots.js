let points = [];
let speedModifier = 0.2;
let amountOfDots = 0;
let maxLineLength = 100;
let gradient = [];
let lineWidth = 2;
const maxSafeLineDist = 250;
let pg;
let dt;
let fr = 30;
var innerScreenWidth = 1080;
var innerScreenHeight = 720;
var marginTopBottom;
var marginLeftRight;
var innerScreenEnabled = false;
var optionsOpen = true;
var paused = false;

function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) { 
        factor = 0.5; 
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
}

function interpolateColors(color1, color2, steps) {
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for(var i = 0; i < steps; i++) {
        interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
    }

    return interpolatedColorArray;
}

function showInfo()
{
  let x = document.getElementById("input-fields");
  let y = document.getElementById("options");
  let z = document.getElementById("closeButton");
  if (!optionsOpen)
  {
    optionsOpen = true;
    x.style.display = "inline-block";
    y.style.background = "rgba(255,255,255,0.1)";
    z.innerHTML = "x";
  }
  else
  {
    optionsOpen = false;
    x.style.display = "none";
    y.style.background = "none";
    z.innerHTML = "O";
  }
}

function setup()
{
  points = [];
  var offsetHeight = document.getElementById('options').clientHeight;
  setNewGradient();
  pg = createGraphics(windowWidth, windowHeight);
  var cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('sketch-holder');
  cnv.mousePressed(mouseDot);
  frameRate(fr);
  innerScreenWidth = windowWidth * 0.8;
  innerScreenHeight = windowHeight * 0.8;
  marginTopBottom = (windowHeight - innerScreenHeight) / 2;
  marginLeftRight = (windowWidth - innerScreenWidth) / 2;
  spawnDots();
}

function hexToRgb(hex)
{
  var arrBuff = new ArrayBuffer(4);
  var vw = new DataView(arrBuff);
  vw.setUint32(0,parseInt(hex, 16),false);
  var arrByte = new Uint8Array(arrBuff);

  return arrByte[1] + "," + arrByte[2] + "," + arrByte[3];
}

function windowResized()
{
  setup();
}

function draw()
{
  pg.background(0);
  textSize(10);
  fill(255);
  if (!paused) 
  {
    for (let i = 0; i < points.length; i++)
    {
      pg.strokeWeight(1);
      points[i].move();
      for (let j = 0; j < points.length; j++)
      {
        if (i != j)
        {
          let maxLength = max(abs(points[i].x - points[j].x), abs(points[i].y - points[j].y));
          if (maxLength < maxLineLength)
          {
            let rgb = gradient[Math.floor(Math.abs(Math.min(points[i].x, points[j].x)) / windowWidth * (gradient.length - 1))];
            let intensity = (maxLineLength - maxLength) / maxLineLength;
            pg.stroke(rgb[0], rgb[1], rgb[2], intensity * 255);
            pg.strokeWeight(lineWidth);
            pg.line(points[i].x, points[i].y, points[j].x, points[j].y);
            pg.stroke(255);
          }
        }
      }
    }
    for (let i = 0; i < points.length; i++)
      points[i].display();
  }
  image(pg, 0, 0);
  stroke(255);
  if (optionsOpen)
    text("Amount of dots: " + points.length, 5, windowHeight - 5);
  if (innerScreenEnabled)
    rect(marginLeftRight + 5, marginTopBottom + 5, innerScreenWidth - 10, innerScreenHeight - 10);
    
}

function keyPressed() 
{
  if (key == "o")
  {
    showInfo();
  }
}

function mouseDot()
{
  let mouseDot = new Dot();
  mouseDot.x = mouseX;
  mouseDot.y = mouseY;
  points.push(mouseDot);
}

function setNewGradient()
{
  let color1 = [];
  let color2 = [];
  let r1 = document.getElementById("color1.r").value;
  let g1 = document.getElementById("color1.g").value;
  let b1 = document.getElementById("color1.b").value;
  let r2 = document.getElementById("color2.r").value;
  let g2 = document.getElementById("color2.g").value;
  let b2 = document.getElementById("color2.b").value;
  
  let arr = [r1,g1,b1,r2,g2,b2];
  for (let i = 0; i < arr.length; i++)
  {
    if (arr[i] > 255)
    {
      arr[i] = 255;
    }
    if (arr[i] < 0 || arr[i] == null)
    {
      arr[i] = 0;
    }
  }
  gradient = interpolateColors("rgb(" + arr[0] + "," + arr[1] + "," + arr[2] + ")", "rgb(" + arr[3] + "," +arr[4] + "," + arr[5] + ")", 20);
}

function removeAllDots()
{
  points = [];
}

function applyInnerScreen() {
  let checkbox = document.getElementById("innerScreenEnabled");
  innerScreenEnabled = checkbox.checked;
  innerScreenWidth = int(document.getElementById("innerScreenWidth").value);
  innerScreenHeight = int(document.getElementById("innerScreenHeight").value);
  setup();
}

function setMaxLineDist()
{
  maxLineLength = min(document.getElementById("maxDist").value, maxSafeLineDist);
  document.getElementById("maxDist").value = maxLineLength;
}

function spawnDots()
{
  removeAllDots();
  let amount = document.getElementById("addDots").value;
  amount = min(amount, 1000);
  document.getElementById("addDots").value = amount;
  for (let i = 0; i < amount; i++)
  {
    if (innerScreenEnabled)
    {
      let rand = int(random(0,4));
      switch (rand)
      {
        case 0:
          points.push(new Dot(random(0, marginLeftRight), random(0, windowHeight)));
          break;
        case 1:
          points.push(new Dot(random(0, windowWidth), random(0, marginTopBottom)));
          break;
        case 2:
          points.push(new Dot(random(innerScreenWidth + marginLeftRight, windowWidth), random(0, windowHeight)));
          break;
        case 3:
          points.push(new Dot(random(0, windowWidth), random(innerScreenHeight + marginTopBottom, windowHeight)));
          break;
      }
    } 
    else
    {
      points.push(new Dot(random(0, windowWidth), random(0, windowHeight)));
    }
  }
}

class Color
{
  constructor(r, g, b)
  {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  getString()
  {
    return('#' + this.r + this.g + this.b);
  }
}

class Dot
{
  constructor(x, y)
  {
    this.size = random(1,2.5);
    this.x = x; //random(0, windowWidth);
    this.y = y; //random(0, windowHeight);
    this.speed = this.size * 0.03;
    this.direction = [random(-3, 3), random(-3, 3)];
  }

  move()
  {
    if (innerScreenEnabled)
    {
      if (this.x <= 0 || this.x >= windowWidth || (((this.x >= marginLeftRight && this.x < marginLeftRight + 10) || (this.x <= marginLeftRight + innerScreenWidth && this.x > marginLeftRight + innerScreenWidth - 10)) && this.y > marginTopBottom && this.y < marginTopBottom + innerScreenHeight))
        this.direction[0] = -this.direction[0];
      if (this.y >= windowHeight || this.y <= 0 || (((this.y >= marginTopBottom && this.y < marginTopBottom + 10) || (this.y <= marginTopBottom + innerScreenHeight && this.y > marginTopBottom + innerScreenHeight - 10)) && this.x > marginLeftRight && this.x < marginLeftRight + innerScreenWidth))
        this.direction[1] = -this.direction[1];
    }
    else 
    {
      if (this.x <= 0 || this.x >= windowWidth)
        this.direction[0] = -this.direction[0];
      if (this.y >= windowHeight || this.y <= 0)
        this.direction[1] = -this.direction[1];
    }
    this.x += this.speed * this.direction[0] * speedModifier * deltaTime;
    this.y += this.speed * this.direction[1] * speedModifier * deltaTime;
  }

  display()
  {
    pg.circle(this.x, this.y, this.size);
  }

}
