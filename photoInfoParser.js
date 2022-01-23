var fs = require("fs");
let gm = require("gm");

// ode photoInfoParser.js /home/brent/Projects/wedding/public/images/Engagement/ "\${process.env.PUBLIC_URL}/images/Engagement/" /home/brent/Projects/wedding/src/images/metadata.js

if (process.argv.length != 5) {
  throw "You must enter 3 argumenst";
}

const IMAGE_DIRECTORY =
  process.argv[2] || "/home/brent/Projects/wedding/public/images/Engagement/";

const SRC = process.argv[3];

const METADATA_FILENAME = process.argv[4];

const THUMBNAIL_DIR_NAME = "thumbnails";
const NORMAL_QUALITY_DIR_NAME = "normal";

const THUMBNAIL_DIR = IMAGE_DIRECTORY + THUMBNAIL_DIR_NAME + "/";
const NORMAL_QUALITY_DIR = IMAGE_DIRECTORY + NORMAL_QUALITY_DIR_NAME + "/";

const PUBLIC_URL = "${process.env.PUBLIC_URL}";

const getSize = (filePath) => {
  return new Promise((resolve, reject) => {
    gm(THUMBNAIL_DIR + filePath).size(async (err, size) => {
      if (!err) {
        resolve({
          name: filePath,
          height: size.height,
          width: size.width,
        });
      } else {
        reject(err);
      }
    });
  });
};

const scaleImage = (fileName, outputDirectory, maxSize) => {
  return new Promise((resolve, reject) => {
    gm(IMAGE_DIRECTORY + fileName)
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

const getJSMetadata = (data) => {
  let metadata = "export const photos = [\n";
  data.forEach((fileInfo, i) => {
    metadata += " {\n";
    metadata +=
      "    src: `" + SRC + THUMBNAIL_DIR_NAME + "/" + fileInfo.name + "`,\n";
    metadata +=
      "    fullsize: `" +
      SRC +
      NORMAL_QUALITY_DIR_NAME +
      "/" +
      fileInfo.name +
      "`,\n";
    metadata += "    height: " + fileInfo.height + ",\n";
    metadata += "    width: " + fileInfo.width + "\n";
    if (i === data.length - 1) {
      metadata += " }\n";
    } else {
      metadata += " },\n";
    }
  });
  metadata += "];";
  return metadata;
};

const run = async () => {
  let files = fs.readdirSync(IMAGE_DIRECTORY);
  files = files.filter(
    (fileName) => ![THUMBNAIL_DIR_NAME, METADATA_FILENAME].includes(fileName)
  );

  if (!fs.existsSync(THUMBNAIL_DIR)) {
    fs.mkdirSync(THUMBNAIL_DIR);
  }
  if (!fs.existsSync(NORMAL_QUALITY_DIR)) {
    fs.mkdirSync(NORMAL_QUALITY_DIR);
  }

  // create all thumbnails
  const resizePlease = files.map(async (file) => {
    await scaleImage(file, THUMBNAIL_DIR, 440);
    await scaleImage(file, NORMAL_QUALITY_DIR, 1200);
    return;
  });
  await Promise.all(resizePlease);

  // get thumbnails
  let thumbnails = fs.readdirSync(IMAGE_DIRECTORY + "thumbnails/");
  thumbnails = thumbnails.filter(
    (fileName) => ![THUMBNAIL_DIR_NAME, METADATA_FILENAME].includes(fileName)
  );

  const promises = thumbnails.map(async (file) => {
    return await getSize(file);
  });

  const fileSizes = await Promise.all(promises);

  const metadata = getJSMetadata(fileSizes);
  fs.writeFileSync(METADATA_FILENAME, metadata);
};

run();
