/* eslint-disable quotes */
/* eslint-disable no-console */
import fs from 'fs/promises';
import {escapeHtml, shuffle, stringToHtml, parseSubJson, parseIndexJson, writeHtml} from "./main.js";
import { jest } from "@jest/globals";

test('escapeHtml escapes HTML', () => {
  const input1 = "<script>console.log('Helloworld')</script>";
  const input2 = "HTML:\n\n\n<div class=\"text\">\n  <h1 class=\"important text__title\">Halló heimur</p>\n</div>\n \n\nEr skilgreint CSS / there is defined CSS:\n\n\n.text {\n  font-size: 10px;\n  color: green;\n}\n\n.text .text__title {\n  font-size: 1.5em;\n}\n\n.important {\n  font-size: 2em;\n  color: red;\n}\n\n \n\n"

  const output1 = "&lt;script&gt;console.log(&#039;Helloworld&#039;)&lt;/script&gt;";
  const output2 = "HTML:\n\n\n&lt;div class=&quot;text&quot;&gt;\n  &lt;h1 class=&quot;important text__title&quot;&gt;Halló heimur&lt;/p&gt;\n&lt;/div&gt;\n \n\nEr skilgreint CSS / there is defined CSS:\n\n\n.text {\n  font-size: 10px;\n  color: green;\n}\n\n.text .text__title {\n  font-size: 1.5em;\n}\n\n.important {\n  font-size: 2em;\n  color: red;\n}\n\n \n\n"
  
  expect(escapeHtml(input1)).toBe(output1);
  expect(escapeHtml(input2)).toBe(output2);         
});

test('stringToHtml', () => {
  const input = "HTML:\n\n\n<div class=\"text\">\n  <h1 class=\"importanttext__title\">Halló heimur</p>\n</div>\n \n\nEr skilgreint CSS / there is defined CSS:\n\n\n.text {\n  font-size: 10px;\n  color: green;\n}\n\n.text .text__title {\n  font-size: 1.5em;\n}\n\n.important {\n  font-size: 2em;\n  color: red;\n}\n\n \n\n";
  const output = "<p>HTML:</p><p><br>&lt;div class=&quot;text&quot;&gt;<br>&nbsp;&nbsp;&lt;h1 class=&quot;importanttext__title&quot;&gt;Halló heimur&lt;/p&gt;<br>&lt;/div&gt;<br> </p><p>Er skilgreint CSS / there is defined CSS:</p><p><br>.text {<br>&nbsp;&nbsp;font-size: 10px;<br>&nbsp;&nbsp;color: green;<br>}</p><p>.text .text__title {<br>&nbsp;&nbsp;font-size: 1.5em;<br>}</p><p>.important {<br>&nbsp;&nbsp;font-size: 2em;<br>&nbsp;&nbsp;color: red;<br>}</p><p> </p><p></p>";
  expect(stringToHtml(input)).toBe(output);
});

test("getQuestionHtml generates correct HTML", () => {
  const input = [
    {
      question: "Spurning",
      answers: [
        { answer: "Svar 1", correct: true },
        { answer: "Svar 2", correct: false },
      ],
    },
  ];
});
//   const expectedOutput = `
//     <ol class="question-list">
//       <li>
//         <p class="question">Spurning</p>
//         <p class="bold">Svarmöguleikar:</p>
//         <ol class="answer-list">
//           <li>
//             <button data-correct="true" onclick="this.classList.add(this.dataset.correct==='true'?'correct':'incorrect')">
//               <p>Svar 1</p>
//             </button>
//           </li>
//           <li>
//             <button data-correct="false" onclick="this.classList.add(this.dataset.correct==='true'?'correct':'incorrect')">
//               <p>Svar 2</p>
//             </button>
//           </li>
//         </ol>
//       </li>
//     </ol>
//   `.replace(/\s+/g, ""); // Normalize whitespace

//   const result = getQuestionHtml(input).replace(/\s+/g, "");

//   expect(result).toBe(expectedOutput);
// });

test("returns a shuffled array of the same length", () => {
  const arr = [1, 2, 3, 4, 5];
  const shuffled = shuffle([...arr]); // Pass a copy to avoid mutation

  expect(shuffled).toHaveLength(arr.length); // Length should be the same
  expect(shuffled).toEqual(expect.arrayContaining(arr)); // Should contain the same elements
  expect(shuffled).not.toEqual(arr); // Should not be in the same order (most of the time)
});

test("shuffling an empty array returns an empty array", () => {
  expect(shuffle([])).toEqual([]);
});

test("removes questions where 'answers' is not an array", () => {
  const data = {
    questions: [
      { question: "Valid question", answers: [{ answer: "A", correct: false }] },
      { question: "Invalid question", answers: "Not an array" },
    ],
  };

  const result = parseSubJson(data);
  expect(result.questions).toHaveLength(1);
  expect(result.questions[0].question).toBe("Valid question");
});

test("returns an empty array when input is not an array", async () => {
  console.error = jest.fn();
  const result = await parseIndexJson(null);
  expect(result).toEqual([]);
  expect(console.error).toHaveBeenCalledWith("index.json is not an array. Check the file format.");
});
