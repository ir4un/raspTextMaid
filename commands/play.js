const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Message } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
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

        // Checks if the user is inside a voice channel
        if (!interaction.member.voice.channel)
            return interaction.editReply("Sorry masta, but you need to be in a voice channel for me to play the song for you")

        const queue = await client.player.createQueue(interaction.guild, {
            leaveOnEnd: false,
            // leaveOnStop: false,
            // leaveOnEmpty: false,
            // leaveOnEmptyCooldown: 10000
        })
        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        let embed = new MessageEmbed()

        if (interaction.options.getString("urlsearchterm").includes("playlist")) {

            let url = interaction.options.getString("urlsearchterm")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })
            if (result.tracks.length === 0)
                return interaction.editReply("I couldn't find songs for you master nyaa~");

            const playlist = result.playlist;
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length}** tracks from **[${playlist.title}](${playlist.url})** has been added to the song queue nyaa~`)
                .setThumbnail(playlist.thumbnail)
            // .setFooter({ text: `Duration: ${playlist.duration}` })



        } else if (interaction.options.getString("urlsearchterm").includes("youtube.com") &&
            interaction.options.getString("urlsearchterm").includes("youtu.be.com")) {

            let url = interaction.options.getString("urlsearchterm")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if (result.tracks.length === 0)
                return interaction.editReply("I couldn't find songs for you master nyaa~");

            const song = result.tracks[0];
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the song queue nyaa~`)
                .setThumbnail(song.setThumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })

        } else {

            let url = interaction.options.getString("urlsearchterm")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })
            if (result.tracks.length === 0)
                return interaction.editReply("I couldn't find songs for you master nyaa~");

            const song = result.tracks[0];
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the song queue nyaa~`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })

        }

        if (!queue.playing) await queue.play();

        await interaction.editReply({
            embeds: [embed]
        })
    }
};

module.exports.prefixRun = async (client, message, args) => {

    const vc = message.member.voice.channel;
    // Checks if the user is inside a voice channel
    if (!vc)
        return message.channel.send("Sorry masta, but you need to be in a voice channel for me to play the song for you")

    const queue = await client.player.createQueue(message.guild, {
        leaveOnEnd: false,
        // leaveOnStop: false,
        // leaveOnEmpty: false,
        // leaveOnEmptyCooldown: 10000
    })
    if (!queue.connection) await queue.connect(vc)

    let embed = new MessageEmbed()

    // if (args.includes("playlist")) {

    // let url = interaction.options.getString("urlsearchterm")
    // const result = await client.player.search(url, {
    //     requestedBy: interaction.user,
    //     searchEngine: QueryType.YOUTUBE_PLAYLIST
    // })
    // if (result.tracks.length === 0)
    //     return interaction.editReply("I couldn't find songs for you master nyaa~");

    // const playlist = result.playlist;
    // await queue.addTracks(result.tracks)
    // embed
    //     .setDescription(`**${result.tracks.length}** tracks from **[${playlist.title}](${playlist.url})** has been added to the song queue nyaa~`)
    //     .setThumbnail(playlist.thumbnail)
    // .setFooter({ text: `Duration: ${playlist.duration}` })



    // } else if (interaction.options.getString("urlsearchterm").includes("youtube.com") &&
    //     interaction.options.getString("urlsearchterm").includes("youtu.be.com")) {

    // let url = interaction.options.getString("urlsearchterm")
    // const result = await client.player.search(url, {
    //     requestedBy: interaction.user,
    //     searchEngine: QueryType.YOUTUBE_VIDEO
    // })
    // if (result.tracks.length === 0)
    //     return interaction.editReply("I couldn't find songs for you master nyaa~");

    // const song = result.tracks[0];
    // await queue.addTrack(song)
    // embed
    //     .setDescription(`**[${song.title}](${song.url})** has been added to the song queue nyaa~`)
    //     .setThumbnail(song.setThumbnail)
    //     .setFooter({ text: `Duration: ${song.duration}` })

    // } else {

    let url = args.join(" ");
    const result = await client.player.search(url, {
        requestedBy: message.author.user,
        searchEngine: QueryType.AUTO
    })
    if (result.tracks.length === 0)
        return message.channel.send("I couldn't find songs for you master nyaa~")

    const song = result.tracks[0];
    await queue.addTrack(song)
    embed
        .setThumbnail(song.setThumbnail)
        .setDescription(`**[${song.title}](${song.url})** has been added to the song queue nyaa~`)
        .setFooter({ text: `Duration: ${song.duration}` })

    //}

    if (!queue.playing) await queue.play();

    await message.channel.send({
        embeds: [embed]
    })
}