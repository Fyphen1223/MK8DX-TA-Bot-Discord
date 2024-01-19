function isValidTime(time) {
    const format = time.split(':');
    console.log(format);
}

function convertMs(millis) {
    const seconds = Math.floor(millis / 1000);
    const ms = Math.floor(millis - seconds * 1000);
    const min = Math.floor(seconds / 60);
    const secondsStr = seconds - min * 60;
    return `${min}:${secondsStr}.${ms}`;
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
