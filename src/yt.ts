import { execFile } from "node:child_process"
import path from "node:path"
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice"
import * as fs from "fs/promises"
import { PassThrough } from "node:stream"
import * as prism from "prism-media"
import type { GuildMember } from "discord.js"

const PROJECT_ROOT = path.resolve(__dirname, "..")
const YT_DLP_PATH = path.join(PROJECT_ROOT, "bin", "yt-dlp.exe")
const AUDIO_PATH = path.join(PROJECT_ROOT, "audio.opus")

export interface Track {
  title: string
  url: string
}

const queue: Track[] = []
let nowPlaying: Track | null = null
let connection: VoiceConnection | null = null
let generation = 0
let manualStop = false

export const player = createAudioPlayer()

player.on(AudioPlayerStatus.Idle, () => {
  if (manualStop) {
    manualStop = false
    return
  }

  nowPlaying = null
  playNext()
})

player.on("error", (error) => {
  console.error("Audio player error:", error)
  nowPlaying = null
  playNext()
})

export function ytdlp(args: string): Promise<string> {
  const argv = args.match(/(?:[^\s"]+|"[^"]*")/g)?.map(a => a.replace(/^"|"$/g, "")) ?? []

  return new Promise((resolve, reject) => {
    execFile(YT_DLP_PATH, argv, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message))
        return
      }

      resolve(stdout.trim())
    })
  })
}

export async function getTitle(url: string): Promise<string> {
  return ytdlp(`--no-playlist --print title "${url}"`)
}

export async function resolveTrack(input: string): Promise<Track> {
  const isUrl = /^https?:\/\//i.test(input)
  const query = isUrl ? input : `ytsearch:${input}`

  const output = await ytdlp(`"${query}" --no-playlist --flat-playlist --print title --print webpage_url`)
  const lines = output.split("\n").filter(Boolean)

  if (lines.length < 2) {
    throw new Error("No results found")
  }

  return { title: lines[0], url: lines[1] }
}

async function downloadAndPlay(track: Track): Promise<void> {
  const gen = ++generation
  nowPlaying = track

  try {
    await fs.unlink(AUDIO_PATH).catch(() => {})
    await ytdlp(`-x "${track.url}" --no-playlist --audio-quality 0 --audio-format opus -o "audio"`)

    if (gen !== generation) return

    const buffer = await fs.readFile(AUDIO_PATH)
    const passthrough = new PassThrough()
    passthrough.end(buffer)

    const resource = createAudioResource(
      passthrough.pipe(new prism.opus.OggDemuxer()),
      { inputType: StreamType.Opus }
    )

    player.play(resource)
  } catch (error) {
    console.error(`Failed to play "${track.title}":`, error)
    if (gen !== generation) return
    nowPlaying = null
    playNext()
  }
}

function playNext(): void {
  if (queue.length === 0) {
    nowPlaying = null
    return
  }

  downloadAndPlay(queue.shift()!)
}

export function ensureVoiceConnection(member: GuildMember): void {
  const channel = member.voice.channel

  if (!channel) {
    throw new Error("Not in a voice channel")
  }

  const isValid = connection
    && connection.joinConfig.channelId === channel.id
    && [VoiceConnectionStatus.Ready, VoiceConnectionStatus.Connecting, VoiceConnectionStatus.Signalling]
      .includes(connection.state.status as VoiceConnectionStatus)

  if (isValid) return

  if (connection) {
    try { connection.destroy() } catch {}
  }

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  })

  connection.subscribe(player)
}

export function getNowPlaying(): Track | null {
  return nowPlaying
}

export function getQueue(): Track[] {
  return [...queue]
}

export function addToQueue(title: string, url: string): { queued: boolean, position: number } {
  queue.push({ title, url })

  if (!nowPlaying) {
    playNext()
    return { queued: false, position: 0 }
  }

  return { queued: true, position: queue.length }
}

export function addToQueueNext(title: string, url: string): { queued: boolean } {
  queue.unshift({ title, url })

  if (!nowPlaying) {
    playNext()
    return { queued: false }
  }

  return { queued: true }
}

export function playNowTrack(title: string, url: string): void {
  queue.unshift({ title, url })
  skip()
}

export function skip(): void {
  generation++

  if (player.state.status !== AudioPlayerStatus.Idle) {
    manualStop = true
    player.stop()
  }

  nowPlaying = null
  playNext()
}

export function stop(): void {
  generation++
  queue.length = 0
  nowPlaying = null

  if (player.state.status !== AudioPlayerStatus.Idle) {
    manualStop = true
    player.stop()
  }

  if (connection) {
    try {
      connection.destroy()
    } catch (error) {
      console.error("Error destroying voice connection:", error)
    }

    connection = null
  }
}

export function pause(): boolean {
  return player.pause()
}

export function resume(): boolean {
  return player.unpause()
}

export function shuffleQueue(): void {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = queue[i]
    queue[i] = queue[j]
    queue[j] = temp
  }
}

export function removeFromQueue(index: number): Track | null {
  if (index < 1 || index > queue.length) return null
  return queue.splice(index - 1, 1)[0] ?? null
}

export function moveInQueue(from: number, to: number): boolean {
  if (from < 1 || from > queue.length) return false
  if (to < 1 || to > queue.length) return false
  if (from === to) return true

  const [track] = queue.splice(from - 1, 1)
  queue.splice(to - 1, 0, track)
  return true
}
