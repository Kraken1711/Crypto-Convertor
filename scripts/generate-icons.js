const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'logo.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Generate PNG files
async function generatePNG() {
    const sizes = [16, 32, 48, 64, 192, 512];
    for (const size of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(publicDir, `logo${size}.png`));
    }
    
    // Copy 192 and 512 to the required names
    fs.copyFileSync(
        path.join(publicDir, 'logo192.png'),
        path.join(publicDir, 'logo192.png')
    );
    fs.copyFileSync(
        path.join(publicDir, 'logo512.png'),
        path.join(publicDir, 'logo512.png')
    );
    
    // Create favicon.ico (combines 16, 32, 48)
    const favicon = await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(publicDir, 'favicon.ico'));
}

generatePNG().catch(console.error);
