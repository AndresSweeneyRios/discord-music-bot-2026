import { Client, GatewayIntentBits, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPutAPIApplicationCommandsResult, Routes } from "discord.js"
import { TOKEN, CLIENT_ID } from "../config.json"
import { CommandResolver, commandResolvers } from "./commands"

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error)
})

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error)
})

const init = async (): Promise<void> => {
  const interactions = new Map<string, CommandResolver["execute"]>()

  client.on("clientReady", async () => {
    console.log(`Logged in as ${client.user?.tag}!`)

    try {
      const commandPromises: Promise<RESTPostAPIChatInputApplicationCommandsJSONBody>[] = []

      for (const commandResolver of commandResolvers) {
        const { builder, execute } = commandResolver

        commandPromises.push(new Promise<RESTPostAPIChatInputApplicationCommandsJSONBody>(async (resolve, reject) => {
          try {
            const command = await builder()
            interactions.set(command.name, execute)
            resolve(command.toJSON())
          } catch (error) {
            reject(error)
          }
        }))
      }

      const data = (await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: (await Promise.all(commandPromises))
      })) as RESTPutAPIApplicationCommandsResult

      console.log(`Registered ${data.length} command(s).`)
    } catch (error) {
      console.error("Failed to register commands:", error)
    }
  })

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const execute = interactions.get(interaction.commandName)

    if (!execute) return

    try {
      await execute(interaction)
    } catch (error: unknown) {
      console.error(`Error executing /${interaction.commandName}:`, error)

      try {
        const message = "Something went wrong while running that command."

        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(message)
        } else {
          await interaction.reply({ content: message, ephemeral: true })
        }
      } catch {}
    }
  })
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

const rest: REST = new REST().setToken(TOKEN)
client.login(TOKEN)

init().catch(console.error)
