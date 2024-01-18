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
		let int200 = preint +1;
		const time150 = dom.window.document.querySelector('.wr').children[0].children[preint].children[2].children[0].textContent.trim();
		const time200 = dom.window.document.querySelector('.wr').children[0].children[int200].children[0].children[0].textContent.trim();
		console.log(time150, time200);
	} 
	else if((int%2) ==0) {
		let preint = 0;
		if(int==1) {
			preint = 1;
		} else {
			preint = int * 2;
			preint--;
		}
		let int200 = preint +1;
		const time150 = dom.window.document.querySelector('.wr').children[0].children[preint].children[1].children[0].textContent.trim();
		const time200 = dom.window.document.querySelector('.wr').children[0].children[int200].children[0].children[0].textContent.trim();
		console.log(time150, time200);
	} else {
		let preint = 0;
		if(int==1) {
			preint = 1;
		} else {
			preint = int * 2;
			preint--;
		}
		let int200 = preint +1;
		const time150 = dom.window.document.querySelector('.wr').children[0].children[preint].children[0].children[0].textContent.trim();
		const time200 = dom.window.document.querySelector('.wr').children[0].children[int200].children[0].children[0].textContent.trim();
		console.log(time150, time200);
	}
}

async function run() {
	const data = await axios.get(url);
	await scrapeInfo(data.data, 1);
}

run();