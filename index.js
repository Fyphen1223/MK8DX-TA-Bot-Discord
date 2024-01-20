require('dotenv').config();

const discord = require('discord.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const data = require('./data/latest.json');
const { convertMs, convertToMs } = require('./util/util');

const { createClient } = require('redis');
const { EmbedBuilder } = require('discord.js');
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
        discord.GatewayIntentBits.GuildInvites,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.MessageContent,
    ],
    partials: [
        discord.Partials.Channel,
        discord.Partials.GuildMember,
        discord.Partials.Message,
        discord.Partials.User,
    ],
});

client.on('ready', () => {
    console.log('Logged in');
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
    const subcommand = interaction.options.getSubcommand();
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
    const subcommand = interaction.options.getSubcommand();
    if (command === 'config' && subcommand === 'lang') {
        await interaction.deferReply();
        const lang = interaction.options.getString('lang');
        let current = JSON.parse(await redis.get(interaction.user.id));
        current.lang = lang;
        await redis.set(interaction.user.id, JSON.stringify(current));
        await interaction.editReply(`Changed your language to ${lang}`);
    }
    if (command === 'nita150' && subcommand === 'register') {
        const track = interaction.options.getString('track');
        let time = interaction.options.getString('time');
        if (!convertToMs(time)) {
            await interaction.reply('Format is illegal.');
            return;
        }
        time = convertToMs(time);
        await interaction.deferReply();
        let current = await redis.get(interaction.user.id);
        if (!current)
            await redis.set(interaction.user.id, JSON.stringify(data.default));
        current = JSON.parse(await redis.get(interaction.user.id));
        if (data.tracks[current.lang].indexOf(track) === -1) {
            await interaction.editReply('The track does not exist.');
            return;
        }
        let index = data.tracks[current.lang].indexOf(track);
        index++;
        if (data.wr.nita150[index][0] >= time) {
            await interaction.editReply(
                `Your time is faster than current WR. Current WR: ${convertMs(
                    data.wr.ta150[index][0]
                )}\nPlease submit your WR on https://mkwrs.com/mk8dx/`
            );
            return;
        }
        if (!current.nita150[index]) {
            current.nita150[index] = time;
            await redis.set(interaction.user.id, JSON.stringify(current));
            await interaction.editReply(
                `Set your time on ${track} on 150cc TA to ${convertMs(time)}`
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
        current.nita150[index] = time;
        await redis.set(interaction.user.id, JSON.stringify(current));
        await interaction.editReply(
            `Set your time on ${track} on 150cc NITA to ${convertMs(time)}`
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
                `You haven't registered this track's time.`
            );
            return;
        }
        await interaction.editReply(
            `Your time on ${track} on 150cc NITA is ${convertMs(
                time
            )}. \nYour time is ${convertMs(
                current.nita150[index] - data.wr.nita150[index][0]
            )} slower than the world record.`
        );
        return;
    }
    if (command === 'nita200' && subcommand === 'register') {
        const track = interaction.options.getString('track');
        let time = interaction.options.getString('time');
        if (!convertToMs(time)) {
            await interaction.reply('Format is illegal.');
            return;
        }
        time = convertToMs(time);
        await interaction.deferReply();
        let current = await redis.get(interaction.user.id);
        if (!current)
            await redis.set(interaction.user.id, JSON.stringify(data.default));
        current = JSON.parse(await redis.get(interaction.user.id));
        if (data.tracks[current.lang].indexOf(track) === -1) {
            await interaction.editReply('The track does not exist.');
            return;
        }
        let index = data.tracks[current.lang].indexOf(track);
        index++;
        if (data.wr.ta200[index][0] >= time) {
            await interaction.editReply(
                `Your time is faster than current WR. Current WR: ${convertMs(
                    data.wr.ta200[index][0]
                )}\nPlease submit your WR on https://mkwrs.com/mk8dx/`
            );
            return;
        }
        if (!current.ta150[index]) {
            current.ta150[index] = time;
            await redis.set(interaction.user.id, JSON.stringify(current));
            await interaction.editReply(
                `Set your time on ${track} on 200cc NITA to ${convertMs(time)}`
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
        await redis.set(interaction.user.id, JSON.stringify(current));
        await interaction.editReply(
            `Set your time on ${track} on 200cc NITA to ${convertMs(time)}`
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
                `You haven't registered this track's time.`
            );
            return;
        }
        await interaction.editReply(
            `Your time on ${track} on 200cc NITA is ${convertMs(
                time
            )}. \nYour time is ${convertMs(
                current.nita200[index] - data.wr.nita200[index][0]
            )} slower than the world record.`
        );
        return;
    }
    if (command === 'ta150' && subcommand === 'register') {
        const track = interaction.options.getString('track');
        let time = interaction.options.getString('time');
        if (!convertToMs(time)) {
            await interaction.reply('Format is illegal.');
            return;
        }
        time = convertToMs(time);
        await interaction.deferReply();
        let current = await redis.get(interaction.user.id);
        if (!current)
            await redis.set(interaction.user.id, JSON.stringify(data.default));
        current = JSON.parse(await redis.get(interaction.user.id));
        if (data.tracks[current.lang].indexOf(track) === -1) {
            await interaction.editReply('The track does not exist.');
            return;
        }
        let index = data.tracks[current.lang].indexOf(track);
        index++;
        if (data.wr.ta150[index][0] >= time) {
            await interaction.editReply(
                `Your time is faster than current WR. Current WR: ${convertMs(
                    data.wr.ta150[index][0]
                )}\nPlease submit your WR on https://mkwrs.com/mk8dx/`
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
                `You haven't registered this track's time.`
            );
            return;
        }
        const embed = new EmbedBuilder()
        .setTitle(`MK8DX Time Attack - ${track}`)
        .addFields(
            {
                name: 'Your Time',
                value: convertMs(time)
            },
            {
                name: 'WR',
                value: convertMs(current.ta150[index])
            },
            {
                name: 'Difference',
                value: convertMs(current.ta150[index] - data.wr.ta150[index][0])
            }
        )
        .setTimestamp();
        await interaction.editReply(
            `Your time on ${track} on 150cc TA is ${convertMs(
                time
            )}. \nYour time is ${convertMs(
                current.ta150[index] - data.wr.ta150[index][0]
            )} slower than the world record.`
        );
        return;
    }
    if (command === 'ta200' && subcommand === 'register') {
        const track = interaction.options.getString('track');
        let time = interaction.options.getString('time');
        if (!convertToMs(time)) {
            await interaction.reply('Format is illegal.');
            return;
        }
        time = convertToMs(time);
        await interaction.deferReply();
        let current = await redis.get(interaction.user.id);
        if (!current)
            await redis.set(interaction.user.id, JSON.stringify(data.default));
        current = JSON.parse(await redis.get(interaction.user.id));
        if (data.tracks[current.lang].indexOf(track) === -1) {
            await interaction.editReply('The track does not exist.');
            return;
        }
        let index = data.tracks[current.lang].indexOf(track);
        index++;
        if (data.wr.ta200[index][0] >= time) {
            await interaction.editReply(
                `Your time is faster than current WR. Current WR: ${convertMs(
                    data.wr.ta200[index][0]
                )}\nPlease submit your WR on https://mkwrs.com/mk8dx/`
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
                `You haven't registered this track's time.`
            );
            return;
        }
        await interaction.editReply(
            `Your time on ${track} on 200cc TA is ${convertMs(
                time
            )}. \nYour time is ${convertMs(
                current.ta200[index] - data.wr.ta200[index][0]
            )} slower than the world record.`
        );
        return;
    }
});

client.login(process.env.TOKEN);

process.on('uncaughtException', (err) => {
    console.log(err.stack);
});
