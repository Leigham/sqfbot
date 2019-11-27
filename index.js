const Discord = require('discord.js');
const { prefix, discord_token } = require('./config.json');
const client = new Discord.Client();
const fs = require('fs-extra');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	client.user.setUsername('SQF');
	console.log('Ready!');
});

client.on('message', async message => {
	if (message.author.bot) return;
	switch (true) {
	case (message.content.startsWith(prefix)) :
	{
		const args = message.content.slice(prefix.length).split(/ +/);
		const command = args.shift().toLowerCase();
		if (!client.commands.has(command)) return;

		try {
			client.commands.get(command).execute(message, args);
		}
		catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
		break;
	}
	case (message.content.startsWith('```sqf')) :
	{
		try {
			const code = message.content.substring(6, message.content.lastIndexOf('`') - 3);
			const args = code.split(/ +/);
			client.commands.get('run').execute(message, args);
			/*
			const code = message.content.substring(6, message.content.length - 3);
			const embed = new Discord.MessageEmbed()
				.setColor('#fcd703')
				.addField('Input', `\`\`\`sqf${code}\`\`\``, true)
				.setFooter('Some footer text here', '');

			const embed_message = await message.channel.send(embed);
			message.delete();
			cp.execFile('vm/builds/sqfvm', ['-m 0', '--no-execute-print', '-a', '--verbose', `--sqf ${code.replace(/\n|\r/g, '')}`], { maxBuffer: 1024 * 10000, timeout: 1000 * 60 }, async function(err, stdout, stderr) {
				if (err) {
					console.log(stderr);
					console.log(stdout);
					embed.setColor('#ff0000');

					const files = [];

					if (stderr) {
						await fs.outputFileSync(`${message.author.id}_err.log`, stderr);
						files.push({
							attachment: `${message.author.id}_err.log`,
							name: 'err.log',
						});
						stderr = 'err.log';
					}
					if (stdout) {
						await fs.outputFileSync(`${message.author.id}_out.log`, stdout);
						files.push({
							attachment: `${message.author.id}_out.log`,
							name: 'out.log',
						});
						stdout = 'out.log';
					}


					if (err.signal === 'SIGTERM') {
						embed.addField('error', '```sqf\nProcess Took to long!```');
						await embed_message.channel.send({
							embed: embed,
							files: files,
						});
						return embed_message.delete();
					}
					else {
						if (err.code) {
							embed.addField('Error Code', `\`\`\`sqf\n${err.code}\`\`\``);
						}
						embed.addField('Error Signal', `\`\`\`sqf\n${err.signal}\`\`\``);
						embed.addField('Error Message', `\`\`\`sqf\n${err.message}\`\`\``);
						embed.addField('Error Stack', `\`\`\`sqf\n${err.stack}\`\`\``);
						return embed_message.edit(embed);
					}
				}

				const out = stdout;

				if (out.length > 1500) {
					embed.addField('result', 'The results for this was too long for one message, and was sent to your inbox!');
					await fs.outputFileSync(`${message.author.id}_out.log`, out);
					if (stderr !== '') {
						// message.author.send(`\`\`\`sqf\n${stderr}\`\`\``);
					}

					embed_message.channel.send({
						embed: embed,
						files: [{
							attachment: `${message.author.id}_out.log`,
							name: 'file.log',
						}],
					});
					embed_message.delete();
					return;
				}
				else {
					if (stderr !== '') {
						embed.setColor('#ff0000');
						embed.addField('error', `\`\`\`${out}\n${stderr}\`\`\``);
					}
					else {
						embed.setColor('#35fc03');
						embed.addField('result', `\`\`\`sqf\n${out}\`\`\``);
					}
					embed_message.edit(embed);
				}
				return;
			});*/
		}
		catch(err) {
			// message.channel.send(`\`\`\`sqf\n${err.message}\`\`\``);
		}
		break;
	}
	case (message.mentions.users.has(client.user.id)) :
	{
		// -- Remove Mentions
		client.commands.get('run').execute(message, message.content.split(/ +/).filter(arg => !Discord.MessageMentions.USERS_PATTERN.test(arg)));
		break;
	}
	case (message.content.startsWith('```cpp')) :
	{
		console.log('Parsing Config');
		break;
	}
	}
});

client.login(discord_token);

