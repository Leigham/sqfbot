const cp = require('child_process');
const { MessageEmbed } = require('discord.js');
const fs = require('fs-extra');
module.exports = {
	name: 'run',
	description: 'run',
	usage : 'You can run sqf directly with `!runsqf code` or \n\\`\\`\\`sqf\ncode here\n\\`\\`\\``',
	async execute(message, args) {
		const channel = message.channel;
		const author = message.author;
		try {
			const p_embed = new MessageEmbed()
				.setTitle('SQF Reqeust')
				.setColor('#fcd703')
				.setFooter(`Requested by ${author.username} (${author.tag})`, '');

			message.delete();
			let code = args.join(' ');

			// -- if the code still includes code block, take the code from inside the code block.
			if (code.includes('```sqf')) {
				code = code.substring(code.indexOf('`') + 6, code.lastIndexOf('`') - 3);
			}

			p_embed.addField('Input', `\`\`\`sqf\n${code}\`\`\``, true);

			// -- Remove any new lines so can be passed through as command line.
			const parsed_code = code.replace(/\n|\r/g, '');
			const rep_message = await channel.send(p_embed);

			// -- Launch the process.
			await cp.execFile('vm/builds/sqfvm', ['-m 0', '--no-execute-print', '-a', '--verbose', `--sqf ${parsed_code}`], { maxBuffer: 1024 * 5000, timeout: 1000 * 10 }, async function(err, stdout, stderr) {
				const files = [];
				if (stdout !== '') {
					if (stdout.length > 1024) {
						await fs.outputFileSync(`logs/${author.id}/stdout.log`, stdout);
						files.push({ attachment : `logs/${author.id}/stdout.log`, name : 'results.log' });
					}
					else {
						p_embed.addField('stdout', `\`\`\`sqf\n${stdout}\`\`\``);
					}
					p_embed.setColor('#35fc03');
				}
				else {
					p_embed.addField('stdout', '```sqf\nNONE```');
				}

				if (stderr !== '') {
					if (stderr.length > 1024) {

						await fs.outputFileSync(`logs/${author.id}/stderr.log`, stderr);
						files.push({ attachment : `logs/${author.id}/stderr.log`, name : 'error.log' });
					}
					else {
						p_embed.addField('stderr', `\`\`\`sqf\n${stderr}\`\`\``);
					}

					p_embed.setColor('#ff0000');
				}

				if (err) {
					console.log(err);

					switch(err.signal) {
					case 'SIGTERM' : {
						p_embed.addField('error', '```Request took to long```');
					}
						break;

					default:
						p_embed.addField('error', `\`\`\`${err.message}\`\`\``);
					}


					p_embed.setColor('#ff0000');
				}

				channel.send({ embed : p_embed, files : files }).catch(err => channel.send(err.message));
				rep_message.delete();
			});
		}
		catch(err) {
			message.channel.send(err.message);
			console.log(err);
		}
	},
};