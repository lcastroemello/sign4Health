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
let rect = canvas.getBoundingClientRect();
canvas.addEventListener("mousedown", e => {
    console.log("mouse down is being detected");
    mousePressed = true;
    signing(e.clientX - rect.left, e.clientY - rect.top, false);
});
canvas.addEventListener("mousemove", e => {
    if (mousePressed) {
        signing(e.clientX - rect.left, e.clientY - rect.top, true);
    }
});
canvas.addEventListener("mouseup", e => {
    mousePressed = false;
});

canvas.addEventListener("mouseleave", e => {
    mousePressed = false;
});

function signing(x, y, isDown) {
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
button.addEventListener("click", e => {
    signatureInput.value = canvas.toDataURL();
    console.log("this is the signature", signatureInput.value);
});
