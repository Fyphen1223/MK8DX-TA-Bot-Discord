// scraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const parse = require('parse5');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// The URL of the page to scrape
const url = 'https://mkwrs.com/mk8dx/';

// A function to fetch the HTML from the URL
async function getHTML(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// A function to extract the data from the HTML
async function scrapeData(html) {
    const data = new JSDOM(html);
    console.log(data.window.document.querySelector('.wr').children[0].children[2].children[6].textContent.trim());
}

// A function to run the scraper
async function runScraper() {
  const html = await getHTML(url);
  const data = await scrapeData(html);
}

// Run the scraper
runScraper();
