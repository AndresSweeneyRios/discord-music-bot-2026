import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { getNowPlaying, pause as pausePlayer } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song")
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const current = getNowPlaying()

  if (!current) {
    await interaction.reply({ content: "Nothing is currently playing.", ephemeral: true })
    return
  }

  const success = pausePlayer()

  if (!success) {
    await interaction.reply({ content: "Could not pause. Already paused?", ephemeral: true })
    return
  }

  await interaction.reply(`Paused **${current.title}**.`)
}
