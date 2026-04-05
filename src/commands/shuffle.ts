import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { getQueue, shuffleQueue } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the queue")
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const tracks = getQueue()

  if (tracks.length < 2) {
    await interaction.reply({ content: "Not enough songs in the queue to shuffle.", ephemeral: true })
    return
  }

  shuffleQueue()
  await interaction.reply(`Shuffled ${tracks.length} songs in the queue.`)
}
