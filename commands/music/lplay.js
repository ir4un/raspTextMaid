import { SlashCommandBuilder } from '@discordjs/builders';
import path from 'path';
import djs from 'discord.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { QueryType } from 'discord-player';
import { parseFile } from 'music-metadata'; // Import the music-metadata library
const { EmbedBuilder } = djs;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];

async function findFileByName(baseName, directory) {
    const lowerCaseBaseName = baseName.toLowerCase();
    for (const ext of SUPPORTED_FORMATS) {
        const filePath = path.join(directory, `${lowerCaseBaseName}${ext}`);
        try {
            await fs.access(filePath);
            return filePath;
        } catch {
            // Continue checking other formats
        }
    }
    return null;
}

async function getTrackDuration(filePath) {
    try {
        const metadata = await parseFile(filePath);
        const duration = metadata.format.duration; // Duration in seconds
        return formatDuration(duration); // Format the duration
    } catch (error) {
        console.error('Error reading metadata:', error);
        return '0:00';
    }
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}



export const commandTitle = {
    data: new SlashCommandBuilder()
        .setName('lplay')
        .setDescription('Load a local song file')
        .addStringOption(option =>
            option
                .setName('filename')
                .setDescription('The name of the song file in the local directory (without extension)')
                .setRequired(true)
        ),
    run: async ({ client, interaction }) => {
        if (!interaction.member.voice.channel) {
            return interaction.editReply('You need to be in a voice channel to use this command.');
        }

        const baseName = interaction.options.getString('filename').toLowerCase();
        const directory = path.join(__dirname, '..', '..', 'resources', 'song-files');

        try {
            const filePath = await findFileByName(baseName, directory);
            if (!filePath) {
                return interaction.editReply("Sorry, I couldn't find that song in the directory.");
            }

            const duration = await getTrackDuration(filePath); // Get the duration of the track

            // Create or get the queue for the guild
            const queue = await client.player.nodes.create(interaction.guild, {
                leaveOnEnd: false,
                metadata: {
                    channel: interaction.channel,
                },
            });

            // Connect to the voice channel if not already connected
            if (!queue.connection) {
                await queue.connect(interaction.member.voice.channel);
            }

            const result = await client.player.search(filePath, {
                requestedBy: interaction.user,
                searchEngine: QueryType.FILE,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply("Sorry, I couldn't find that song in the directory.");
            }

            const track = result.tracks[0];
            track.duration = duration; // Set the correct duration
            await queue.addTrack(track);

            // Play the song if the queue isn't already playing
            if (!queue.isPlaying()) {
                await queue.node.play();
            }

            const embed = new EmbedBuilder()
                .setDescription(`**[${track.title}]** has been added to the song queue nyaa~`)
                .setFooter({ text: `Duration: ${duration} (Song from local file system)` });
            await interaction.editReply({
                embeds: [embed],
            });
        } catch (err) {
            console.error('Error in lplay command:', err);
            return interaction.editReply('An error occurred while trying to play the song.');
        }
    },
    prefixRun: async (client, message, args) => {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send('You need to be in a voice channel to use this command.');
        }

        const baseName = args.join(' ').toLowerCase();
        const directory = path.join(__dirname, '..', '..', 'resources', 'song-files');

        try {
            const filePath = await findFileByName(baseName, directory);
            if (!filePath) {
                return message.channel.send("Sorry, I couldn't find that song in the directory.");
            }

            const duration = await getTrackDuration(filePath); // Get the duration of the track

            // Create or get the queue for the guild
            const queue = await client.player.nodes.create(message.guild, {
                leaveOnEnd: false,
                metadata: {
                    channel: message.channel,
                },
            });

            // Connect to the voice channel if not already connected
            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }

            const result = await client.player.search(filePath, {
                requestedBy: message.author,
                searchEngine: QueryType.FILE,
            });

            if (result.tracks.length === 0) {
                return message.channel.send("Sorry, I couldn't find that song in the directory.");
            }

            const track = result.tracks[0];
            await queue.addTrack(track);

            // Play the song if the queue isn't already playing
            if (!queue.isPlaying()) {
                await queue.node.play();
            }

            const embed = new EmbedBuilder()
                .setDescription(`**[${track.title}]** has been added to the song queue nyaa~`)
                .setFooter({ text: `Duration: ${duration} (Song from local file system)` });
            await message.channel.send({
                embeds: [embed],
            });
        } catch (err) {
            console.error('Error in lplay command (prefix):', err);
            return message.channel.send('An error occurred while trying to play the song.');
        }
    },
};