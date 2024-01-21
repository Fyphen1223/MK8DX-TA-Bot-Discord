require('dotenv').config();
const { REST, SlashCommandBuilder, Routes } = require('discord.js');
const start = new Date();
const commands = [
	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with ping'),
	new SlashCommandBuilder()
		.setName('nita150')
		.setDescription('No Item Time Attack 150cc')
		.setDMPermission(true)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('register')
				.setDescription('Register your time')
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setName('track')
						.setRequired(true)
						.setDescription(
							'The track you want to register score on'
						)
				)
				.addStringOption((option) =>
					option
						.setRequired(true)
						.setName('time')
						.setDescription(
							'Time should be formatted in next format: mm:ss.ss (2:23.198)'
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('show')
				.setDescription('Show your time on the specified track')
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setName('track')
						.setRequired(true)
						.setDescription('The track you want to see the time')
				)
		),
	new SlashCommandBuilder()
		.setName('nita200')
		.setDescription('No Item Time Attack 200cc')
		.setDMPermission(true)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('register')
				.setDescription('Register your time')
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setRequired(true)
						.setName('track')
						.setDescription(
							'The track you want to register score on'
						)
				)
				.addStringOption((option) =>
					option
						.setRequired(true)
						.setName('time')
						.setDescription(
							'Time should be formatted in next format: mm:ss.ss (2:23.198)'
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('show')
				.setDescription('Show your time on the specified track')
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setRequired(true)
						.setName('track')
						.setDescription('The track you want to see the time')
				)
		),
	new SlashCommandBuilder()
		.setName('ta200')
		.setDescription('Time Attack 200cc')
		.setDMPermission(true)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('register')
				.setDescription('Register your time')
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setRequired(true)
						.setName('track')
						.setDescription(
							'The track you want to register score on'
						)
				)
				.addStringOption((option) =>
					option
						.setRequired(true)
						.setName('time')
						.setDescription(
							'Time should be formatted in next format: mm:ss.ss (2:23.198)'
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('show')
				.setDescription('Show your time on the specified track')
				.addStringOption((option) =>
					option
						.setRequired(true)
						.setAutocomplete(true)
						.setName('track')
						.setDescription('The track you want to see the time')
				)
		),
	new SlashCommandBuilder()
		.setName('ta150')
		.setDescription('Time Attack 150cc')
		.setDMPermission(true)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('register')
				.setDescription('Register your time')
				.addStringOption((option) =>
					option
						.setAutocomplete(true)
						.setRequired(true)
						.setName('track')
						.setDescription(
							'The track you want to register score on'
						)
				)
				.addStringOption((option) =>
					option
						.setRequired(true)
						.setName('time')
						.setDescription(
							'Time should be formatted in next format: mm:ss.ss (2:23.198)'
						)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('show')
				.setDescription('Show your time on the specified track')
				.addStringOption((option) =>
					option
						.setRequired(true)
						.setAutocomplete(true)
						.setName('track')
						.setDescription('The track you want to see the time')
				)
		),
	new SlashCommandBuilder()
		.setName('config')
		.setDescription('Configure your settings')
		.setDMPermission(true)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('lang')
				.setDescription('Change your language')
				.addStringOption((option) =>
					option
						.setRequired(true)
						.setName('lang')
						.setDescription('Language')
						.addChoices(
							{ name: 'en', value: 'en' },
							{ name: 'ja', value: 'ja' }
						)
				)
		),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationCommands(process.env.ID), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands with ${(new Date() - start) / 1000}s`))
	.catch(console.error);