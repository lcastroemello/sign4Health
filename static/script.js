console.log("sanity check");
let canvas = document.getElementById("canvas");
let f = canvas.getContext("2d");
function signatureLine() {
    f.beginPath();
    // starts the drawing
    f.moveTo(50, 100);
    f.lineTo(450, 100);
    f.lineWidth = "0.1";
    f.strokeStyle = "black";
    f.stroke();
}
signatureLine();
let mousePressed = false;
let lastX, lastY;

canvas.addEventListener("mousedown", e => {
    let rect = canvas.getBoundingClientRect();
    console.log("mouse down is being detected");
    mousePressed = true;
    signing(e.clientX - rect.left, e.clientY - rect.top, false);
});
canvas.addEventListener("mousemove", e => {
    let rect = canvas.getBoundingClientRect();
    if (mousePressed) {
        signing(e.clientX - rect.left, e.clientY - rect.top, true);
    }
});
canvas.addEventListener("mouseup", () => {
    mousePressed = false;
});
canvas.addEventListener("mouseleave", () => {
    mousePressed = false;
});

canvas.addEventListener("touchstart", e => {
    let rect = canvas.getBoundingClientRect();
    console.log("mouse down is being detected");
    mousePressed = true;
    signing(e.clientX - rect.left, e.clientY - rect.top, false);
});
canvas.addEventListener("touchmove", e => {
    let rect = canvas.getBoundingClientRect();
    if (mousePressed) {
        signing(e.clientX - rect.left, e.clientY - rect.top, true);
    }
});
canvas.addEventListener("touchend", () => {
    mousePressed = false;
});
canvas.addEventListener("touchleave", () => {
    mousePressed = false;
});

function signing(x, y, isDown) {
    console.log("is down", x, y);
    if (isDown) {
        f.lineWidth = "0.5";
        f.strokeStyle = "blue";
        f.beginPath();
        f.moveTo(lastX, lastY);
        f.lineTo(x, y);
        f.closePath();
        f.stroke();
    }
    lastX = x;
    lastY = y;
}

let signatureInput = document.getElementById("hiddenSignature");
let button = document.getElementById("submitButton");
button.addEventListener("click", () => {
    signatureInput.value = canvas.toDataURL();
    console.log("this is the signature", signatureInput.value);
});
