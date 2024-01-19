function isValidTime(time) {
    const format = time.split(':');
    console.log(format);
}

function convertMs(milliseconds) {
  var minutes = Math.floor(milliseconds / 60000);
  var seconds = ((milliseconds % 60000) / 1000).toFixed(3);
  return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}


function isValidTimeFormat(time) {
    var regex = /^(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(\.([0-9]{1,3}))?$/;
    return regex.test(time);
  }
  
  function convertToMs(time) {
    if (!isValidTimeFormat(time)) {
      return false;
    }
  
    var parts = time.split(":");
    var milliseconds = 0;
    if (parts.length === 2) {
      var minutes = parseInt(parts[0]);
      var seconds = parseFloat(parts[1]);
      milliseconds = (minutes * 60 + seconds) * 1000;
    } else if (parts.length === 3) {
      var hours = parseInt(parts[0]);
      var minutes = parseInt(parts[1]);
      var seconds = parseFloat(parts[2]);
      milliseconds = ((hours * 60 + minutes) * 60 + seconds) * 1000;
    }
    return Math.ceil(milliseconds);
  }

module.exports = { isValidTime, convertMs, convertToMs };
