const path = require('node:path');
const fsPromises = require('node:fs/promises');

const copyDir = async (srcDir, dstDir) => {
  try {
    await fsPromises.rm(dstDir, { force: true, recursive: true });
    await fsPromises.mkdir(dstDir, { recursive: true });
    const dirents = await fsPromises.readdir(srcDir, { withFileTypes: true });

    for (const entry of dirents) {
      const from = path.resolve(srcDir, entry.name);
      const to = path.resolve(dstDir, entry.name);

      if (entry.isDirectory()) {
        await copyDir(from, to);
      } else if (entry.isFile()) {
        await fsPromises.copyFile(from, to);
      }
    }
  } catch (error) {
    console.error('There was an error:', error.message);
  }
};

const srcDir = path.resolve(__dirname, 'files');
const dstDir = path.resolve(__dirname, 'files-copy');
copyDir(srcDir, dstDir);
