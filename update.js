// scraper.js
const axios = require('axios');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const url = 'https://mkwrs.com/mk8dx/';


/*
2回に1回は余計なtdが1個増える（トラック）
8回に1回は余計なtdが1個増える

1のとき150は1個目
2の時150は3個目
3のとき150は5個目
4の時150は7個目
5の時150は9個目
*/
async function scrapeInfo(data, int) {
	const dom = new JSDOM(data);
	if((int % 8) == 1) {
		let preint = 0;
		if(int==1) {
			preint = 1;
		} else {
			preint = int * 2;
			preint--;
		}
		const time150 = dom.window.document.querySelector('.wr').children[0].children[preint].children[2].children[0].textContent.trim();
		console.log(time150);
	} 
	else if((int%2) ==1) {
		let preint = 0;
		if(int==1) {
			preint = 1;
		} else {
			preint = int * 2;
			preint--;
		}
		const time = dom.window.document.querySelector('.wr').children[0].children[preint].children[1].children[0].textContent.trim();
		console.log(time);
	} else {
		let preint = 0;
		if(int==1) {
			preint = 1;
		} else {
			preint = int * 2;
			preint--;
		}
		const time = dom.window.document.querySelector('.wr').children[0].children[preint].children[0].children[0].textContent.trim();
		console.log(time);
	}
}

async function run() {
	const data = await axios.get(url);
	await scrapeInfo(data.data, 3);
}

run();