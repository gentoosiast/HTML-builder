const path = require('node:path');
const fsPromises = require('node:fs/promises');
const { EOL } = require('node:os');

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
        bundleFh.write(EOL);
      });
      await bundleFh.writeFile(rs, { encoding: 'utf8' });
    }
    bundleFh.close();
  } catch (error) {
    console.error('There was an error:', error.message);
  }
};

(async () => {
  try {
    const dstDir = path.resolve(__dirname, 'project-dist');
    const componentsDir = path.resolve(__dirname, 'components');
    const assetsDir = path.resolve(__dirname, 'assets');
    const stylesDir = path.resolve(__dirname, 'styles');
    const templatePath = path.resolve(__dirname, 'template.html');
    const indexPagePath = path.resolve(__dirname, 'project-dist', 'index.html');

    await copyDir(assetsDir, path.resolve(dstDir, 'assets'));
    await outputBundle(stylesDir, path.resolve(dstDir, 'style.css'));

    const templateContents = await fsPromises.readFile(templatePath, {
      encoding: 'utf8',
    });
    const components = [
      ...templateContents.matchAll(/{{(?<component>[^}]+)}}/g),
    ].map((it) => it.groups.component);

    const componentsMap = new Map();
    for (const component of components) {
      const componentPath = path.resolve(componentsDir, `${component}.html`);
      const componentContents = await fsPromises.readFile(componentPath, {
        encoding: 'utf8',
      });
      componentsMap.set(component, componentContents);
    }

    const indexPageContents = templateContents.replace(
      /{{([^}]+)}}/g,
      (match, p1) => {
        return componentsMap.get(p1);
      }
    );
    await fsPromises.writeFile(indexPagePath, indexPageContents, {
      encoding: 'utf8',
    });
  } catch (error) {
    console.error('There was an error:', error.message);
  }
})();
