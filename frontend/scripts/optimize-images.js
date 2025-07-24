#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.join(__dirname, '../src/assets');
const OPTIMIZED_DIR = path.join(__dirname, '../src/assets/optimized');
const QUALITY = 80;
const WEBP_QUALITY = 80;

// Responsive breakpoints
const BREAKPOINTS = [
  { suffix: '-sm', width: 640 },
  { suffix: '-md', width: 768 },
  { suffix: '-lg', width: 1024 },
  { suffix: '-xl', width: 1280 },
];

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Get all image files recursively
 */
function getImageFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getImageFiles(fullPath));
    } else if (/\.(jpg|jpeg|png)$/i.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Optimize a single image
 */
async function optimizeImage(inputPath) {
  const relativePath = path.relative(SOURCE_DIR, inputPath);
  const parsedPath = path.parse(relativePath);
  const outputDir = path.join(OPTIMIZED_DIR, parsedPath.dir);
  
  ensureDir(outputDir);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Optimizing: ${relativePath} (${metadata.width}x${metadata.height})`);
    
    // Original format optimization
    const originalExt = parsedPath.ext.toLowerCase();
    const originalOutput = path.join(outputDir, `${parsedPath.name}${originalExt}`);
    
    if (originalExt === '.jpg' || originalExt === '.jpeg') {
      await image
        .jpeg({ quality: QUALITY, progressive: true })
        .toFile(originalOutput);
    } else if (originalExt === '.png') {
      await image
        .png({ quality: QUALITY, progressive: true })
        .toFile(originalOutput);
    }
    
    // WebP conversion
    const webpOutput = path.join(outputDir, `${parsedPath.name}.webp`);
    await image
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpOutput);
    
    // Create responsive variants if image is large enough
    if (metadata.width > 640) {
      for (const breakpoint of BREAKPOINTS) {
        if (metadata.width > breakpoint.width) {
          // Original format responsive
          const responsiveOutput = path.join(outputDir, `${parsedPath.name}${breakpoint.suffix}${originalExt}`);
          const responsiveWebpOutput = path.join(outputDir, `${parsedPath.name}${breakpoint.suffix}.webp`);
          
          if (originalExt === '.jpg' || originalExt === '.jpeg') {
            await image
              .resize(breakpoint.width, null, { withoutEnlargement: true })
              .jpeg({ quality: QUALITY, progressive: true })
              .toFile(responsiveOutput);
          } else if (originalExt === '.png') {
            await image
              .resize(breakpoint.width, null, { withoutEnlargement: true })
              .png({ quality: QUALITY, progressive: true })
              .toFile(responsiveOutput);
          }
          
          // WebP responsive
          await image
            .resize(breakpoint.width, null, { withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toFile(responsiveWebpOutput);
        }
      }
    }
    
    // Get file sizes for comparison
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(originalOutput).size;
    const webpSize = fs.statSync(webpOutput).size;
    
    const originalSavings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    
    console.log(`  Original: ${(originalSize / 1024).toFixed(1)}KB -> ${(optimizedSize / 1024).toFixed(1)}KB (${originalSavings}% savings)`);
    console.log(`  WebP: ${(webpSize / 1024).toFixed(1)}KB (${webpSavings}% savings)`);
    
  } catch (error) {
    console.error(`Error optimizing ${relativePath}:`, error.message);
  }
}

/**
 * Generate picture element code for responsive images
 */
function generatePictureCode(imageName) {
  const name = path.parse(imageName).name;
  
  return `
<picture>
  <source
    srcSet="
      /src/assets/optimized/${name}-sm.webp 640w,
      /src/assets/optimized/${name}-md.webp 768w,
      /src/assets/optimized/${name}-lg.webp 1024w,
      /src/assets/optimized/${name}-xl.webp 1280w,
      /src/assets/optimized/${name}.webp 1920w
    "
    type="image/webp"
  />
  <source
    srcSet="
      /src/assets/optimized/${name}-sm.jpg 640w,
      /src/assets/optimized/${name}-md.jpg 768w,
      /src/assets/optimized/${name}-lg.jpg 1024w,
      /src/assets/optimized/${name}-xl.jpg 1280w,
      /src/assets/optimized/${name}.jpg 1920w
    "
    type="image/jpeg"
  />
  <img
    src="/src/assets/optimized/${name}.jpg"
    alt="${name}"
    loading="lazy"
    decoding="async"
  />
</picture>`;
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Starting image optimization...\n');
  
  const imageFiles = getImageFiles(SOURCE_DIR);
  
  if (imageFiles.length === 0) {
    console.log('No images found to optimize in:', SOURCE_DIR);
    return;
  }
  
  console.log(`Found ${imageFiles.length} images to optimize\n`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const imagePath of imageFiles) {
    totalOriginalSize += fs.statSync(imagePath).size;
    await optimizeImage(imagePath);
  }
  
  // Calculate total savings
  const optimizedFiles = getImageFiles(OPTIMIZED_DIR);
  for (const optimizedPath of optimizedFiles) {
    if (!optimizedPath.includes('-sm') && !optimizedPath.includes('-md') && 
        !optimizedPath.includes('-lg') && !optimizedPath.includes('-xl') &&
        !optimizedPath.endsWith('.webp')) {
      totalOptimizedSize += fs.statSync(optimizedPath).size;
    }
  }
  
  if (totalOptimizedSize > 0) {
    const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
    
    console.log('\n✅ Optimization complete!');
    console.log(`Total size reduction: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB -> ${(totalOptimizedSize / 1024 / 1024).toFixed(1)}MB (${totalSavings}% savings)`);
    console.log(`\nOptimized images are in: ${OPTIMIZED_DIR}`);
    
    // Generate usage examples
    console.log('\n📝 Example usage in React components:');
    const firstImage = path.basename(imageFiles[0]);
    console.log(generatePictureCode(firstImage));
  }
}

// Run the script
main().catch(console.error);