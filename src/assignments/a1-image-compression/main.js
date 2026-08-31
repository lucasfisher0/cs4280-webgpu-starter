import photoUrl from "./my-photo.jpg"
import { imageDataFromSource } from "@/lib/image/loadImage.js";
import { createSampleImage } from "@/lib/image/sampleImage.js";
import { averageBlocks } from "@/lib/image/blockAverage.js";

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

    const controlChangedEvent = new CustomEvent("controlChanged", {
        detail: {
            control: name,
            value: newValue
        }});

    const canvases = document.querySelectorAll('canvas')
    canvases.forEach((canvas) => canvas.dispatchEvent(controlChangedEvent));


}
//#endregion

async function getPersonalImage() {
    try {
        const response = await fetch(photoUrl);
        const data = await response.blob();
        const bitmap = await createImageBitmap(data);
        return imageDataFromSource(bitmap, IMAGE_SIZE);
    } catch (error) {
        console.error("Failed to get personal image:", error.message);
        return error.message;
    }
}

const IMAGE_MODIFIERS = [
    {
        title: "Original",
        fn: function(_imageData) {
            return _imageData;
        },
        showDownload: true
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
            return averageBlocks(_imageData, controlValues["blockSize"]);
        }
    }
]

function getSampleImage() {
    const sampleImage = createSampleImage(IMAGE_SIZE);
    return sampleImage.getContext("2d").getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
}

function buildGallery(imageData, galleryTitle) {
    let sectionContainer = document.getElementById(`${galleryTitle}-container`);

    let gallery = document.createElement("div");
    gallery.id = `${galleryTitle}Gallery`;
    gallery.classList.add("gallery");

    for (const MODIFIER of IMAGE_MODIFIERS) {
        let container = document.createElement("div");
        container.classList.add("imagebox");
        gallery.append(container);

        let title = document.createElement("h3")
        title.innerText = MODIFIER.title;
        container.append(title);

        let frame = document.createElement("div");
        frame.classList.add("canvas-frame");
        container.append(frame);

        const canvas = document.createElement("canvas");
        canvas.id = `canvas-${galleryTitle}-${MODIFIER.title}`;
        canvas.width = IMAGE_SIZE;
        canvas.height = IMAGE_SIZE;
        const ctx = canvas.getContext("2d");
        console.log(JSON.stringify(MODIFIER.fn(imageData)));
        ctx.putImageData(MODIFIER.fn(imageData), 0, 0);
        frame.append(canvas);

        // TODO: SETUP RESULT HTML HERE

        // Update Listener
        canvas.dataset.base = `canvas-${galleryTitle}-Original`;
        canvas.dataset.control = MODIFIER.control;
        canvas.addEventListener('controlChanged', (event) => {
            if (event.target.dataset.control === event.detail.control)
            {
                const MODIFIER = IMAGE_MODIFIERS.find(x => x.control === event.target.dataset.control);
                if (MODIFIER) {

                    const canvas = document.getElementById(event.target.dataset.base);
                    if (!canvas) {
                        console.warn("Failed to retrieve baseline image for controls update.");
                        return;
                    }

                    const baseImageData = canvas.getContext("2d").getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
                    const ctx = event.target.getContext("2d");
                    ctx.putImageData(MODIFIER.fn(baseImageData), 0, 0);
                    // TODO: Update the image statistics table above
                }
            }
        });



        if (MODIFIER.showDownload === true) {
            const downloadButton = document.createElement("button");
            downloadButton.innerText = "Download";
            downloadButton.type = "button";
            downloadButton.dataset.downloadTarget = `${galleryTitle}-${MODIFIER.title}`;
            downloadButton.addEventListener('click', (event) => {
                downloadImage(event.currentTarget.dataset["downloadTarget"]);
            });
            container.append(downloadButton);
        }
    }

    sectionContainer.append(gallery);
}

function downloadImage(targetId) {
    const canvas = document.getElementById(targetId);
    if (canvas)
    {
        const ctx = canvas.getContext("2d");
        ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)
        // TODO: Finish download
    }
    // console.log("Download: " + JSON.stringify(imageData));
}

async function main() {

    setupControls();

    const sampleImage = getSampleImage();
    buildGallery(sampleImage, "sample");

    const personalImage = await getPersonalImage();
    if (typeof(personalImage) !== "string") {
        buildGallery(personalImage, "personal");
    } else {
        let sectionContainer = document.getElementById(`personal-container`);
        let errorText = document.createElement("p");
        errorText.innerText = personalImage;
        sectionContainer.append(errorText);
    }
}

main();
