import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { removeFromQueue } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the queue by position")
    .addIntegerOption(option =>
      option.setName("position").setDescription("The position in the queue to remove").setRequired(true).setMinValue(1)
    ) as SlashCommandBuilder
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const position = interaction.options.getInteger("position", true)
  const removed = removeFromQueue(position)

  if (!removed) {
    await interaction.reply({ content: `No track at position #${position}.`, ephemeral: true })
    return
  }

  await interaction.reply(`Removed **${removed.title}** from the queue.`)
}
