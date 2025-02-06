import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir } from 'fs/promises';
/* eslint-disable quotes */
/* eslint-disable no-console */

async function ensureDistExists() {
  try {
    await mkdir('dist', { recursive: true }); // Creates 'dist' if it doesn't exist
  } catch (err) {
    console.error("Error creating 'dist' directory:", err);
  }
}
await ensureDistExists();
const INDEX_PATH = './data/index.json';

/**
 * Les skrá og skilar gögnum eða null.
 * @param {string} filePath Skráin sem á að lesa
 * @returns {Promise<unknown | null>} Les skrá úr `filePath` og skilar innihaldi. Skilar `null` ef villa kom upp.
 */
export async function readJson(filePath) {
  // console.log('starting to read', filePath);
  let data;
  try {
    data = await fs.readFile(path.resolve(filePath), 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('error parsing data as json');
    return null;
  }
}

/**
 * Fann þetta á stack overflow 
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * Shuffle function sem randomize-ar array
 * @param {*} array fylki sem á að randomize-a
 * @returns randomize-aða fylkinu
 */
export function shuffle(array) {
  if (array.constructor !== Array) {
      console.error("Trying to randomize a non-array object");
      return null;
  }
  let currentIndex = array.length;

  while (currentIndex != 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
  }
  return array;
}

/**
 * Fall sem passar upp á XSS( Cross Site Scripting) árásir og breytir mögulega 
 * 'vondum' texta í öruggan texta
 * @param {*} unsafeText Tekur inn texta sem á að escape-a
 * @returns öruggum javascript texta
 */
export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function stringToHtml(str) {
  return escapeHtml(str)
    .split("\n\n")                    // Skipta texta upp á tveggja línu bili
    .map((line) => `<p>${line}</p>`)  // Setja hverja málsgrein í <p> tag
    .join("")                         // Sameina aftur
    .replace(/\n/g, "<br>")           // Stök línuskipti fá <br>
    .replace(/ {2}/g, "&nbsp;&nbsp;");// Gera tvöfalt bil sýnilegt sem &nbsp;&nbsp;
}


/**
 * Skrifa HTML fyrir yfirlit í index.html
 * @param {any} data Gögn til að skrifa
 * @returns {Promise<void>}
 */
export async function writeHtml(data) {
  const htmlFilePath = 'dist/index.html';
  const html = data.map((item) => 
    /*html*/`
    <li class="flokkar">
      <a href="${escapeHtml(item.title)}.html">${escapeHtml(item.title)}</a>
    </li>`
  ).join('\n');  
  const htmlContent = /*html*/`<!Doctype html>
  <html lang="is">
    <head>
      <meta charset="UTF-8">
      <title>v1</title>
      <link rel="stylesheet" href="CSS.css"/>
    </head>
    <body>
      <div class="container">
        <h1>Flokkar</h1>
        <ul>
          ${html}
        </ul>
      </div>
    </body>
  </html>`;
  fs.writeFile(htmlFilePath, htmlContent, 'utf-8');
}

/**
 * Býr til HTML fyrir svarmöguleika
 * @param {*} answersList tekur inn lista af svarmöguleikum
 * @returns svarmöguleikum í HTML
 */
export function getAnswerHtml(answersList) {
  return /*html*/`
      <p class="bold">Svarmöguleikar:</p>
    <ol class="answer-list">${shuffle(answersList).map(answer => /*html*/`
      <li>
        <button 
          data-correct="${answer.correct}" 
          onclick="this.classList.add(this.dataset.correct === 'true' ? 'correct' : 'incorrect')">
          ${stringToHtml(answer.answer)}
        </button>
      </li>`).join('')}
    </ol>`;
}


/**
 * Býr til HTML fyrir spurningar
 * @param {*} questionList tekur inn lista af spurningum
 * @returns spurningum ásamt svarmöguleikum í HTML
 */
export function getQuestionHtml(questionList) {
  return /*html*/`
    <ol class="question-list">${questionList.map((question) => /*html*/`
      <li>
        <p class="question">${stringToHtml(question.question)}
        </p>${getAnswerHtml(question.answers)}
      </li>`).join('')}
    </ol>`;
}

/**
 * Býr til .html fyrir json skrárnar CSS, HTML og JS og birtrar spurningar og svarmöguleika
 * @param {*} data tekur inn gögn frá json skrá
 */
async function writeSubHtml(data) {
  const htmlFilePath = 'dist/' + data.title + '.html';
  const questionList = getQuestionHtml(data.questions)
  const htmlContent = /*html*/`<!Doctype html>
<html lang="is">
  <head>
    <meta charset="UTF-8">
    <title>v1</title>
    <link rel="stylesheet" href="CSS.css"/>
  </head>
  <body>
    <div class="container">
      <h1>Questions</h1>
      <h2>${escapeHtml(data.title)}</h2>
      ${questionList}
      <a href="." class="tilbaka">Til baka</a>
    </div>
  </body>
</html>`;
  fs.writeFile(htmlFilePath, htmlContent, 'utf-8');
}

/**
 * Fall sem athugar hvort spurningar og svarmöguleikar séu gildir
 * og filterar út ógilda spurningar og svarmöguleika
 * @param {*} data Gögn til að filtera
 * @returns Skilar gögnum sem hafa verið filteruð
 */
export function parseSubJson(data) {
  const newQuestions = data.questions.filter((question) => {
    const questionIsUndefined = question.question === undefined;
    if (questionIsUndefined) {
      return false
    }
    const answersIsArray = !Array.isArray(question.answers);
    if (answersIsArray) {
      return false
    }
    //Filter invalid answers
    question.answers = question.answers.filter((answer) => {
      return (
        typeof answer.answer === "string" &&  
        typeof answer.correct === "boolean" 
      );
    });

    return true
  })
  data.questions = newQuestions;
  return data;
}

/**
 * Hreinsa gögn úr index.json
 * @param {unknown} data Gögn til að hreinsa
 * @returns {any} Gögn sem hafa verið hreinsuð
 */
export async function parseIndexJson(data) {
  if (!Array.isArray(data)) {
    console.error('index.json is not an array. Check the file format.');
    return [];
  }
  const newData = [];
  for (const item of data) {
    const titleIsUndefined = item.title === undefined;
    const fileIsUndefined = item.file === undefined;
    const fileDoesNotExist = !existsSync("data/" + item.file);

    if (titleIsUndefined || fileIsUndefined || fileDoesNotExist) {
      continue;
    }

    const fileData = await readJson("data/" + item.file);
    if (!fileData || typeof fileData.title !== 'string' || !Array.isArray(fileData.questions)) {
      continue;
    }

    newData.push(item);
  }
  return newData;
}

/**
 * Keyrir forritið okkar:
 * 1. Sækir gögn
 * 2. Staðfestir gögn (validation)
 * 3. Skrifar út HTML
 */
export async function main() {
  const indexJson = await readJson(INDEX_PATH);

  const indexData = await parseIndexJson(indexJson);

  await writeHtml(indexData);

  for (let i = 0; i < indexData.length; i++) {
    let subData = await readJson("data/" + indexData[i].file);
    subData = parseSubJson(subData);
    await writeSubHtml(subData);
  }
}

main();