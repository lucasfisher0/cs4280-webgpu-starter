import photoUrl from "./my-photo.jpg"
import { imageDataFromSource } from "@/lib/image/loadImage.js";
import { createSampleImage } from "@/lib/image/sampleImage.js";

const IMAGE_SIZE = 320 // size in px

//#region Controls
const CONTROLS = ["paletteSize", "levelsPerChannel", "blockSize"];
let controlLabels = {};
let controlValues = {};

// Add event listeners to control inputs
function setupControls() {
    for (const control of CONTROLS) {
        const elem = document.getElementById(control);
        const label = document.getElementById(control+"Label");
        controlLabels[control] = label.innerHTML;
        elem.addEventListener('input', event => onControlChanged(control, event.target.value));
        onControlChanged(control, elem.value); // Set labels to initial values
    }
}

// Update Labels, Update Image Graphics
function onControlChanged(name, newValue) {
    const label = document.getElementById(name+"Label");
    label.innerHTML = controlLabels[name] + " " + newValue;
    controlValues[name] = newValue;
}
//#endregion

let sampleCanvas = null;
let personalCanvas = null;

function buildPersonalImage() {
    let image = null;
    let error = null;
    fetch(photoUrl).then(
        response => {
            let bitmap = createImageBitmap(response.blob);
            image = imageDataFromSource(bitmap)
        },
        reason => {
            error = reason;
        }
    );
    // CATCH FETCH ERROR

    if (error != null) {

    }

    return image;
}

const IMAGE_MODIFIERS = [
    {
        title: "Original",
        fn: function(_imageData) {
            return _imageData;
        }
    },
    {
        title: "Indexed Color",
        control: "paletteSize",
        fn: function(_imageData) {
            return _imageData;
        }
    },
    {
        title: "Color Quantization",
        control: "levelsPerChannel",
        fn: function(_imageData) {
            return _imageData;
        }
    },
    {
        title: "Block Average",
        control: "blockSize",
        fn: function(_imageData) {
            return _imageData;
        }
    }
]

function buildGallery() {
    let sampleContainer = document.getElementById("sample-container");

    let gallery = document.createElement("div");
    gallery.id = "sampleGallery";
    gallery.classList.add("gallery");

    const sampleImage = createSampleImage(IMAGE_SIZE);
    const imageData = sampleImage.getContext("2d").getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
    // imageData.data is a uint8 raw pixel array


    for (const MODIFIER of IMAGE_MODIFIERS) {
        let frame = document.createElement("div");
        frame.classList.add("canvas-frame");
        frame.style.width = `${IMAGE_SIZE}px`;
        frame.style.height = `${IMAGE_SIZE}px`;
        frame.style.minWidth = `${IMAGE_SIZE}px`;
        frame.style.minHeight = `${IMAGE_SIZE}px`;

        gallery.append(frame);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = IMAGE_SIZE;
        canvas.height = IMAGE_SIZE;
        ctx.putImageData(MODIFIER.fn(imageData), 0, 0);
        frame.append(canvas);
    }

    sampleContainer.append(gallery);
}





async function main() {

    setupControls();

    // buildGallery();

    /*
    let sampleFrame = document.getElementById("sample-frame");
    sampleCanvas = createSampleImage(IMAGE_SIZE);
    sampleFrame.append(sampleCanvas);
    sampleFrame.append(sampleCanvas);

    let personalFrame = document.getElementById("personal-frame");
    */


}

main();
