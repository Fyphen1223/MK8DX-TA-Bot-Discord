const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

var data = require('./data/data.json');

const url = 'https://mkwrs.com/mk8dx/';

function getTime150(int) {
    if(int==1) {
        return 5;
    }
    const x = (int -1)*24;
    let y = 0;
    if(int <= 8) y=1;
    
    return x+5+y;
}

function getRunner150(int) {
    if(int==1) {
        return 6;
    }
    const x = (int-1)*24;
    return x+6;
}

function getDate150(int) {
    if(int==1) {
        return 8;
    }
    const x = (int-1)*24;
    return x+8;
}

function getTime200(int) {
    if(int==1) {
        return 15;
    }
    const x = (int-1)*24;
    return x+15;
}

function getRunner200(int) {
    if(int==1) {
        return 16;
    }
    const x = (int-1)*24;
    return x+16;
}

function getDate200(int) {
    if(int==1) {
        return 18;
    }
    const x = (int-1)*24;
    return x+18;
}

//[time, runner, date]
//1-4: +1
//5-8: +1
//9-12: +2
//13-16: +3
//17-20: +4
//21-24: +5
axios.get(url)
  .then(response => {
    const $ = cheerio.load(response.data);
    console.log($('table td').eq(getTime150(6)).text());
  })
  .catch(error => {
    console.log(error);
  });


  /*
      let i = 0;
    while(i<=96) {
        data.wr.ta150[i] = [];
        data.wr.ta150[i].push($('table td').eq(getTime150(i)).text().replace(`"`, '.'));
        data.wr.ta150[i].push($('table td').eq(getRunner150(i)).text());
        data.wr.ta150[i].push($('table td').eq(getDate150(i)).text());
        i++;
    }
    fs.writeFileSync('./update.json', JSON.stringify(data));
  */
      //5(6) -> 150cc time
    //6(7) -> runner's name
    //8(8) -> date
    //10(9) -> Character
    //11(10) -> Machine
    //12(11) -> Tire
    //13(12) -> Grider
    //15(14) -> 200cc time
    //16(15) -> 200cc runner's name
    //18(17) -> date
    //20(19) -> 200cc character
    //21(20) -> 200cc machine
    //22(21) -> 200cc Tire
    //23(22) -> 200cc Grider
    //24
    //29(28) ->
    //53 +24
    //77