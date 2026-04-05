import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { moveInQueue } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move a song from one position to another in the queue")
    .addIntegerOption(option =>
      option.setName("from").setDescription("The current position of the song").setRequired(true).setMinValue(1)
    )
    .addIntegerOption(option =>
      option.setName("to").setDescription("The position to move it to").setRequired(true).setMinValue(1)
    ) as SlashCommandBuilder
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const from = interaction.options.getInteger("from", true)
  const to = interaction.options.getInteger("to", true)

  const success = moveInQueue(from, to)

  if (!success) {
    await interaction.reply({ content: "Invalid positions. Check the queue and try again.", ephemeral: true })
    return
  }

  await interaction.reply(`Moved track from position #${from} to #${to}.`)
}
