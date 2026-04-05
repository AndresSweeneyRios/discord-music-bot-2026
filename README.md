# discord-music-bot-2026
***NOTE: This project currently only supports Windows, but it can be ported easily by switching out the `bin/yt-dlp.exe` binary. Feel free to make a pull request.***

This is a lightweight, minimalist music bot for Discord written in TypeScript. It only supports one channel at a time across all guilds as it is intended for personal use, but future pull requests may absolutely expand the feature set. Seeking is also not supported.

For a list of supported URLs, see https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md.

## Supported commands

```ts
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
```

## Setup
### 1) Install Node.js (https://nodejs.org/en)
### 2) Create a config.json file at the top level of the project with the following format:
```json
{
  "TOKEN": "XXX",
  "CLIENT_ID": "XXX"
}
```
### 3) Run `npm i`, `npm build`, then `npm start`
### 4) Done!

Please contact me at andressweeneyrios@gmail.com for any questions or concerns.
