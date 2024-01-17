require('dotenv').config();
const { REST, SlashCommandBuilder, Routes } = require('discord.js');
const start = new Date();
const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with ping'),
	new SlashCommandBuilder()
		.setName('nita')
		.setDescription('No Item Time Attack')
		.setDMPermission(true)
        .addSubcommand(subcommand => 
            subcommand.setName('register')
            .setDescription('Register your time')
            .addStringOption(option =>
                option.setAutocomplete(true)
                .setName('title')
                .setDescription('The track you want to register score on'))
            .addStringOption(option =>
                option.setName('time')
                .setDescription('Time formatted in next format: 2:21.18')))
        .addSubcommand(subcommand =>
            subcommand.setName('show')
            .setDescription('Show your time on the specified track')
            .addStringOption(option =>
                option.setAutocomplete(true)
                .setName('track')
                .setDescription('The track you want to see the time')))
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationCommands(process.env.ID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands with ${(new Date() - start) / 1000}s`))
	.catch(console.error);