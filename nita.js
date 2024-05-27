const axios = require('axios');
const jsdom = require('jsdom');
const record = require('./data/latest.json');
const fs = require('fs');

async function updateNITA() {
	const page = await axios.get(
		'https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vRBXBdqpurvBmR--bzj9RJmgr7HxAoWVZmlwmhaBK-LYf_BbXn8iAPdH-ogBtXiAwxlTkQgn45PkeRW/pubhtml?gid=406946200&single=true'
	);
	const dom = new jsdom.JSDOM(page.data);
	const document = dom.window.document;
	let i = 1;
	while (i <= 96) {
		const track = await getTrack(i, document);
		record.wr.nita150[i] = track;
		i++;
	}
	fs.writeFileSync('./data/latest.json', JSON.stringify(record));

	const page2 = await axios.get(
		'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBXBdqpurvBmR--bzj9RJmgr7HxAoWVZmlwmhaBK-LYf_BbXn8iAPdH-ogBtXiAwxlTkQgn45PkeRW/pubhtml?gid=1184003060&single=true'
	);
	const dom2 = new jsdom.JSDOM(page2.data);
	const document2 = dom2.window.document;
	let j = 1;
	while (j <= 96) {
		const track = await getTrack200(j, document2);
		record.wr.nita200[j] = track;
		j++;
	}
	fs.writeFileSync('./data/latest.json', JSON.stringify(record));
}

async function getTrack200(course, document) {
	const line =
		document.querySelector('tbody').children[getTrackLine200(course)];
	const runner = line.childNodes[getRunner200(course)].textContent;
	const time = line.childNodes[getTime200(course)].textContent;
	const fTime = line.childNodes[getTime200(course)].childNodes[0].href;
	let result = [];
	result.push(convertToMilliseconds(time));
	result.push(runner);
	result.push(fTime);
	return result;
}
function getTrackLine200(id) {
	const group = Math.ceil(id / 4);
	const res = 18 * group - 3;
	return res;
}
function getRunner200(id) {
	const group = id % 4;
	switch (group) {
		case 0:
			return 24 - 1;
		case 1:
			return 6 - 1;
		case 2:
			return 12 - 1;
		case 3:
			return 18 - 1;
	}
}
function getTime200(id) {
	const group = id % 4;
	switch (group) {
		case 0:
			return 25 - 1;
		case 1:
			return 7 - 1;
		case 2:
			return 13 - 1;
		case 3:
			return 19 - 1;
	}
}

function convertToMilliseconds(time) {
	if (time.includes('*')) return convertToMilliseconds(time.replace('*', ''));
	const parts = time.split(':').map((part) => {
		if (part.includes('.')) {
			const [seconds, milliseconds] = part.split('.');
			return seconds * 1000 + parseInt(milliseconds, 10);
		} else {
			return Number(part);
		}
	});
	let milliseconds = 0;
	if (parts.length === 3) {
		milliseconds += parts[0] * 60 * 60 * 1000; // hours to milliseconds
		milliseconds += parts[1] * 60 * 1000; // minutes to milliseconds
		milliseconds += parts[2]; // seconds and milliseconds
	} else if (parts.length === 2) {
		milliseconds += parts[0] * 60 * 1000; // minutes to milliseconds
		milliseconds += parts[1]; // seconds and milliseconds
	}

	return milliseconds;
}
async function getTrack(course, document) {
	const line = document.querySelector('tbody').children[getTrackLine(course)];
	const firstRunner = line.childNodes[getFirstRunner(course)].textContent;
	const secondRunner = line.childNodes[getSecondRunner(course)].textContent;
	const firstTime = line.childNodes[getFirstTime(course)].textContent;
	const secondTime = line.childNodes[getSecondTime(course)].textContent;
	const fTime = line.childNodes[getFirstTime(course)].childNodes[0].href;
	const sTime = line.childNodes[getSecondTime(course)].childNodes[0].href;

	let result = [];
	if (convertToMilliseconds(firstTime) < convertToMilliseconds(secondTime)) {
		result.push(convertToMilliseconds(firstTime));
		result.push(firstRunner);
		result.push(fTime);
	} else {
		result.push(convertToMilliseconds(secondTime));
		result.push(secondRunner);
		result.push(sTime);
	}
	return result;
}
function getTrackLine(id) {
	const group = Math.ceil(id / 4);
	const res = 19 * group - 4;
	return res;
}
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

module.exports = { updateNITA };
