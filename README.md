# Inkshell for Endcord Mobile

Inkshell's Discord look on the phone: ink greys on Midnight's layout, with Midnight's moon in place of Discord's logo.

**Theme** (Settings → Themes → +, paste):

```
https://raw.githubusercontent.com/ad3333m/inkshell-mobile/main/inkshell.json
```

Endcord's Dark is Inkshell black, Light is Inkshell white.

**Moon logo** (Settings → Plugins → +, paste). Themes can only carry colours, so the logo is a tiny plugin:

```
https://raw.githubusercontent.com/ad3333m/inkshell-mobile/main/plugin/
```

Rebuild after changing colours, `plugin/src.js` or `moon.png`: `node make.js` (also checks both).
