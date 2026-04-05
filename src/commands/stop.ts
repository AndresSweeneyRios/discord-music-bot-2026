import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { stop as stopAll } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback, clear the queue, and leave the voice channel")
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  stopAll()
  await interaction.reply("Stopped playback and left the voice channel.")
}
