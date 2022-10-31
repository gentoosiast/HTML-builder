const path = require('node:path');
const fsPromises = require('node:fs/promises');

const outputBundle = async (stylesDir, bundlePath) => {
  try {
    const dirents = await fsPromises.readdir(stylesDir, {
      withFileTypes: true,
    });
    const cssPaths = [];
    for (const entry of dirents) {
      if (entry.isFile() && path.extname(entry.name) === '.css') {
        const cssPath = path.resolve(stylesDir, entry.name);
        cssPaths.push(cssPath);
      }
    }
    cssPaths.sort();

    const bundleFh = await fsPromises.open(bundlePath, 'w');
    for (const cssPath of cssPaths) {
      const fh = await fsPromises.open(cssPath);
      const rs = fh.createReadStream({ encoding: 'utf8' });
      rs.on('end', () => {
        fh.close();
      });
      await bundleFh.writeFile(rs, { encoding: 'utf8' });
    }
    bundleFh.close();
  } catch (error) {
    console.error('There was an error:', error.message);
  }
};

const srcDir = path.resolve(__dirname, 'styles');
const dstFile = path.resolve(__dirname, 'project-dist', 'bundle.css');
outputBundle(srcDir, dstFile);
