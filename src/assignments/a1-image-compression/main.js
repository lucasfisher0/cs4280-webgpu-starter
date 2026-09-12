import { averageBlocks } from "@/lib/image/blockAverage.js";
import { psnr } from "@/lib/image/compare.js";
import { imageDataFromSource } from "@/lib/image/loadImage.js";
import { applyPalette, medianCutPalette } from "@/lib/image/palette.js";
import { downloadBytes, encodePPM } from "@/lib/image/ppm.js";
import { posterizeChannels } from "@/lib/image/quantize.js";
import { createSampleImage } from "@/lib/image/sampleImage.js";
import {
  blockStorageBytes,
  compressionRatio,
  formatBytes,
  paletteStorageBytes,
  quantizedStorageBytes,
  rawStorageBytes,
} from "@/lib/image/storage.js";
import photoUrl from "./my-photo.png";

const IMAGE_SIZE = 320; // size in px

//#region Controls
const CONTROLS = ["paletteSize", "levelsPerChannel", "blockSize"];
const controlLabels = {};
const controlValues = {
  paletteSize: 4,
  levelsPerChannel: 20,
  blockSize: 10,
};

let palette = null;

// Add event listeners to control inputs
function setupControls() {
  for (const control of CONTROLS) {
    const label = document.getElementById(control + "Label");
    controlLabels[control] = label.innerHTML;

    const elem = document.getElementById(control);
    elem.value = controlValues[control];
    elem.addEventListener("input", (event) => onControlInput(control, event.target.value));
    elem.addEventListener("change", () => onControlChanged(control));
    onControlInput(control, controlValues[control]);
    onControlChanged(control); // Set labels to initial values
  }
}

/**
 * Runs constantly when a control slider is held. Used for label updates and value validations.
 * Runs before `onControlChanged`, allowing for easier access of value modification.
 * @param name
 * @param newValue
 */
function onControlInput(name, newValue) {
  // Input Validation
  if (name === "paletteSize") {
    newValue = 2 ** newValue;
  }

  // Control Labels
  const label = document.getElementById(name + "Label");
  label.innerHTML = controlLabels[name] + " " + newValue;
  controlValues[name] = newValue;
  return newValue;
}

// Update Labels, Update Image Graphics

/**
 * Runs once when a control slider is let go to dispatch image updates.
 * @param name
 */
function onControlChanged(name) {
  const controlChangedEvent = new CustomEvent("controlChanged", {
    detail: {
      control: name,
      value: controlValues[name],
    },
  });

  const canvases = document.querySelectorAll("canvas");
  canvases.forEach((canvas) => canvas.dispatchEvent(controlChangedEvent));
  updateComparisonTable();
}

//#endregion

async function getPersonalImage() {
  try {
    const response = await fetch(photoUrl);
    const data = await response.blob();
    const bitmap = await createImageBitmap(data);
    return imageDataFromSource(bitmap, IMAGE_SIZE);
  } catch (error) {
    alert(`Failed to get personal image: ${error.message}`);
    return error.message;
  }
}

function getSampleImage() {
  const sampleImage = createSampleImage(IMAGE_SIZE);
  return sampleImage.getContext("2d").getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
}

const IMAGE_MODIFIERS = [
  {
    title: "Original",
    fn: (_imageData) => _imageData,
    showDownload: true,
  },
  {
    title: "Indexed Color",
    control: "paletteSize",
    fn: (_imageData) => {
      palette = medianCutPalette(_imageData, controlValues["paletteSize"]);
      return applyPalette(_imageData, palette).imageData;
    },
  },
  {
    title: "Color Quantization",
    control: "levelsPerChannel",
    fn: (_imageData) => posterizeChannels(_imageData, controlValues["levelsPerChannel"]),
  },
  {
    title: "Block Average",
    control: "blockSize",
    fn: (_imageData) => averageBlocks(_imageData, controlValues["blockSize"]),
  },
];

