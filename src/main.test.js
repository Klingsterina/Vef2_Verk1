/* eslint-disable quotes */
/* eslint-disable no-console */
import { jest } from "@jest/globals";
import {escapeHtml, shuffle, stringToHtml, parseSubJson, parseIndexJson} from "./main.js";
/* eslint-disable no-undef */

//Þessi eslint warnings makea ekki ssense!!
test('escapeHtml escapes HTML', () => {
  const input1 = "<script>console.log(&#039;Helloworld&#039;)</script>";
  const input2 = "HTML:\n\n\n<div class=&quot;text&quot;>\n  <h1 class=&quot;important text__title&quot;>Halló heimur</p>\n</div>\n \n\nEr skilgreint CSS / there is defined CSS:\n\n\n.text {\n  font-size: 10px;\n  color: green;\n}\n\n.text .text__title {\n  font-size: 1.5em;\n}\n\n.important {\n  font-size: 2em;\n  color: red;\n}\n\n \n\n"

  const output1 = "&lt;script&gt;console.log(&amp;#039;Helloworld&amp;#039;)&lt;/script&gt;";
  const output2 = "HTML:\n\n\n&lt;div class=&amp;quot;text&amp;quot;&gt;\n  &lt;h1 class=&amp;quot;important text__title&amp;quot;&gt;Halló heimur&lt;/p&gt;\n&lt;/div&gt;\n \n\nEr skilgreint CSS / there is defined CSS:\n\n\n.text {\n  font-size: 10px;\n  color: green;\n}\n\n.text .text__title {\n  font-size: 1.5em;\n}\n\n.important {\n  font-size: 2em;\n  color: red;\n}\n\n \n\n"
  
  expect(escapeHtml(input1)).toBe(output1);
  expect(escapeHtml(input2)).toBe(output2);         
});

test('stringToHtml', () => {
  const input = "HTML:\n\n\n<div class=&quot;text&quot;>\n  <h1 class=&quot;importanttext__title&quot;>Halló heimur</p>\n</div>\n \n\nEr skilgreint CSS / there is defined CSS:\n\n\n.text {\n  font-size: 10px;\n  color: green;\n}\n\n.text .text__title {\n  font-size: 1.5em;\n}\n\n.important {\n  font-size: 2em;\n  color: red;\n}\n\n \n\n";
  const output = "<p>HTML:</p><p><br>&lt;div class=&amp;quot;text&amp;quot;&gt;<br>&nbsp;&nbsp;&lt;h1 class=&amp;quot;importanttext__title&amp;quot;&gt;Halló heimur&lt;/p&gt;<br>&lt;/div&gt;<br> </p><p>Er skilgreint CSS / there is defined CSS:</p><p><br>.text {<br>&nbsp;&nbsp;font-size: 10px;<br>&nbsp;&nbsp;color: green;<br>}</p><p>.text .text__title {<br>&nbsp;&nbsp;font-size: 1.5em;<br>}</p><p>.important {<br>&nbsp;&nbsp;font-size: 2em;<br>&nbsp;&nbsp;color: red;<br>}</p><p> </p><p></p>";
  expect(stringToHtml(input)).toBe(output);
});


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
