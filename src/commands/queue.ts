import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { getNowPlaying, getQueue } from "../yt"

export const builder = async () => {
  return new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current queue")
}

export const execute = async (interaction: ChatInputCommandInteraction): Promise<void> => {
  const current = getNowPlaying()

  if (!current) {
    await interaction.reply("Nothing is currently playing.")
    return
  }

  const tracks = getQueue()
  const lines: string[] = [`Now playing: **${current.title}**`]

  if (tracks.length === 0) {
    lines.push("\nThe queue is empty.")
  } else {
    lines.push("")
    tracks.forEach((track, i) => {
      lines.push(`${i + 1}. ${track.title}`)
    })
  }

  await interaction.reply(lines.join("\n"))
}
