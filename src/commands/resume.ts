import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { getNowPlaying, resume as resumePlayer } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the current song")
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const current = getNowPlaying()

  if (!current) {
    await interaction.reply({ content: "Nothing is currently playing.", ephemeral: true })
    return
  }

  const success = resumePlayer()

  if (!success) {
    await interaction.reply({ content: "Could not resume. Already playing?", ephemeral: true })
    return
  }

  await interaction.reply(`Resumed **${current.title}**.`)
}
