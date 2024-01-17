require('dotenv').config();

const discord = require('discord.js');
const { IntegrationApplication } = require('discord.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { create } = require('domain');

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
});

redis.on('error', (err) => {
    console.log(err.stack);
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isAutocomplete) return;
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isAutocomplete()) return;
    const command = interaction.commandName;
    const subcommand = interaction.options.getSubcommand();
    if (command === 'nita' && subcommand === 'register') {
        const track = interaction.options.getString('track');
        const time = interaction.options.getString('time');
        interaction.reply('Hi!');
    }
});

client.login(process.env.TOKEN);

process.on('uncaughtException', (err) => {
    console.log(err.stack);
});
