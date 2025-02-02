import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';


const INDEX_PATH = './data/index.json';

/**
 * Les skrá og skilar gögnum eða null.
 * @param {string} filePath Skráin sem á að lesa
 * @returns {Promise<unknown | null>} Les skrá úr `filePath` og skilar innihaldi. Skilar `null` ef villa kom upp.
 */
async function readJson(filePath) {
  console.log('starting to read', filePath);
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
 * Skrifa HTML fyrir yfirlit í index.html
 * @param {any} data Gögn til að skrifa
 * @returns {Promise<void>}
 */
async function writeHtml(data) {
  const htmlFilePath = 'dist/index.html';
  const html = data.map((item) => 
    `<li><a href="${escapeHtml(item.title)}.html">${escapeHtml(item.title)}</a></li>`
  ).join('\n');  
  const htmlContent = /*html*/`<!Doctype html>
  <html lang="is">
    <head>
      <meta charset="UTF-8">
      <title>v1</title>
    </head>
    <body>
      <h1>SmYfirlit</h1>
      <ul>
        ${html}
      </ul>
    </body>
  </html>
`;

  fs.writeFile(htmlFilePath, htmlContent, 'utf-8');
}

function escapeHtml(unsafeText) {
  if (typeof unsafeText !== "string") {
    return "";
  }
  
  return unsafeText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getAnswerHtml(answersList) {
  return /*html*/`
    <ol class="answer-list">
      ${answersList.map((answer) => {
        return /*html*/`
        <li>
          <p>${escapeHtml(answer.answer)}</p>
        </li>`
      }).join('')}
    </ol>`;
}

function getQuestionHtml(questionList) {
  return /*html*/`
    <ol class="question-list">
      ${questionList.map((question) => {
        return /*html*/`
        <li>
          <p>${escapeHtml(question.question)}</p>
          ${getAnswerHtml(question.answers)}
        </li>`
      }).join('')}
    </ol>`;
}


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
    <h1>Questions</h1>
    <h2>${escapeHtml(data.title)}</h2>
    ${questionList}
  </body>
</html>`;


  fs.writeFile(htmlFilePath, htmlContent, 'utf-8');
}


function parseSubJson(data) {
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
    question.answers = question.answers.filter((answer)=>{
      return (!answer.answer || !typeof answer.answer === "string" || !answer.correct || !typeof answer.answer === "boolean");
    });

    return true
  })

  data.questions = newQuestions;

  return data;
}

/**
 * Hreinsa gögn úr index.json
 * @param {unknown} data
 * @returns {any}
 */
async function parseIndexJson(data) {
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
async function main() {
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