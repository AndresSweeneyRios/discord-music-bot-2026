import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { getNowPlaying, skip as skipTrack } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song")
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const current = getNowPlaying()

  if (!current) {
    await interaction.reply({ content: "Nothing is currently playing.", ephemeral: true })
    return
  }

  const title = current.title
  skipTrack()
  await interaction.reply(`Skipped **${title}**.`)
}
