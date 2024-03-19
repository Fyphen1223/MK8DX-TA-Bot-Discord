require('dotenv').config();

const discord = require('discord.js');
const data = require('./data/latest.json');
const { convertMs, convertToMs, getDrop } = require('./util/util');
const process = require('process');

const { createClient } = require('redis');
const {
	EmbedBuilder,
	ActivityType,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const redis = createClient({
	password: process.env.REDISPASS,
	socket: {
		host: process.env.REDIS,
		port: process.env.REDISPORT,
	},
});

const client = new discord.Client({
	intents: [
		discord.GatewayIntentBits.DirectMessages,
		discord.GatewayIntentBits.GuildMembers,
		discord.GatewayIntentBits.Guilds,
	],
	partials: [discord.Partials.User],
});

const http = require('http');
const server = http.createServer((req, res) => {
	res.end('Donate me :D');
	console.log('The data came');
	return;
});

client.on('ready', () => {
	console.log('Logged in');
	/*
	client.guilds.cache.forEach((guild) => {
		console.log(guild.name, guild.memberCount);
	});
	*/
	if (process.env.WAKEMEUP == 1) {
		server.listen(10000, () => {
			console.log('Server is ready');
		});
	}
	if (process.env.PRODUCTION == 1) {
		client.user.setActivity('Properly Working', {
			type: ActivityType.Playing,
		});
	} else {
		client.user.setActivity('In Development', {
			type: ActivityType.Playing,
		});
	}
	redis.connect();
});

redis.on('ready', async () => {
	console.log('The Database is ready');
});
redis.on('error', (err) => {
	console.log(err.stack);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isAutocomplete()) return;
	let current = await redis.get(interaction.user.id);
	if (!current)
		await redis.set(interaction.user.id, JSON.stringify(data.default));
	current = JSON.parse(await redis.get(interaction.user.id));
	const command = interaction.commandName;
	if (
		command === 'nita150' ||
		command === 'nita200' ||
		command === 'ta150' ||
		command === 'ta200'
	) {
		const focusedValue = interaction.options.getFocused();
		let filtered = data.tracks[current.lang].filter((choice) =>
			choice.startsWith(focusedValue)
		);
		filtered = filtered.slice(0, 24);
		await interaction.respond(
			filtered.map((choice) => ({ name: choice, value: choice }))
		);
	}
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isAutocomplete()) return;
	const command = interaction.commandName;
	let subcommand = null;
	try {
		subcommand = interaction.options.getSubcommand();
	} catch (err) {
		subcommand = null;
	}
	if (command === 'ping') {
		await interaction.reply(
			`Working! Current bot's ping is ${client.ws.ping}ms!`
		);
		return;
	}
	if (command === 'config' && subcommand === 'lang') {
		await interaction.deferReply();
		const lang = interaction.options.getString('lang');
		let current = JSON.parse(await redis.get(interaction.user.id));
		current.lang = lang;
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(`Changed your language to ${lang}`);
	}
	if (command === 'nita150' && subcommand === 'register') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let time = interaction.options.getString('time');
		time = convertToMs(time);
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].illegalformat
			);
			return;
		}
		if (data.tracks[current.lang].indexOf(track) === -1) {
			await interaction.editReply(
				data.messages[current.lang].tracknotexists
			);
			return;
		}
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		if (data.wr.nita150[index][0] >= time) {
			await interaction.editReply(
				`${data.messages[current.lang].fasterthanwr}${convertMs(
					data.wr.nita150[index][0]
				)}`
			);
			return;
		}
		if (!current.nita150[index]) {
			current.nita150[index] = time;
			await redis.set(interaction.user.id, JSON.stringify(current));
			await interaction.editReply(
				`Set your time on ${track} on 150cc TA to ${convertMs(time)}!\nYour time is slower than the WR by ${convertMs(
					time - data.wr.nita150[index][0]
				)}`
			);
			return;
		}
		if (current.nita150[index] < time) {
			await interaction.editReply(
				`The time you entered is slower than your best. Your best is ${convertMs(
					current.ta150[index]
				)}`
			);
			return;
		}
		if (current.nita150[index] == time) {
			await interaction.editReply(
				'The time you entered is the same as your best.'
			);
			return;
		}
		const pastTime = current.nita150[index];
		current.nita150[index] = time;
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Congrats! Set your time on ${track} on 150cc NITA to ${convertMs(
				time
			)}.\nYou improved your time by ${convertMs(
				pastTime - current.nita150[index]
			)}!\nYour time is slower than the WR by ${convertMs(
				time - data.wr.nita150[index][0]
			)}!`
		);
	}
	if (command === 'nita150' && subcommand === 'show') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.nita150[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ` | MK8DX NITA on 150cc - ${track}`,
				iconURL: interaction.user.avatarURL(),
			})
			.addFields(
				{
					name: data.messages[current.lang].yourtime,
					value: `${convertMs(time)} - ${getDrop(
						time,
						data.wr.nita150[index][0]
					)} drop`,
				},
				{
					name: 'WR',
					value: `${convertMs(data.wr.nita150[index][0])} by ${
						data.wr.nita150[index][1]
					}`,
				},
				{
					name: data.messages[current.lang].difference,
					value: convertMs(
						current.nita150[index] - data.wr.nita150[index][0]
					),
				}
			)
			.setTimestamp();
		await interaction.editReply({
			embeds: [embed],
		});
		return;
	}
	if (command === 'nita150' && subcommand === 'delete') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.nita150[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const pastTime = current.nita150[index];
		delete current.nita150[index];
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Deleted your time on ${track} on 150cc NITA. Your time was ${convertMs(
				pastTime
			)}`
		);
	}
	if (command === 'nita150' && subcommand === 'list') {
		await interaction.deferReply();
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ' | MK8DX NITA on 150cc',
				iconURL: interaction.user.avatarURL(),
			})
			.setDescription(
				data.tracks[current.lang]
					.map((track, index) => {
						index++;
						if (!current.nita150[index]) {
							return `${index}. ${track} - Not registered`;
						}
						const time = current.nita150[index];
						const drop = getDrop(time, data.wr.nita150[index][0]);
						return `${index}. ${track} - ${convertMs(
							time
						)} - ${drop} drop`;
					})
					.join('\n')
			)
			.setTimestamp();
		await interaction.editReply({
			embeds: [embed],
		});
		return;
	}
	if (command === 'nita200' && subcommand === 'register') {
		const track = interaction.options.getString('track');
		let time = interaction.options.getString('time');
		time = convertToMs(time);
		await interaction.deferReply();
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].illegalformat
			);
			return;
		}
		if (data.tracks[current.lang].indexOf(track) === -1) {
			await interaction.editReply(
				data.messages[current.lang].tracknotexists
			);
			return;
		}
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		if (data.wr.nita200[index][0] >= time) {
			await interaction.editReply(
				`${data.messages[current.lang].fasterthanwr}${convertMs(
					data.wr.nita200[index][0]
				)}`
			);
			return;
		}
		if (!current.nita200[index]) {
			current.nita200[index] = time;
			await redis.set(interaction.user.id, JSON.stringify(current));
			await interaction.editReply(
				`Set your time on ${track} on 200cc NITA to ${convertMs(time)}`
			);
			return;
		}
		if (current.nita200[index] < time) {
			await interaction.editReply(
				`The time you entered is slower than your best. Your best is ${convertMs(
					current.nita200[index]
				)}`
			);
			return;
		}
		if (current.nita200[index] == time) {
			await interaction.editReply(
				'The time you entered is the same as your best.'
			);
			return;
		}
		const pastTime = current.nita200[index];
		current.nita200[index] = time;
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Congrats! Set your time on ${track} on 200cc NITA to ${convertMs(
				time
			)}.\nYou improved your time by ${convertMs(
				pastTime - current.nita200[index]
			)}!\nYour time is slower than the WR by ${convertMs(
				time - data.wr.nita200[index][0]
			)}!`
		);
	}
	if (command === 'nita200' && subcommand === 'show') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.nita200[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ` | MK8DX NITA on 200cc - ${track}`,
				iconURL: interaction.user.avatarURL(),
			})
			.addFields(
				{
					name: data.messages[current.lang].yourtime,
					value: `${convertMs(time)} - ${getDrop(
						time,
						data.wr.nita200[index][0]
					)} drop`,
				},
				{
					name: 'WR',
					value: `${convertMs(data.wr.nita200[index][0])} by ${
						data.wr.nita200[index][1]
					}`,
				},
				{
					name: data.messages[current.lang].difference,
					value: convertMs(
						current.nita200[index] - data.wr.nita200[index][0]
					),
				}
			)
			.setTimestamp();
		await interaction.editReply({
			embeds: [embed],
		});
		return;
	}
	if (command === 'nita200' && subcommand === 'delete') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.nita200[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const pastTime = current.nita200[index];
		delete current.nita200[index];
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Deleted your time on ${track} on 200cc NITA. Your time was ${convertMs(
				pastTime
			)}`
		);
	}
	if (command === 'nita200' && subcommand === 'list') {
		await interaction.deferReply();
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ' | MK8DX NITA on 200cc',
				iconURL: interaction.user.avatarURL(),
			})
			.setDescription(
				data.tracks[current.lang]
					.map((track, index) => {
						index++;
						if (!current.nita200[index]) {
							return `${index}. ${track} - Not registered`;
						}

						const time = current.nita200[index];
						const wrTime = data.wr.nita200[index][0];
						const drop = getDrop(time, wrTime);
						return `${index}. ${track} - ${convertMs(
							time
						)} (${drop} drop)`;
					})
					.join('\n')
			)
			.setTimestamp();
		await interaction.editReply({
			embeds: [embed],
		});
		return;
	}
	if (command === 'ta150' && subcommand === 'register') {
		const track = interaction.options.getString('track');
		let time = interaction.options.getString('time');
		time = convertToMs(time);
		await interaction.deferReply();
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].illegalformat
			);
			return;
		}
		if (data.tracks[current.lang].indexOf(track) === -1) {
			await interaction.editReply(
				data.messages[current.lang].tracknotexists
			);
			return;
		}
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		if (data.wr.ta150[index][0] >= time) {
			await interaction.editReply(
				`${data.messages[current.lang].fasterthanwr}${convertMs(
					data.wr.ta150[index][0]
				)}`
			);
			return;
		}
		if (!current.ta150[index]) {
			current.ta150[index] = time;
			await redis.set(interaction.user.id, JSON.stringify(current));
			await interaction.editReply(
				`Set your time on ${track} on 150cc TA to ${convertMs(time)}`
			);
			return;
		}
		if (current.ta150[index] < time) {
			await interaction.editReply(
				`The time you entered is slower than your best. Your best is ${convertMs(
					current.ta150[index]
				)}`
			);
			return;
		}
		if (current.ta150[index] == time) {
			await interaction.editReply(
				'The time you entered is the same as your best.'
			);
			return;
		}
		let pastTime = current.ta150[index];
		current.ta150[index] = time;
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Congrats! Set your time on ${track} on 150cc TA to ${convertMs(
				time
			)}.\nYou improved your time by ${convertMs(
				pastTime - current.ta150[index]
			)}!\nYour time is slower than the WR by ${convertMs(
				time - data.wr.ta150[index][0]
			)}!`
		);
	}
	if (command === 'ta150' && subcommand === 'show') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.ta150[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ` | MK8DX TA on 150cc - ${track}`,
				iconURL: interaction.user.avatarURL(),
			})
			.addFields(
				{
					name: data.messages[current.lang].yourtime,
					value: `${convertMs(time)} - ${getDrop(
						time,
						data.wr.ta150[index][0]
					)} drop`,
				},
				{
					name: 'WR',
					value: `${convertMs(data.wr.ta150[index][0])} by ${
						data.wr.ta150[index][1]
					}`,
				},
				{
					name: data.messages[current.lang].difference,
					value: convertMs(
						current.ta150[index] - data.wr.ta150[index][0]
					),
				}
			)
			.setTimestamp();
		const link = new ButtonBuilder()
			.setLabel('See WR')
			.setURL(data.wr.ta150[index][2])
			.setStyle(ButtonStyle.Link);
		const row = new ActionRowBuilder().addComponents(link);
		await interaction.editReply({
			embeds: [embed],
			components: [row],
		});
		return;
	}
	if (command === 'ta150' && subcommand === 'delete') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.ta150[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const pastTime = current.ta150[index];
		delete current.ta150[index];
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Deleted your time on ${track} on 150cc TA. Your time was ${convertMs(
				pastTime
			)}`
		);
	}
	if (command === 'ta150' && subcommand === 'list') {
		await interaction.deferReply();
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ' | MK8DX TA on 150cc',
				iconURL: interaction.user.avatarURL(),
			})
			.setDescription(
				data.tracks[current.lang]
					.map((track, index) => {
						index++;
						if (!current.ta150[index]) {
							return `${index}. ${track} - Not registered`;
						}

						const time = current.ta150[index];
						const wrTime = data.wr.ta150[index][0];
						const drop = getDrop(time, wrTime);

						return `${index}. ${track} - ${convertMs(
							time
						)} (${drop} drop)`;
					})
					.join('\n')
			)
			.setTimestamp();
		await interaction.editReply({
			embeds: [embed],
		});
		return;
	}
	if (command === 'ta200' && subcommand === 'register') {
		const track = interaction.options.getString('track');
		let time = interaction.options.getString('time');
		time = convertToMs(time);
		await interaction.deferReply();
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].illegalformat
			);
			return;
		}
		if (data.tracks[current.lang].indexOf(track) === -1) {
			await interaction.editReply(
				data.messages[current.lang].tracknotexists
			);
			return;
		}
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		if (data.wr.ta200[index][0] >= time) {
			await interaction.editReply(
				`${data.messages[current.lang].fasterthanwr}${convertMs(
					data.wr.ta200[index][0]
				)}`
			);
			return;
		}
		if (!current.ta200[index]) {
			current.ta200[index] = time;
			await redis.set(interaction.user.id, JSON.stringify(current));
			await interaction.editReply(
				`Set your time on ${track} on 200cc TA to ${convertMs(time)}`
			);
			return;
		}
		if (current.ta200[index] < time) {
			await interaction.editReply(
				`The time you entered is slower than your best. Your best is ${convertMs(
					current.ta200[index]
				)}`
			);
			return;
		}
		if (current.ta200[index] == time) {
			await interaction.editReply(
				'The time you entered is the same as your best.'
			);
			return;
		}
		current.ta200[index] = time;
		const pastTime = current.ta200[index];
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Congrats! Set your time on ${track} on 2000cc TA to ${convertMs(
				time
			)}.\nYou improved your time by ${convertMs(
				pastTime - current.ta200[index]
			)}!\nYour time is slower than the WR by ${convertMs(
				time - data.wr.ta200[index][0]
			)}!`
		);
	}
	if (command === 'ta200' && subcommand === 'show') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.ta200[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ` | MK8DX TA on 200cc - ${track}`,
				iconURL: interaction.user.avatarURL(),
			})
			.addFields(
				{
					name: data.messages[current.lang].yourtime,
					value: `${convertMs(time)} - ${getDrop(
						time,
						data.wr.ta200[index][0]
					)} drop`,
				},
				{
					name: 'WR',
					value: `${convertMs(data.wr.ta200[index][0])} by ${
						data.wr.ta200[index][1]
					}`,
				},
				{
					name: data.messages[current.lang].difference,
					value: convertMs(
						current.ta200[index] - data.wr.ta200[index][0]
					),
				}
			)
			.setTimestamp();
		const link = new ButtonBuilder()
			.setLabel('See WR')
			.setURL(data.wr.ta200[index][2])
			.setStyle(ButtonStyle.Link);
		const row = new ActionRowBuilder().addComponents(link);
		await interaction.editReply({
			embeds: [embed],
			components: [row],
		});
		return;
	}
	if (command === 'ta200' && subcommand === 'delete') {
		await interaction.deferReply();
		const track = interaction.options.getString('track');
		let current = JSON.parse(await redis.get(interaction.user.id));
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		let index = data.tracks[current.lang].indexOf(track);
		index++;
		const time = current.ta200[index];
		if (!time) {
			await interaction.editReply(
				data.messages[current.lang].notregistered
			);
			return;
		}
		const pastTime = current.ta200[index];
		delete current.ta200[index];
		await redis.set(interaction.user.id, JSON.stringify(current));
		await interaction.editReply(
			`Deleted your time on ${track} on 200cc TA. Your time was ${convertMs(
				pastTime
			)}`
		);
	}
	if (command === 'ta200' && subcommand === 'list') {
		await interaction.deferReply();
		let current = await redis.get(interaction.user.id);
		if (!current)
			await redis.set(interaction.user.id, JSON.stringify(data.default));
		current = JSON.parse(await redis.get(interaction.user.id));
		const embed = new EmbedBuilder()
			.setAuthor({
				name: ' | MK8DX TA on 200cc',
				iconURL: interaction.user.avatarURL(),
			})
			.setDescription(
				data.tracks[current.lang]
					.map((track, index) => {
						index++;
						if (!current.ta200[index]) {
							return `${index}. ${track} - Not registered`;
						}

						const time = current.ta200[index];
						const drop = getDrop(time, data.wr.ta200[index][0]);

						return `${index}. ${track} - ${convertMs(
							time
						)} (${drop} drop)`;
					})
					.join('\n')
			)
			.setTimestamp();
		await interaction.editReply({
			embeds: [embed],
		});
		return;
	}
});

client.login(process.env.TOKEN);

process.on('uncaughtException', (err) => {
	console.log(err.stack);
});
