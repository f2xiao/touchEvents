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
  log("touchstart.");
  var el = document.getElementById("canvas");
  //  get the context
  var ctx = el.getContext("2d");
  //  pull the list of changed touch points
  var touches = evt.changedTouches;
  console.log("touches", touches);

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
// Drawing as the touches move： handleMove() function is called when a touchmove event is delivered (Each time one or more fingers move)
// What it does： update the cached touch information and to draw a line from the previous position to the current position of each touch.
function handleMove(evt) {
  evt.preventDefault();
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;
  // iterates over the changed touches to determine the starting point for each touch's new line segment to be drawn
  for (var i = 0; i < touches.length; i++) {
    var color = colorForTouch(touches[i]);

    // check each touch's Touch.identifier property: a unique integer for each touch and remains consistent for each event during the duration of each finger's contact with the surface
    var idx = ongoingTouchIndexById(touches[i].identifier);

    //  get the coordinates of the previous position of each touch and
    if (idx >= 0) {
      console.log("continuing touch " + idx);
      // use the appropriate context methods to draw a line segment joining the two positions together
      ctx.beginPath();
      console.log(
        "ctx.moveTo(" +
          ongoingTouches[idx].pageX +
          ", " +
          ongoingTouches[idx].pageY +
          ");"
      );
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      console.log(
        "ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");"
      );
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.stroke();
      // replace the previous information about the touchpoint with the current information in the ongoingTouches array.
      ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
      console.log(".");
    } else {
      console.log("can't figure out which touch to continue");
    }
  }
}

// Handling the end of a touch: handleEnd() is called on  a touchend event when the user lifts a finger off the surface
// handleEnd does: draw the last line segment for each touch that ended and remove the touchpoint from the ongoing touch list.
function handleEnd(evt) {
  evt.preventDefault();
  log("touchend");
  var el = document.getElementById("canvas");
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var color = colorForTouch(touches[i]);
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.lineWidth = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8); // and a square at the end
      ongoingTouches.splice(idx, 1); // remove it; we're done
    } else {
      console.log("can't figure out which touch to end");
    }
  }
}

// Handling canceled touches: handleCancel is called when  user's finger wanders into browser UI
// handleCancel does: abort the touch , remove it from the ongoing touch list without drawing a final line segment.
function handleCancel(evt) {
  evt.preventDefault();
  console.log("touchcancel.");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // remove it; we're done
  }
}

// Selecting a color for each touch
//  colorForTouch does: pick a color based on the touch's unique identifier, it is an opaque number

function colorForTouch(touch) {
  var r = touch.identifier % 16;
  var g = Math.floor(touch.identifier / 3) % 16;
  var b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  var color = "#" + r + g + b;
  console.log(
    "color for touch with identifier " + touch.identifier + " = " + color
  );
  return color;
}

// Copying a touch object:  copy the properties needed rather than referencing the entire object
function copyTouch({ identifier, pageX, pageY }) {
  return { identifier, pageX, pageY };
}

// Finding an ongoing touch
// scans through the ongoingTouches array to find the touch matching the given identifier then returns that touch's index into the array
function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    console.log(" ongoingTouches array", ongoingTouches.length);
    var id = ongoingTouches[i].identifier;

    if (id == idToFind) {
      return i;
    }
  }
  return -1; // not found
}

// Showing what's going on
function log(msg) {
  var p = document.getElementById("log");
  p.innerHTML = msg + "\n" + p.innerHTML;
}
