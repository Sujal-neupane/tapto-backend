import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const convertibleExtensions = new Set(['.heic', '.heif', '.tiff', '.tif', '.bmp']);
const convertibleMimeTypes = new Set([
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
  'image/x-ms-bmp',
]);

export const normalizeUploadedImage = async (file: Express.Multer.File) => {
  const originalExt = path.extname(file.originalname).toLowerCase();
  const shouldConvert =
    convertibleExtensions.has(originalExt) ||
    convertibleMimeTypes.has(file.mimetype);

  console.log("🖼️ normalizeUploadedImage called:", {
    originalname: file.originalname,
    originalExt,
    mimetype: file.mimetype,
    shouldConvert,
    path: file.path
  });

  if (!shouldConvert) {
    console.log("✓ No conversion needed, returning as-is");
    return file;
  }

  const outputPath = file.path.replace(path.extname(file.path), '.jpg');
  console.log("Converting image:", { from: file.path, to: outputPath });
  
  await sharp(file.path)
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  await fs.unlink(file.path);
  console.log("Image converted successfully");

  return {
    ...file,
    path: outputPath,
    filename: path.basename(outputPath),
    mimetype: 'image/jpeg',
  };
};
