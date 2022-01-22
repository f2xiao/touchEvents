// sets up all the event listeners for <canvas> element so we can handle the touch events as they occur
function startup() {
  var el = document.getElementById("canvas");
  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchmove", handleMove, false);
}

document.addEventListener("DOMContentLoaded", startup);

// Tracking new touches
var ongoingTouches = [];

// When a touchstart event occurs, indicating that a new touch on the surface has occurred, the handleStart() function below is called.
function handleStart(evt) {
  // keep the browser from continuing to process the touch event (this also prevents a mouse event from also being delivered)
  evt.preventDefault();
  console.log("touchstart.");
  var el = document.getElementById("canvas");
  //  get the context
  var ctx = el.getContext("2d");
  //  pull the list of changed touch points
  var touches = evt.changedTouches;

  // iterate over all the Touch objects in the list
  for (var i = 0; i < touches.length; i++) {
    console.log("touchstart:" + i + "...");
    // pushing them onto an array of active touchpoints
    ongoingTouches.push(copyTouch(touches[i]));

    var color = colorForTouch(touches[i]);
    // drawing the start point for the draw as a small circle： using a 4-pixel wide line, so a 4-pixel radius circle will show up neatly
    ctx.beginPath();
    ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
    ctx.fillStyle = color;
    ctx.fill();
    console.log("touchstart:" + i + ".");
  }
}
