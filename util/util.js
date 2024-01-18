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

module.exports = { isValidTime, convertMs };
