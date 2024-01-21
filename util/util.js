function isValidTime(time) {
	const format = time.split(':');
	console.log(format);
}

function convertMs(milliseconds) {
	var minutes = Math.floor(milliseconds / 60000);
	var seconds = ((milliseconds % 60000) / 1000).toFixed(3);
	return (
		(minutes < 10 ? '0' : '') +
		minutes +
		':' +
		(seconds < 10 ? '0' : '') +
		seconds
	);
}

function getDrop(time, wr) {
	const diff = time - wr;
	const drop = Math.ceil(diff / 1000);
	if (drop == 1) {
		return '🟢 1';
	}
	if (drop == 2) {
		return '🟡 2';
	}
	if (drop == 3) {
		return '🔴 3';
	}
	if (drop == 4) {
		return '🔵 4';
	}
	if (drop == 5) {
		return '🟠 5';
	}
	if (drop == 6) {
		return '🟣 6';
	}
	if (drop == 7) {
		return '🟤 7';
	}
	if (drop == 8) {
		return '⚪ 8';
	}
	if (drop == 9) {
		return '⚫ 9';
	}
	if (drop >= 10) {
		return `⚫ ${drop}`;
	}
}

function isValidTimeFormat(time) {
	var regex = /^(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(\.([0-9]{1,3}))?$/;
	return regex.test(time);
}

function convertToMs(time) {
	if (!isValidTimeFormat(time)) {
		return false;
	}

	var parts = time.split(':');
	var milliseconds = 0;
	if (parts.length === 2) {
		var minutes = parseInt(parts[0]);
		var seconds = parseFloat(parts[1]);
		milliseconds = (minutes * 60 + seconds) * 1000;
	} else if (parts.length === 3) {
		let hours = parseInt(parts[0]);
		let minutes = parseInt(parts[1]);
		let seconds = parseFloat(parts[2]);
		milliseconds = ((hours * 60 + minutes) * 60 + seconds) * 1000;
	}
	return Math.round(milliseconds);
}

module.exports = { isValidTime, convertMs, convertToMs, getDrop };
