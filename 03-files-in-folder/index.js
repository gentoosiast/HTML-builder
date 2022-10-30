const path = require('node:path');
const fsPromises = require('node:fs/promises');

(async () => {
  try {
    const dirPath = path.resolve(__dirname, 'secret-folder');
    const dirents = await fsPromises.readdir(dirPath, { withFileTypes: true });

    for (const entry of dirents) {
      if (entry.isFile()) {
        const fileExt = path.extname(entry.name).slice(1);
        const fileName = path.basename(entry.name, `.${fileExt}`);
        const filePath = path.resolve(dirPath, entry.name);
        const fileStats = await fsPromises.stat(filePath);
        const fileSize = (fileStats.size / 1024).toFixed(3);

        console.log(`${fileName} - ${fileExt} - ${fileSize}kb`);
      }
    }
  } catch (error) {
    console.error('There was an error:', error.message);
  }
})();
