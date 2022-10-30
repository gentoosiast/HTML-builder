const path = require('node:path');
const fsPromises = require('node:fs/promises');

(async () => {
  try {
    const fPath = path.resolve(__dirname, 'text.txt');
    const fh = await fsPromises.open(fPath);
    const rs = fh.createReadStream({ encoding: 'utf8' });

    rs.on('end', () => {
      fh.close();
    });
    rs.pipe(process.stdout);
  } catch (error) {
    console.error('There was an error:', error.message);
  }
})();