function buildGallery(imageData, galleryTitle) {
  const sectionContainer = document.getElementById(`${galleryTitle}-container`);
  const gallery = document.createElement("div");
  gallery.id = `${galleryTitle}Gallery`;
  gallery.classList.add("gallery");
  gallery.classList.add("collapsible");
  sectionContainer.append(gallery);

  for (const MODIFIER of IMAGE_MODIFIERS) {
    const container = document.createElement("div");
    container.classList.add("imagebox");
    gallery.append(container);

    const title = document.createElement("h3");
    title.innerText = MODIFIER.title;
    container.append(title);

    const frame = document.createElement("div");
    frame.classList.add("canvas-frame");
    container.append(frame);

    const canvas = document.createElement("canvas");
    canvas.id = `canvas-${galleryTitle}-${MODIFIER.title}`;
    canvas.width = IMAGE_SIZE;
    canvas.height = IMAGE_SIZE;
    frame.append(canvas);

    // HTML Table
    const downloadButton = document.createElement("button");
    downloadButton.innerText = "Download";
    downloadButton.type = "button";
    downloadButton.dataset.downloadTarget = `${galleryTitle}-${MODIFIER.title}`;
    downloadButton.addEventListener("click", (event) => {
      downloadImage(event.currentTarget.dataset["downloadTarget"]);
    });
    container.append(downloadButton);

    const table = document.createElement("table");
    table.id = `statistics-${galleryTitle}-${MODIFIER.control ?? "baseline"}`;
    container.append(table);

    const modImageData = MODIFIER.fn(imageData);
    updateDataTable(imageData, modImageData, table.id, MODIFIER.control ?? "baseline");
    const ctx = canvas.getContext("2d");
    ctx.putImageData(modImageData, 0, 0);

    // Update Listener
    canvas.dataset.base = `canvas-${galleryTitle}-Original`;
    canvas.dataset.tableId = `statistics-${galleryTitle}-${MODIFIER.control ?? "baseline"}`;
    canvas.dataset.control = MODIFIER.control;
    canvas.addEventListener("controlChanged", (event) => {
      if (event.target.dataset.control === event.detail.control) {
        console.log("Refreshing for modifier: " + event.detail.control);
        const MODIFIER = IMAGE_MODIFIERS.find((x) => x.control === event.target.dataset.control);
        if (MODIFIER) {
          const canvas = document.getElementById(event.target.dataset.base);
          if (!canvas) {
            console.warn("Failed to retrieve baseline image for controls update.");
            return;
          }

          const baseImageData = canvas.getContext("2d").getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
          const modImageData = MODIFIER.fn(baseImageData);
          updateDataTable(
            baseImageData,
            modImageData,
            event.target.dataset.tableId,
            event.target.dataset.control ?? "baseline",
          );

          const ctx = event.target.getContext("2d");
          ctx.putImageData(modImageData, 0, 0);
        }
      }
    });
  }
}

