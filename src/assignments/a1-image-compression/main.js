import { createSampleImage } from "src/lib/image/sampleImage.js"
import photoUrl from "./my-photo.jpg"


function loadPersonalImage() {


    let dat = fetch(photoUrl)
    let promiseBitmap = createImageBitmap(dat.valueOf().blob)
    // CONVERT TO ASYNC
    // CATCH AND PRINT ERRORS
}
async function main() {

}

main();
