const axios = require('axios');
const record = require('./data/data.json');
const process = require('process');
const fs = require('fs');
async function update() {
	const data = await axios.get('https://mkwrs.com/mk8dx/');

	const splittedData = data.data.split('</td><td class="lap">')
		.slice(1)
		.join('')
		.split('        </tr>\n    <tr>')[0]

	const lines = splittedData.split('\n')

	function CCParse(line) {
		return line.split('<small>')[1].split('</small>')[0]
	}

	function betweenTD(line) {
		return line.split('<td>')[1].split('</td>')[0]
	}

	const infoLines = 9
	const jumpIndex = 2 + 2

	let lineIndex = 2
	let lastCC = -1

	const arr = []
	let arrIndex = 0

	while (lineIndex <= lines.length) {
		arr[arrIndex] = {
			cc: arr[arrIndex]?.cc,
			time: lines[lineIndex].includes('target="_blank">') ? lines[lineIndex].split('target="_blank">')[1].split('</a>')[0] : lines[lineIndex].split('<td>')[1].split(' <img ')[0],
			yt_url: lines[lineIndex].includes('target="_blank">') ? lines[lineIndex].split('href = "')[1].split('"')[0] : null,
			user_name: lines[lineIndex + 1].split('">')[1].split('</a>')[0],
			country: lines[lineIndex + 2].split('alt = "')[1].split('"')[0],
			date: betweenTD(lines[lineIndex + 3]),
			duration: betweenTD(lines[lineIndex + 4]),
			character: betweenTD(lines[lineIndex + 5]),
			vehicle: betweenTD(lines[lineIndex + 6]),
			tires: betweenTD(lines[lineIndex + 7]),
			glider: betweenTD(lines[lineIndex + 8])
		}

		if ((arrIndex + 1) % 2 == 1 && lines[lineIndex - 2].includes('cc')) {
			arr[arrIndex].cc = CCParse(lines[lineIndex - 2])
			arr[arrIndex + 1] = { cc: (lastCC = CCParse(lines[lineIndex - 1])) }
		} else {
			if ((arrIndex + 1) % 2 == 1) {
				arr[arrIndex + 1] = { cc: lastCC }
			}
		}

		lineIndex += jumpIndex + infoLines // 4 + 9
		arrIndex++
	}

	let i = 1;
	while (i <= 96) {
		record.wr.ta150[i] = [];
		record.wr.ta150[i].push(convertIntoMs(arr[getRecordInfo(i, 0)].time));
		record.wr.ta150[i].push(arr[getRecordInfo(i, 0)].user_name);
		record.wr.ta200[i] = [];
		record.wr.ta200[i].push(convertIntoMs(arr[getRecordInfo(i, 1)].time));
		record.wr.ta200[i].push(arr[getRecordInfo(i, 1)].user_name);
		i++;
	}
	fs.writeFileSync('./data/latest.json', JSON.stringify(record));
}

function convertIntoMs(time) {
	var regex = /(\d+)'(\d+)"(\d+)/;
	var match = time.match(regex);
	if (match) {
		var minutes = parseInt(match[1]);
		var seconds = parseInt(match[2]);
		var milliseconds = parseInt(match[3]);
		return (minutes * 60 + seconds) * 1000 + milliseconds;
	} else {
		return 'Invalid time format';
	}
}

function getRecordInfo(track, cc) {
	if (cc == 0) {
		if (track == 0) {
			return 0;
		} else {
			return track * 2;
		}
	} else {
		if (track == 0) {
			return 1;
		} else {
			return track * 2 + 1;
		}
	}
}


update();