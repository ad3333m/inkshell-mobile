// Self-check for the Rounded plugin, run by make.js. Loads rounded/index.js against Discord 355's radius tokens.
const assert = require("assert");
const fs = require("fs");

const js = fs.readFileSync(__dirname + "/index.js", "utf8");
assert(js.startsWith("("), "must start with ( for the loader's `return <file>`");
assert(!/\b(let|const|class|async)\s|=>|\?\.|\?\?/.test(js), "uses syntax Hermes won't run");

// Discord's tokens, shaped like discord_common/js/packages/tokens/native.tsx: modules.<group>.<TOKEN>.resolve(ctx)
const token = v => ({ resolve: () => v });
const radii = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, round: 2147483647 };
const modules = {
    mobile: {
        CARD_DEFAULT_RADIUS: token(16), TABLE_ROW_BORDER_RADIUS: token(16), CHAT_INPUT_BORDER_RADIUS: token(20),
        INPUT_FIELD_ROUND_RADIUS: token(999), CHANNEL_ITEM_RADIUS: token(8), GUILD_ITEM_SELECTED_BORDER_RADIUS: token(16),
        MOBILE_KEYBOARD_TOP_BORDER_RADIUS: token(12), MEDIA_KEYBOARD_BUTTON_BORDER_RADIUS: token(8),
        CHANNEL_DETAILS_NAV_BUTTONS_GAP: token(8), NO_RADIUS: token(0)
    },
    voice: { VOICE_TILE_BORDER_RADIUS: token(12) }
};
modules.mobile.SQUARE_RADIUS = token(0);
const after = (name, obj, cb) => {
    const orig = obj[name];
    obj[name] = function (...a) { const r = orig.apply(this, a); const n = cb.call(this, a, r); return n === undefined ? r : n; };
    return () => { obj[name] = orig; };
};
const vendetta = {
    metro: { findByProps: p => (p === "SemanticColor" ? { default: { radii, modules } } : undefined) },
    patcher: { after },
    logger: { log() { }, warn: m => { throw new Error(m); } }
};

const plugin = new Function("vendetta", "return " + js)(vendetta);
const r = k => modules.mobile[k].resolve({});
plugin.onLoad();
assert.strictEqual(r("CARD_DEFAULT_RADIUS"), 24, "cards rounder");
assert.strictEqual(r("TABLE_ROW_BORDER_RADIUS"), 24);
assert.strictEqual(r("CHAT_INPUT_BORDER_RADIUS"), 29, "chat bar rounder");
assert.strictEqual(r("CHANNEL_ITEM_RADIUS"), 14);
assert.strictEqual(modules.voice.VOICE_TILE_BORDER_RADIUS.resolve({}), 19);
assert.strictEqual(r("INPUT_FIELD_ROUND_RADIUS"), 999, "pills stay pills");
assert.strictEqual(r("SQUARE_RADIUS"), 0, "square stays square");
assert.strictEqual(r("GUILD_ITEM_SELECTED_BORDER_RADIUS"), 16, "selected-server squircle kept");
assert.strictEqual(r("MOBILE_KEYBOARD_TOP_BORDER_RADIUS"), 12, "keyboard never touched");
assert.strictEqual(r("MEDIA_KEYBOARD_BUTTON_BORDER_RADIUS"), 8, "media keyboard never touched");
assert.strictEqual(r("CHANNEL_DETAILS_NAV_BUTTONS_GAP"), 8, "only radii, not gaps");
assert.deepStrictEqual(radii, { none: 0, xs: 9, sm: 14, md: 19, lg: 24, xl: 34, xxl: 44, round: 2147483647 });
plugin.onUnload();
assert.strictEqual(r("CARD_DEFAULT_RADIUS"), 16, "unload puts Discord's corners back");
assert.strictEqual(radii.md, 12);
console.log("rounded: ok, hash", JSON.parse(fs.readFileSync(__dirname + "/manifest.json")).hash.slice(0, 12));
