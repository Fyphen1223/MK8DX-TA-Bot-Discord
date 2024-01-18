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

function isValidTimeFormat(timeString) {
    var timeRegex = /^\d+:\d+\.\d{1,3}$/;
    return timeRegex.test(timeString);
}

function convertToMs(timeString) {
    if (!isValidTimeFormat(timeString)) {
        return false;
    }
    var timeArray = timeString.split(':');
    var minutes = parseInt(timeArray[0], 10);
    var seconds = parseFloat(timeArray[1]);
    var milliseconds = (minutes * 60 + seconds) * 1000;
    return Math.ceil(milliseconds);
}

module.exports = { isValidTime, convertMs, convertToMs };
