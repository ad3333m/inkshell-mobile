// Builds inkshell.json, the Inkshell theme for Endcord Mobile, from the same palette as Inkshell's desktop Discord theme
// (winisland\src\DiscordTheme.cs). Run: node make.js
//
// Mobile themes are colours only (Vendetta spec 2: each semantic colour is [dark, light], raw colours are one value).
// Two layers:
//  1. Discord's grey and blurple raw palettes become Inkshell's ink greys at the same lightness, so every surface the
//     theme doesn't name still matches, in both modes.
//  2. The surfaces, text and accents Inkshell sets on desktop, named exactly: [black, white].
const fs = require("fs");
const discordRaw = require("./discord-raw.json"); // Discord's raw palette, taken from its web client

// ---- Inkshell's palette, black then white (same values as DiscordTheme.cs) ----
const BG1 = ["#3A3A3E", "#D3D1D7"], BG2 = ["#242427", "#E3E1E6"], BG3 = ["#161618", "#ECEAEE"], BG4 = ["#000000", "#F6F4F7"];
const T1 = ["#F4F4F5", "#1D1B20"], T3 = ["#B9B9BE", "#49454F"], T4 = ["#85858B", "#7A7680"], T5 = ["#5A5A5F", "#A09DA5"];
const HOVER = [T1[0] + "14", T1[1] + "14"], ACTIVE = [T1[0] + "1C", T1[1] + "1C"];
const RED = ["#E5484D", "#E5484D"], GREEN = ["#4F9E8A", "#4F9E8A"], YELLOW = ["#D9A441", "#D9A441"];

