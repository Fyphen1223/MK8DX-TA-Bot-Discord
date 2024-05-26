const axios = require('axios');
const { parse } = require('node-html-parser');
const jsdom = require('jsdom');
async function main() {
	const page = await axios.get(
		'https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vRBXBdqpurvBmR--bzj9RJmgr7HxAoWVZmlwmhaBK-LYf_BbXn8iAPdH-ogBtXiAwxlTkQgn45PkeRW/pubhtml?gid=406946200&single=true'
	);
	const dom = new jsdom.JSDOM(page.data);
	const document = dom.window.document;
	const course = 11;
	const firstRunner =
		document.querySelector('tbody').children[getTrackLine(course)]
			.childNodes[getFirstRunner(course)].textContent;
	const secondRunner =
		document.querySelector('tbody').children[getTrackLine(course)]
			.childNodes[getSecondRunner(course)].textContent;
	const firstTime =
		document.querySelector('tbody').children[getTrackLine(course)]
			.childNodes[getFirstTime(course)].textContent;
	const secondTime =
		document.querySelector('tbody').children[getTrackLine(course)]
			.childNodes[getSecondTime(course)].textContent;
	console.log(firstTime, secondTime);
	console.log(firstRunner, secondRunner);
}
function getTrackLine(id) {
	const group = Math.ceil(id / 4);
	const res = 19 * group - 4;
	return res;
}

4, 12, 20, 28;
function getFirstRunner(id) {
	const group = id % 4;
	switch (group) {
		case 0:
			return 28 - 1;
		case 1:
			return 4 - 1;
		case 2:
			return 12 - 1;
		case 3:
			return 20 - 1;
	}
}
8, 16, 24, 32;
1, 2, 3, 4;
function getSecondRunner(id) {
	const group = id % 4;
	switch (group) {
		case 0:
			return 32 - 1;
		case 1:
			return 8 - 1;
		case 2:
			return 16 - 1;
		case 3:
			return 24 - 1;
	}
}
5, 13, 21, 29;
function getFirstTime(id) {
	const group = id % 4;
	switch (group) {
		case 0:
			return 29 - 1;
		case 1:
			return 5 - 1;
		case 2:
			return 13 - 1;
		case 3:
			return 21 - 1;
	}
}
9, 17, 25, 33;
function getSecondTime(id) {
	const group = id % 4;
	switch (group) {
		case 0:
			return 33 - 1;
		case 1:
			return 9 - 1;
		case 2:
			return 17 - 1;
		case 3:
			return 25 - 1;
	}
}

main();
