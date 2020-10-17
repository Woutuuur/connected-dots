let points = [];
let speedModifier = 0.2;
let amountOfDots = 0;
let maxLineLength = 100;
let gradient = [];
let lineWidth = 1;
const maxSafeLineDist = 250;

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
  var x = document.getElementById("input-fields");
  var y = document.getElementById("options");
  if (x.style.display == "none")
  {
    x.style.display = "inline-block";
    y.style.background = "rgba(255,255,255,0.1)";
  }
  else
  {
    x.style.display = "none";
    
    y.style.background = "none";
  }
}

function setup()
{
  points = [];
  var offsetHeight = document.getElementById('options').clientHeight;
  setNewGradient();
  var cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('sketch-holder');
  spawnDots();
  cnv.mousePressed(mouseDot);
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
  background(0);
  textSize(10);
  for (let i = 0; i < points.length; i++)
  {
    fill(255);
    strokeWeight(1);
    points[i].move();
    for (let j = 0; j < points.length; j++)
    {
      if (i != j)
      {
        let maxLength = max(abs(points[i].x - points[j].x), abs(points[i].y - points[j].y));
        if (maxLength < maxLineLength)
        {
          let rgb = gradient[Math.floor(Math.abs(min(points[i].x, points[j].x)) / windowWidth * (gradient.length - 1))];
          let intensity = (maxLineLength - maxLength) / maxLineLength;
          stroke(rgb[0], rgb[1], rgb[2], intensity * 255);
          strokeWeight(lineWidth);
          line(points[i].x, points[i].y, points[j].x, points[j].y);
          stroke(255);
        }
      }
    }

  }
  for (let i = 0; i < points.length; i++)
    points[i].display();
  text("Amount of dots: " + points.length, 5, windowHeight - 5);
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
    points.push(new Dot(random(0, windowWidth), random(0, windowHeight)));
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
    this.speed = this.size * 3;
    this.direction = [random(0,360), random(0,360)];
  }

  move()
  {
    if (this.x <= 0 || this.x >= windowWidth)
    {
      this.direction[0] = this.direction[0] + cos(180);
    }
    if (this.y >= windowHeight || this.y <= 0)
    {
      this.direction[1] = this.direction[1] + sin(180);
    }
    this.x += this.speed * cos(this.direction[0]) * speedModifier; //* dt;
    this.y += this.speed * sin(this.direction[1]) * speedModifier; //* dt;
  }

  display()
  {
    circle(this.x, this.y, this.size);
  }

}
