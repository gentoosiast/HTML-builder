const path = require('node:path');
const fsPromises = require('node:fs/promises');
const readline = require('node:readline');
const process = require('node:process');

(async () => {
  try {
    const filePath = path.resolve(__dirname, 'output.txt');
    const fh = await fsPromises.open(filePath, 'w');
    const ws = fh.createWriteStream({ encoding: 'utf8' });
    const rl = readline.createInterface({
      input: process.stdin,
      output: ws,
    });

    const exit = () => {
      console.log('Goodbye! Have a nice day');
      rl.close();
      ws.close();
      fh.close();
      process.exit(0);
    };

    process.on('SIGINT', () => {
      exit();
    });

    rl.on('line', (line) => {
      if (line === 'exit') {
        exit();
      }
      ws.write(line + '\n');
    });

    console.log(
      'You can enter your text now.\nType "exit" or press CTRL-C to quit'
    );
  } catch (error) {
    console.error('There was an error:', error.message);
  }
})();