const semantic = {
    // surfaces, Midnight's way: the chat is the deepest layer, sidebars and sheets sit one step up
    BACKGROUND_BASE_LOW: BG4, BACKGROUND_BASE_LOWER: BG3, BACKGROUND_BASE_LOWEST: BG4,
    BACKGROUND_SURFACE_HIGH: BG3, BACKGROUND_SURFACE_HIGHER: BG3, BACKGROUND_SURFACE_HIGHEST: BG2,
    BACKGROUND_SECONDARY_ALT: BG2, BACKGROUND_ACCENT: BG1, BG_SURFACE_RAISED: BG3, BG_SURFACE_OVERLAY: BG3,
    BG_BASE_PRIMARY: BG4, BG_BASE_SECONDARY: BG3, BG_BASE_TERTIARY: BG4,
    CHANNEL_BACKGROUND_DEFAULT: BG4, PANEL_BG: BG3, HOME_BACKGROUND: BG4, CHAT_BACKGROUND: BG4,
    CARD_PRIMARY_BG: BG3, CARD_BACKGROUND_DEFAULT: BG3, CARD_PRIMARY_PRESSED_BG: BG2, CARD_SECONDARY_BG: BG2, CARD_SECONDARY_PRESSED_BG: BG1,
    INPUT_BACKGROUND_DEFAULT: BG2, INPUT_BACKGROUND: BG2, CHAT_INPUT_BACKGROUND: BG2, MOBILE_CHATINPUT_BACKGROUND_DEFAULT: BG2,
    CHANNELTEXTAREA_BACKGROUND: BG2, REDESIGN_CHAT_INPUT_BACKGROUND: BG2,
    MOBILE_EXPRESSION_PICKER_BACKGROUND_DEFAULT: BG3, SPOILER_REVEALED_BACKGROUND: BG2, POLLS_NORMAL_IMAGE_BACKGROUND: BG2,
    // the same for Discord before its 2025 refresh
    BACKGROUND_PRIMARY: BG4, BACKGROUND_SECONDARY: BG3, BACKGROUND_TERTIARY: BG4, BACKGROUND_FLOATING: BG3,
    BACKGROUND_NESTED_FLOATING: BG2, BACKGROUND_MOBILE_PRIMARY: BG4, BACKGROUND_MOBILE_SECONDARY: BG3,
    BACKGROUND_MODIFIER_HOVER: HOVER, BACKGROUND_MODIFIER_ACTIVE: ACTIVE, BACKGROUND_MODIFIER_SELECTED: ACTIVE,

    // text and icons
    TEXT_STRONG: T1, TEXT_DEFAULT: T3, TEXT_SUBTLE: T4, TEXT_MUTED: T5, TEXT_BRAND: T1, TEXT_LINK: T1,
    HEADER_PRIMARY: T1, HEADER_SECONDARY: T4, TEXT_NORMAL: T3, MOBILE_TEXT_HEADING_PRIMARY: T1,
    INPUT_TEXT_DEFAULT: T1, INPUT_PLACEHOLDER_TEXT_DEFAULT: T5, CHANNELS_DEFAULT: T4, CHANNEL_ICON: T4,
    ICON_DEFAULT: T3, ICON_STRONG: T1, ICON_SUBTLE: T4, ICON_MUTED: T5, ICON_BRAND: T1,
    INTERACTIVE_NORMAL: T3, INTERACTIVE_HOVER: T1, INTERACTIVE_ACTIVE: T1, INTERACTIVE_MUTED: T5,
    INTERACTIVE_TEXT_DEFAULT: T3, INTERACTIVE_TEXT_HOVER: T1, INTERACTIVE_TEXT_ACTIVE: T1,
    INTERACTIVE_ICON_DEFAULT: T3, INTERACTIVE_ICON_HOVER: T1, INTERACTIVE_ICON_ACTIVE: T1,
    MOBILE_GUILDBAR_ICON_DEFAULT: T3, NAVIGATOR_HEADER_TINT: T1, LOGO_PRIMARY: T1,

    // the shell is monochrome, so the accent is ink and whatever sits on it takes the page colour
    BACKGROUND_BRAND: T1, CONTROL_BRAND_FOREGROUND: T1, CONTROL_BRAND_FOREGROUND_NEW: T1,
    CONTROL_PRIMARY_BACKGROUND_DEFAULT: T1, CONTROL_PRIMARY_BACKGROUND_HOVER: T3, CONTROL_PRIMARY_BACKGROUND_ACTIVE: T3,
    CONTROL_PRIMARY_TEXT_DEFAULT: BG4, CONTROL_PRIMARY_TEXT_HOVER: BG4, CONTROL_PRIMARY_TEXT_ACTIVE: BG4,
    CONTROL_PRIMARY_ICON_DEFAULT: BG4, CONTROL_PRIMARY_ICON_HOVER: BG4, CONTROL_PRIMARY_ICON_ACTIVE: BG4,
    BADGE_PRIMARY_BACKGROUND: T1, BADGE_PRIMARY_BORDER: T1, BADGE_PRIMARY_TEXT: BG4, BADGE_TEXT_BRAND: BG4,
    CHAT_INPUT_SEND_BUTTON_ICON_ACTIVE_TINT: BG4,
    // switches: the knob takes the opposite of its track, as on desktop
    SWITCH_BACKGROUND_SELECTED_DEFAULT: T1, SWITCH_BACKGROUND_SELECTED_HOVER: T1, SWITCH_BACKGROUND_ACTIVE: T3,
    SWITCH_THUMB_BACKGROUND_DEFAULT: T3, SWITCH_THUMB_BACKGROUND_SELECTED_DEFAULT: BG4,
    SWITCH_THUMB_ICON_DEFAULT: BG4, SWITCH_THUMB_ICON_ACTIVE: T1,
    CHECKBOX_BACKGROUND_SELECTED_DEFAULT: T1, CHECKBOX_BACKGROUND_SELECTED_HOVER: T1, CHECKBOX_BORDER_SELECTED_DEFAULT: T1,
    CHECKBOX_ICON_ACTIVE: BG4, RADIO_BACKGROUND_SELECTED_DEFAULT: T1, RADIO_FOREGROUND_ACTIVE: T1,
    INPUT_BORDER_ACTIVE: T1, TABS_INDICATOR_DEFAULT: T1, PROGRESSBAR_INDICATOR_BACKGROUND: T1, TOGGLEBUTTON_BORDER_SELECTED: T1,
    MENTION_FOREGROUND: T1, REACTION_BORDER_REACTED_DEFAULT: T4, REACTION_TEXT_REACTED_DEFAULT: T1,

    // status, Inkshell's own
    STATUS_ONLINE: GREEN, STATUS_POSITIVE: GREEN, STATUS_IDLE: YELLOW, STATUS_WARNING: YELLOW,
    STATUS_DND: RED, STATUS_DANGER: RED, STATUS_OFFLINE: T4,
};

// ---- Discord's greys and blurples as Inkshell's ink greys, keeping each one's lightness and alpha ----
const GREY_FAMILIES = /^(NEUTRAL|PRIMARY|BLURPLE|BRAND|OPACITY|OPACITY_BLURPLE)_\d+$/;

