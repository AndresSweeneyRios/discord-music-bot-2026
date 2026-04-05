import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js"
import { addToQueue, ensureVoiceConnection, resolveTrack } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from a URL or search query")
    .addStringOption(option =>
      option.setName("query").setDescription("A URL or search query").setRequired(true)
    ) as SlashCommandBuilder
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const member = interaction.member as GuildMember

  if (!member.voice.channel) {
    await interaction.reply({ content: "Join a voice channel first.", ephemeral: true })
    return
  }

  await interaction.deferReply()

  const input = interaction.options.getString("query", true)

  let track

  try {
    track = await resolveTrack(input)
  } catch {
    await interaction.editReply("No results found. Check your query and try again.")
    return
  }

  try {
    ensureVoiceConnection(member)
  } catch {
    await interaction.editReply("Failed to join your voice channel.")
    return
  }

  const result = addToQueue(track.title, track.url)

  if (result.queued) {
    await interaction.editReply(`Queued **${track.title}** at position #${result.position}`)
  } else {
    await interaction.editReply(`Now playing **${track.title}**`)
  }
}
