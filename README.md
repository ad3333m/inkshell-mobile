# Inkshell for Endcord Mobile

Themes and a logo plugin for Discord on the phone (Endcord Mobile). None of them touch the keyboard: Endcord's iOS
side repaints the keyboard when a theme sets `KEYBOARD` or `BACKGROUND_PRIMARY`, which on iOS 27 leaves it with no
visible keys, so these themes never set either.

**Themes** (Settings → Themes → +, paste, then tap it to switch it on):

- Inkshell: ink greys on Midnight's layout. Endcord's Dark is Inkshell black, Light is Inkshell white.
  ```
  https://raw.githubusercontent.com/ad3333m/inkshell-mobile/main/inkshell.json
  ```
- OLED Black: Discord's own pure-black Midnight (Onyx) colours for every colour, so text always reads. Keep Endcord on Dark or Auto.
  ```
  https://raw.githubusercontent.com/ad3333m/inkshell-mobile/main/oled.json
  ```

**Midnight Logo** (Settings → Plugins → +, paste): Midnight's moon on the Messages button at the top of the server
list. It spins when you open your DMs, and turns into bouncing typing dots while someone in your DMs is typing.

```
https://raw.githubusercontent.com/ad3333m/inkshell-mobile/main/plugin/
```

**Rounded** (Settings → Plugins → +, paste): Rounded Discord's softer corners: cards, rows, inputs, the chat bar,
channel rows, voice tiles. Square things stay square, pills stay pills, and the keyboard is never touched.

```
https://raw.githubusercontent.com/ad3333m/inkshell-mobile/main/rounded/
```

Rebuild after changing colours, `plugin/src.js` or `moon.png`: `node make.js` (checks the themes' contrast and runs
`plugin/test.js`, which needs `npm i --no-save react@18 react-test-renderer@18`).
