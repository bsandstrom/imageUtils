var fs = require("fs");
let gm = require("gm");

// usage: node resizeAll.js INPUT_DIR OUTPUT_DIR MAX_IMAGE_SIZE

if (process.argv.length != 5) {
  throw "You must enter 3 argumenst";
}

const INPUT_DIR = process.argv[2];
const OUTPUT_DIR = process.argv[3];
const MAX_IMAGE_SIZE = process.argv[4];

const scaleImage = (fileName, outputDirectory, maxSize) => {
  return new Promise((resolve, reject) => {
    gm(INPUT_DIR + fileName)
      .scale(maxSize, maxSize)
      .autoOrient()
      .write(outputDirectory + fileName, (image, err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
};

const run = async () => {
  let files = fs.readdirSync(INPUT_DIR);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  // Create the resized images
  const resizePlease = files.map(async (file) => {
    await scaleImage(file, OUTPUT_DIR, MAX_IMAGE_SIZE);
    return;
  });
  await Promise.all(resizePlease);
};

run();
