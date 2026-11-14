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
    // the same for Discord before its 2025 refresh. Never BACKGROUND_PRIMARY or KEYBOARD: Endcord's iOS side paints the
    // keyboard with those, and on iOS 27 that leaves it with no visible keys
    BACKGROUND_SECONDARY: BG3, BACKGROUND_TERTIARY: BG4, BACKGROUND_FLOATING: BG3,
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
    name: "Inkshell v2",
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

function luminance(hex) {
    const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// ---- OLED Black: black and white, from Discord's own Midnight (Onyx) colours ----
// Starts from Onyx (Discord's pure-black theme) for every colour the phone app has (discord-mobile-colors.json, from
// Discord 355's own definitions, plus the web client's list), then makes it black and white:
//  - every resting surface is pure black: cards, settings rows, sheets, the text box, inputs;
//  - Discord's blurple becomes dark grey (#444) where it's a fill, white where it's text, an icon or a tint;
//  - pressed/selected highlights, borders and dividers stay as faint white, so rows and the text box keep their edges;
//  - red, green, yellow and other meaningful colours stay.
// A contrast guard then checks every text/icon against the surface it belongs to and flips it to black or white
// where it would vanish, so there's no black on black or white on white. Both columns hold the same, so Light stays black.
const KEYBOARD_KEYS = ["KEYBOARD", "BACKGROUND_PRIMARY"]; // see above: never set, the keyboard stays Discord's own
const mobileRaw = require("./discord-mobile-raw.json");
const defs = {};
for (const [name, onyxDef] of Object.entries(require("./discord-onyx.json"))) defs[name] = { cat: null, onyx: onyxDef };
for (const [name, d] of Object.entries(require("./discord-mobile-colors.json"))) defs[name] = d; // the phone's own wins

const rgba = hex => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
const toHex = (c, a) => "#" + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("") + (a >= 1 ? "" : Math.round(a * 255).toString(16).padStart(2, "0"));
function hueSat(c) {
    const max = Math.max(c.r, c.g, c.b), min = Math.min(c.r, c.g, c.b), d = max - min;
    if (!max || !d) return { h: 0, s: 0 };
    let h = max === c.r ? (c.g - c.b) / d : max === c.g ? 2 + (c.b - c.r) / d : 4 + (c.r - c.g) / d;
    return { h: (h * 60 + 360) % 360, s: d / max };
}
const isBrand = c => { const { h, s } = hueSat(c); return s > 0.25 && h >= 225 && h <= 285; }; // Discord's blurple family
// near-black colours read as grey whatever their tint
const isGrey = c => hueSat(c).s < 0.12 || Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 24;
const kind = (name, cat) => cat === "border" || /BORDER|DIVIDER|SEPARATOR|OUTLINE/.test(name) ? "border"
    : !/BACKGROUND|_BG($|_)|^BG_|SCRIM|OVERLAY|FILL/.test(name) && (cat === "text" || /TEXT|ICON|TINT|FOREGROUND|HEADER|PLACEHOLDER|LOGO|INTERACTIVE_(NORMAL|HOVER|ACTIVE|MUTED)|THUMB_ICON/.test(name)) ? "fg" : "bg";
const ACCENT = { r: 0x44, g: 0x44, b: 0x44 }; // white reads on it at 9.7:1
const STATE = /PRESSED|ACTIVE|HOVER|SELECTED|HIGHLIGHT|SCRIM|OVERLAY|SKELETON|SHIMMER|RIPPLE|GRADIENT/;

const oledColor = {}; // name -> { c: {r,g,b}, a, kind }
for (const [name, d] of Object.entries(defs)) {
    if (KEYBOARD_KEYS.includes(name)) continue;
    const value = mobileRaw[d.onyx[0]] || discordRaw[d.onyx[0]];
    if (!/^#[0-9a-f]{6}/i.test(value || "")) continue;
    let c = rgba(value), a = d.onyx[1];
    const k = kind(name, d.cat);
    const white = { r: 255, g: 255, b: 255 }, black = { r: 0, g: 0, b: 0 };
    // blurple: solid fills become a dark grey, because Discord also draws hard-coded white icons on them (the selected
    // server button, Add Friend) and a white fill would hide those; tints and blurple text/icons become white
    if (isBrand(c)) c = k === "bg" && a >= 1 ? ACCENT : white;
    else if (k === "bg" && isGrey(c)) {
        const lum = luminance(toHex(c, 1));
        // resting dark surfaces, and the faint grey tints that only shade a resting surface, go black
        if (a >= 1 && lum < 0.2) c = black;
        // (buttons, switches and checkboxes keep theirs, or they would lose their shape)
        else if (a < 1 && a <= 0.25 && !STATE.test(name) && !/^(CONTROL|SWITCH|CHECKBOX|RADIO|TOGGLEBUTTON|SEGMENTED)_/.test(name)) { c = black; a = 1; }
    }
    oledColor[name] = { c, a, kind: k };
}

// What a colour looks like where it's drawn: translucent ones over black
const shown = ({ c, a }) => toHex({ r: c.r * a, g: c.g * a, b: c.b * a }, 1);
const bestOn = bg => contrast("#ffffff", bg) >= contrast("#000000", bg) ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };

// Pairs: a surface and the text/icons drawn on it share a name once BACKGROUND/BG and TEXT/ICON/TINT/FOREGROUND are
// taken out (CONTROL_PRIMARY_BACKGROUND_DEFAULT ↔ CONTROL_PRIMARY_TEXT_DEFAULT, CHAT_INPUT_SEND_BUTTON_ACTIVE_BACKGROUND
// ↔ CHAT_INPUT_SEND_BUTTON_ICON_ACTIVE_TINT); plus the few Discord names differently
const stem = (name, words) => name.split("_").filter(w => !words.includes(w)).join("_");
const surfaces = {};
for (const [name, v] of Object.entries(oledColor)) if (v.kind === "bg") surfaces[stem(name, ["BACKGROUND", "BG"])] = name;
const EXTRA_PAIRS = [
    ["CHECKBOX_ICON_ACTIVE", "CHECKBOX_BACKGROUND_SELECTED_DEFAULT"], ["SWITCH_THUMB_ICON_ACTIVE", "SWITCH_THUMB_BACKGROUND_SELECTED_DEFAULT"],
    ["SWITCH_THUMB_BACKGROUND_SELECTED_DEFAULT", "SWITCH_BACKGROUND_SELECTED_DEFAULT"], ["BADGE_TEXT_BRAND", "BADGE_PRIMARY_BACKGROUND"],
    ["MENTION_FOREGROUND", "MENTION_BACKGROUND"], ["REACTION_TEXT_REACTED_DEFAULT", "REACTION_BACKGROUND_REACTED_DEFAULT"]
];
const pairs = EXTRA_PAIRS.filter(([fg, bg]) => oledColor[fg] && oledColor[bg]);
for (const [name, v] of Object.entries(oledColor)) {
    if (v.kind !== "fg") continue;
    const bg = surfaces[stem(name, ["TEXT", "ICON", "TINT", "FOREGROUND"])];
    // only a component and its own parts (CONTROL_PRIMARY_*, BADGE_PRIMARY_*): TEXT_BRAND or TEXT_FEEDBACK_CRITICAL are
    // coloured text on ordinary surfaces, not text on BACKGROUND_BRAND or BACKGROUND_FEEDBACK_CRITICAL
    const first = n => n.split("_")[0];
    if (bg && bg !== name && first(bg) === first(name) && !["TEXT", "ICON", "BACKGROUND", "BG"].includes(first(name))) pairs.push([name, bg]);
}
// repeated until nothing changes: a switch thumb flips against its track, then the thumb icon against the thumb
let flipped = 0;
for (let pass = 0, again = true; again && pass < 5; pass++) {
    again = false;
    for (const [fg, bg] of pairs) {
        const back = shown(oledColor[bg]), front = oledColor[fg];
        if (contrast(shown({ c: front.c, a: 1 }), back) >= 3) continue;
        front.c = bestOn(back);
        front.a = 1;
        flipped++;
        again = true;
    }
}

const oledSemantic = {};
for (const [name, v] of Object.entries(oledColor)) { const hx = toHex(v.c, v.a); oledSemantic[name] = [hx, hx]; }
fs.writeFileSync(__dirname + "/oled.json", JSON.stringify({
    name: "OLED Black v4",
    description: "Black and white: every surface pure black, accents white, text always readable. Leaves the keyboard alone.",
    authors: [{ name: "ad3333m" }],
    spec: 2,
    semanticColors: oledSemantic,
}, null, 1) + "\n");

// self-check: black surfaces, readable text everywhere it's paired, keyboard untouched, in both themes
for (const t of [oledSemantic, semantic]) for (const k of KEYBOARD_KEYS) if (t[k]) throw new Error(k + " would repaint the keyboard");
for (const k of ["BACKGROUND_BASE_LOW", "BACKGROUND_BASE_LOWER", "BACKGROUND_BASE_LOWEST", "CHAT_BACKGROUND", "BACKGROUND_SURFACE_HIGH",
    "BACKGROUND_SURFACE_HIGHEST", "CHAT_INPUT_BACKGROUND", "MOBILE_CHATINPUT_BACKGROUND_DEFAULT", "CARD_BACKGROUND_DEFAULT", "MOBILE_ACTIONSHEET_BACKGROUND"]) {
    if (oledColor[k] && shown(oledColor[k]) !== "#000000") throw new Error(k + " isn't black: " + oledSemantic[k][0]); // translucent black counts: it shows as black
}
for (const [k, v] of Object.entries(oledColor)) if (isBrand(v.c)) throw new Error(k + " is still blurple");
// what Discord draws in plain white on an accent fill must show
for (const [k, v] of Object.entries(oledColor)) if (v.kind === "bg" && v.c === ACCENT && contrast("#ffffff", shown(v)) < 4.5) throw new Error("white on " + k + " would vanish");
const readable = { TEXT_DEFAULT: 7, TEXT_STRONG: 7, MOBILE_TEXT_HEADING_PRIMARY: 7, INPUT_TEXT_DEFAULT: 7, TEXT_SUBTLE: 4.5, ICON_DEFAULT: 4.5, INTERACTIVE_TEXT_DEFAULT: 4.5, NAVIGATOR_HEADER_TINT: 4.5, TEXT_MUTED: 3, ICON_MUTED: 3, TEXT_LINK: 4.5, TEXT_BRAND: 4.5 };
for (const [k, min] of Object.entries(readable)) {
    if (!oledSemantic[k]) continue;
    const c = contrast(shown(oledColor[k]), "#000000");
    if (c < min) throw new Error(k + " only " + c.toFixed(1) + ":1 on black");
}
for (const [fg, bg] of pairs) {
    const c = contrast(shown({ c: oledColor[fg].c, a: 1 }), shown(oledColor[bg]));
    if (c < 3) throw new Error(fg + " only " + c.toFixed(1) + ":1 on " + bg);
}
const btn = ["CONTROL_PRIMARY_BACKGROUND_DEFAULT", "CONTROL_PRIMARY_TEXT_DEFAULT"].map(k => oledSemantic[k] && oledSemantic[k][0]).join(" / ");
console.log("oled.json:", Object.keys(oledSemantic).length, "colours,", pairs.length, "text-on-surface pairs checked,", flipped, "flipped; primary button", btn);

// ---- the Midnight Logo plugin: plugin/src.js with moon.png inlined, and a manifest whose hash Endcord checks ----
const js = fs.readFileSync(__dirname + "/plugin/src.js", "utf8")
    .replace("__MOON__", "data:image/png;base64," + fs.readFileSync(__dirname + "/moon.png").toString("base64"));
fs.writeFileSync(__dirname + "/plugin/index.js", js);
fs.writeFileSync(__dirname + "/plugin/manifest.json", JSON.stringify({
    name: "Midnight Logo",
    description: "Midnight's moon on the Messages button, with its spin, and typing dots while someone in your DMs is typing.",
    authors: [{ name: "ad3333m" }],
    main: "index.js",
    hash: require("crypto").createHash("sha256").update(js).digest("hex"),
}, null, 4) + "\n");
require("./plugin/test.js"); // drives it against a fake Discord (needs react@18 + react-test-renderer@18)

// ---- the Rounded plugin: rounded/index.js as written, with its manifest hash ----
const roundedJs = fs.readFileSync(__dirname + "/rounded/index.js", "utf8");
fs.writeFileSync(__dirname + "/rounded/manifest.json", JSON.stringify({
    name: "Rounded",
    description: "Rounded Discord's softer corners on the phone: every rounded corner Discord draws gets rounder. Never the keyboard.",
    authors: [{ name: "ad3333m" }],
    main: "index.js",
    hash: require("crypto").createHash("sha256").update(roundedJs).digest("hex"),
}, null, 4) + "\n");
require("./rounded/test.js");