function updateDataTable(_originalImage, _modifiedImage, tableId, control) {
  const table = document.getElementById(tableId);
  table.replaceChildren();

  const sizeRaw = rawStorageBytes(_originalImage.width, _originalImage.height);

  let size;
  switch (control) {
    case "paletteSize":
      size = paletteStorageBytes(
        _modifiedImage.width,
        _modifiedImage.height,
        controlValues["paletteSize"],
      );
      break;
    case "levelsPerChannel":
      size = quantizedStorageBytes(
        _modifiedImage.width,
        _modifiedImage.height,
        controlValues["levelsPerChannel"],
      );
      break;
    case "blockSize":
      size = blockStorageBytes(
        _modifiedImage.width,
        _modifiedImage.height,
        controlValues["blockSize"],
      );
      break;
    case "baseline":
    default:
      size = sizeRaw;
  }

  const ratio = compressionRatio(sizeRaw, size);
  const spaceSaved = (1 - size / sizeRaw) * 100;
  const psnRatio = psnr(_originalImage, _modifiedImage);

  // Create Table
  const tableKeys = ["Size", "Compression Ratio", "Space saved", "Peak Signal-to-Noise Ratio"];
  const tableValues = [size, ratio, spaceSaved, psnRatio];
  for (let i = 0; i < tableKeys.length; i++) {
    const rowElem = document.createElement("tr");
    const keyElem = document.createElement("td");
    keyElem.innerText = tableKeys[i];
    rowElem.appendChild(keyElem);
    const valueElem = document.createElement("td");
    switch (i) {
      case 0:
        valueElem.innerText = formatBytes(tableValues[i]);
           break;
      case 2:
        valueElem.innerText = `${tableValues[i].toFixed(2)}%`;
        break;
      case 1:
      case 3:
      default:
        valueElem.innerText = isNaN(tableValues[i])
          ? tableValues[i]
          : Number(tableValues[i]).toFixed(4);
    }

    rowElem.appendChild(valueElem);
    table.appendChild(rowElem);
  }
}

function updateComparisonTable() {
  const table = document.getElementById("comparison-table");
  for (const imgType of ["sample", "personal"]) {
    for (const modifier of IMAGE_MODIFIERS) {
      try {
        // Select Values from Image Statistics
        const imgTable = document.getElementById(
          `statistics-${imgType}-${modifier.control ?? "baseline"}`,
        );
        if (!imgTable) continue;

        let parameter;
        switch (modifier.control) {
          case "paletteSize":
            parameter = `${controlValues["paletteSize"]} colors`;
            break;
          case "levelsPerChannel":
            parameter = `${controlValues["levelsPerChannel"]} levels per channel`;
            break;
          case "blockSize":
            parameter = `${controlValues["blockSize"]} square pixel blocks`;
            break;
          default:
            parameter = "N/A";
        }
        const size = imgTable.children[0].children[1].innerText;
        const compressionRatio = imgTable.children[1].children[1].innerText;
        const spaceSaved = imgTable.children[2].children[1].innerText;
        const PSNR = imgTable.children[3].children[1].innerText;

        // Select row of Comparison Table
        let offset = imgType === "personal" ? 5 : 1;
        if (modifier.control === "paletteSize") offset += 1;
        else if (modifier.control === "levelsPerChannel") offset += 2;
        else if (modifier.control === "blockSize") offset += 3;
        const tableRow = table.children[0].children[offset];

        tableRow.children[2].innerText = parameter;
        tableRow.children[3].innerText = size;
        tableRow.children[4].innerText = compressionRatio;
        tableRow.children[5].innerText = spaceSaved;
        tableRow.children[6].innerText = PSNR;
      } catch (e) {
        console.error(e);
      }
    }
  }
}

function downloadImage(targetId) {
  try {
    const canvas = document.getElementById(`canvas-${targetId}`);
    if (!canvas) throw new Error(`Unable to retrieve canvas element with id 'canvas-${targetId}'.`);
    const filename = `${targetId.toLowerCase()}.ppm`;
    const ctx = canvas.getContext("2d");
    const img = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
    const bytes = encodePPM(img);
    downloadBytes(bytes, filename);
  } catch (e) {
    alert(`Error:\nFailed to download file.\n${e.message}`);
  }
}

async function main() {
  setupControls();

  const sampleImage = getSampleImage();
  buildGallery(sampleImage, "sample");

  const personalImage = await getPersonalImage();
  if (typeof personalImage !== "string") {
    buildGallery(personalImage, "personal");
  } else {
    const sectionContainer = document.getElementById(`personal-container`);
    const errorText = document.createElement("p");
    errorText.innerText = personalImage;
    sectionContainer.append(errorText);
  }

  await new Promise((resolve) => setTimeout(resolve, 200)); // wait 200ms before rebuilding the initial comparison table
  updateComparisonTable();
}

main();