const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const gam = c => Math.round(255 * Math.min(1, Math.max(0, c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)));
function okL(hex) { // OKLab lightness
    const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16)));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
}
function inkGrey(L) { // OKLab -> sRGB with Inkshell's faint violet tint, fading out toward black
    const a = 0.004 * L, b = -0.007 * L;
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
    return "#" + rgb.map(c => gam(c).toString(16).padStart(2, "0")).join("");
}

const raw = {};
for (const [key, value] of Object.entries(discordRaw)) {
    if (!GREY_FAMILIES.test(key) || !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value)) continue;
    raw[key] = inkGrey(okL(value.slice(0, 7))) + value.slice(7);
}

const theme = {
    name: "Inkshell",
    description: "Inkshell's ink greys on Midnight's layout. Endcord's Dark is Inkshell black, Light is Inkshell white.",
    authors: [{ name: "ad3333m" }],
    spec: 2,
    semanticColors: semantic,
    rawColors: raw,
};
fs.writeFileSync(__dirname + "/inkshell.json", JSON.stringify(theme, null, 1) + "\n");

// self-check: every colour is a hex the theme parser takes, both modes are set, and the greys keep their order
const hex = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
for (const [k, v] of Object.entries(semantic)) if (v.length !== 2 || !v.every(c => hex.test(c))) throw new Error("bad " + k);
for (const [k, v] of Object.entries(raw)) if (!hex.test(v)) throw new Error("bad raw " + k);
for (let i = 2; i <= 100; i++) if (okL(raw["NEUTRAL_" + i]) > okL(raw["NEUTRAL_" + (i - 1)]) + 1e-3) throw new Error("NEUTRAL order at " + i);
console.log("inkshell.json:", Object.keys(semantic).length, "semantic,", Object.keys(raw).length, "raw; NEUTRAL_2", raw.NEUTRAL_2, "NEUTRAL_69", raw.NEUTRAL_69, "BLURPLE_50", raw.BLURPLE_50);

// ---- the moon plugin: plugin/src.js with moon.png inlined, and a manifest whose hash Endcord checks ----
const js = fs.readFileSync(__dirname + "/plugin/src.js", "utf8")
    .replace("__MOON__", "data:image/png;base64," + fs.readFileSync(__dirname + "/moon.png").toString("base64"));
fs.writeFileSync(__dirname + "/plugin/index.js", js);
fs.writeFileSync(__dirname + "/plugin/manifest.json", JSON.stringify({
    name: "Inkshell",
    description: "Midnight's moon in place of Discord's logo, for the Inkshell theme.",
    authors: [{ name: "ad3333m" }],
    main: "index.js",
    hash: require("crypto").createHash("sha256").update(js).digest("hex"),
}, null, 4) + "\n");

// self-check: Endcord runs `return <file>` on Hermes, so it must start with "(" and use nothing Hermes lacks
if (!js.startsWith("(")) throw new Error("plugin must start with (");
if (/\b(let|const|class|async)\s|=>|\?\.|\?\?/.test(js)) throw new Error("plugin uses syntax Hermes won't run");
const CLYDE = 7, OTHER = 8, patches = [];
const Image = { render: props => props };
const vendetta = {
    metro: { common: { ReactNative: { Image } } },
    ui: { assets: { getAssetIDByName: n => n === "ClydeIcon" ? CLYDE : undefined } },
    logger: console,
    patcher: {
        before(name, obj, cb) {
            const orig = obj[name];
            obj[name] = function (...args) { const r = cb(args); return orig.apply(this, Array.isArray(r) ? r : args); };
            patches.push(() => { obj[name] = orig; });
            return patches[patches.length - 1];
        },
    },
};
const plugin = new Function("vendetta", "return " + js)(vendetta);
plugin.onLoad();
if (!String(Image.render({ source: CLYDE, style: 1 }).source.uri).startsWith("data:image/png;base64,iVBOR")) throw new Error("logo not swapped");
if (Image.render({ source: CLYDE, style: 1 }).style !== 1) throw new Error("logo lost its style");
if (Image.render({ source: OTHER }).source !== OTHER) throw new Error("other icons touched");
plugin.onUnload();
if (Image.render({ source: CLYDE }).source !== CLYDE) throw new Error("unload left the moon");
console.log("plugin: ok, hash", JSON.parse(fs.readFileSync(__dirname + "/plugin/manifest.json")).hash.slice(0, 12));
