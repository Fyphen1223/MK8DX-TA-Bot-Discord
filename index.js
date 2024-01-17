require('dotenv').config();

const discord = require('discord.js');
const { IntegrationApplication } = require('discord.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const data = require('./data/data.json');

const { createClient } = require('redis');
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

redis.on('ready', () => {
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
    if (subcommand === 'register') {
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
        const time = interaction.options.getString('time');
        await interaction.deferReply();
        let current = await redis.get(interaction.user.id);
        if (!current)
            await redis.set(interaction.user.id, JSON.stringify(data.default));
        current = JSON.parse(await redis.get(interaction.user.id));
        if (data.tracks[current.lang].indexOf(track) === -1) {
            await interaction.editReply('The track does not exist.');
            return;
        }
    }
});

client.login(process.env.TOKEN);

process.on('uncaughtException', (err) => {
    console.log(err.stack);
});
