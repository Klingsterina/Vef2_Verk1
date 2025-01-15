import fs from 'node:fs/promises';
import path from 'node:path';

const INDEX_PATH = './data/index.json';

async function readJson(filePath) {
  console.log('starting to read', filePath);
  try {
    const data = await fs.readFile(path.resolve(filePath), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('hello world');

  const indexData = await readJson(INDEX_PATH);

  if (!Array.isArray(indexData)) {
    console.error('index.json is not an array. Check the file format.');
    return [];
  }

  // Read other JSON files listed in index.json
  const allData = await Promise.all(
    indexData.map(async (item) => {
      const filePath = `./data/${item.file}`;
      const fileData = await readJson(filePath);
      return fileData ? { ...item, content: fileData } : null;
    }),
  );
}

main();

/*

async function readAllData() {
  const indexPath = './data/index.json';

  try {
    // Read index.json
    const indexData = await readJSON(indexPath);

    if (!Array.isArray(indexData)) {
      console.error('index.json is not an array. Check the file format.');
      return [];
    }

    // Read other JSON files listed in index.json
    const allData = await Promise.all(
      indexData.map(async (item) => {
        const filePath = `./data/${item.file}`;
        const fileData = await readJSON(filePath);
        return fileData ? { ...item, content: fileData } : null;
      }),
    );

    return allData.filter(Boolean); // Remove null entries if any file failed to load
  } catch (error) {
    console.error('Error reading data files:', error.message);
    return [];
  }
}


readAllData().then((data) => console.log(data));
*/