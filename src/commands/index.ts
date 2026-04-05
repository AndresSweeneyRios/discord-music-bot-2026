import * as ping from "./ping"
import * as play from "./play"
import * as playnext from "./playnext"
import * as playnow from "./playnow"
import * as queue from "./queue"
import * as remove from "./remove"
import * as move from "./move"
import * as skip from "./skip"
import * as stop from "./stop"
import * as pause from "./pause"
import * as resume from "./resume"
import * as shuffle from "./shuffle"

export type CommandResolver = typeof play

export const commandResolvers: CommandResolver[] = [
  ping,
  play,
  playnext,
  playnow,
  queue,
  remove,
  move,
  skip,
  stop,
  pause,
  resume,
  shuffle,
]
