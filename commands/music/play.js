import djs from 'discord.js';
import { SlashCommandBuilder } from "@discordjs/builders";
const { EmbedBuilder } = djs;
import { QueryType } from 'discord-player';

export const commandTitle = {
    data: new SlashCommandBuilder() // Details related to the play slash command
        .setName("play")
        .setDescription("load songs from Youtube")
        .addStringOption((option) => option.setName("urlsearchterm").setDescription("Search term or a url of a song").setRequired(true)),
    // .addSubcommand((subcommand) =>
    //     subcommand
    //     .setName("song")
    //     .setDescription("Load a single song from a url")
    //     .addStringOption((option) => option.setName("url").setDescription("the song url").setRequired(true))
    // )
    // .addSubcommand((subcommand) =>
    //     subcommand
    //     .setName("playlist")
    //     .setDescription("Load a playlist  song from a url")
    //     .addStringOption((option) => option.setName("url").setDescription("the playlist url").setRequired(true))
    // )
    // .addSubcommand((subcommand) =>
    //     subcommand
    //     .setName("search")
    //     .setDescription("Search for songs based on provided keyword")
    //     .addStringOption((option) => option.setName("searchterms").setDescription("the search keyword").setRequired(true))
    // ),
    run: async ({ client, interaction }) => {
        // Check if the user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.editReply("Sorry masta, but you need to be in a voice channel for me to play the song for you.");
        }

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


        // Prepare the embed for responses
        let embed = new EmbedBuilder();
        let url = interaction.options.getString("urlsearchterm");

        // Handle playlist search
        if (url.includes("playlist")) {
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply("I couldn't find songs for you master nyaa~");
            }

            const playlist = result.playlist;
            await queue.addTracks(result.tracks);
            embed.setDescription(`**${result.tracks.length}** tracks from **[${playlist.title}](${playlist.url})** have been added to the song queue nyaa~`)
                .setThumbnail(playlist.thumbnail);

        } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply("I couldn't find songs for you master nyaa~");
            }

            const song = result.tracks[0];
            await queue.addTrack(song);
            embed.setDescription(`**[${song.title}](${song.url})** has been added to the song queue nyaa~`)
                .setThumbnail(song.thumbnail)  // Changed from `song.setThumbnail` to `song.thumbnail`
                .setFooter({ text: `Duration: ${song.duration}` });

        } else {
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply("I couldn't find songs for you master nyaa~");
            }

            const song = result.tracks[0];
            await queue.addTrack(song);
            embed.setDescription(`**[${song.title}](${song.url})** has been added to the song queue nyaa~`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` });
        }



        // Play the song if the queue isn't already playing
        if (!queue.isPlaying()) {
            // Start playing if nothing is currently playing
            await queue.node.play();
        }

        // Send the reply with the embed
        await interaction.editReply({
            embeds: [embed],
        });
    }
    ,
    prefixRun: async (client, message, args) => {
        const voiceChannel = message.member.voice.channel;

        // 1. Check if the user is in a voice channel
        if (!voiceChannel) {
            return message.channel.send("Sorry masta, but you need to be in a voice channel for me to play the song for you.");
        }

        // 2. Check if a queue already exists for the guild; create one if it doesn't
        let queue = client.player.nodes.get(message.guild.id);
        if (!queue) {
            queue = await client.player.nodes.create(message.guild, {
                leaveOnEnd: false,
                metadata: {
                    channel: message.channel,
                },
            });

            // Connect to the voice channel if no connection exists
            if (!queue.connection) {
                await queue.connect(voiceChannel);
            }
        }

        // 3. Search for the song using the provided arguments (URL or search term)
        let searchTerm = args.join(" ");
        if (!searchTerm) {
            return message.channel.send("Please provide a song name or URL, master.");
        }

        const result = await client.player.search(searchTerm, {
            requestedBy: message.author,
            searchEngine: QueryType.AUTO,
        });

        if (!result || result.tracks.length === 0) {
            return message.channel.send("I couldn't find songs for you master nyaa~");
        }

        // 4. Add the song to the queue
        const song = result.tracks[0];
        await queue.addTrack(song);
        // Prepare the embed with song details
        const embed = new EmbedBuilder()
            .setDescription(`**[${song.title}](${song.url})** has been added to the song queue nyaa~`)
            .setThumbnail(song.thumbnail)
            .setFooter({ text: `Duration: ${song.duration}` });

        // 5. Play the song if the queue is not already playing

        if (!queue.isPlaying()) {
            await queue.node.play();
        }

        // 6. Send confirmation message with the embed
        await message.channel.send({
            embeds: [embed],
        });
    }

};

