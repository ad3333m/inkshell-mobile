// Self-check for the Rounded plugin, run by make.js. React Native's View here is a forwardRef (Discord 355's
// _runtime/00108_View.js), whose `render` React calls on every render; Rounded rounds the style it's given.
const assert = require("assert");
const fs = require("fs");

const js = fs.readFileSync(__dirname + "/index.js", "utf8");
assert(js.startsWith("("), "must start with ( for the loader's `return <file>`");
assert(!/\b(let|const|class|async)\s|=>|\?\.|\?\?/.test(js), "uses syntax Hermes won't run");

const forwardRef = name => ({ $$typeof: Symbol.for("react.forward_ref"), render: function (props) { return { type: name, props }; } });
const RN = { View: forwardRef("RCTView"), Image: forwardRef("RCTImageView"), Text: { name: "Text" } };
const before = (name, obj, cb) => {
    const orig = obj[name];
    obj[name] = function (...a) { const r = cb(a); return orig.apply(this, Array.isArray(r) ? r : a); };
    return () => { obj[name] = orig; };
};
const vendetta = {
    metro: { common: { ReactNative: RN } },
    patcher: { before },
    logger: { log() { }, warn: m => { throw new Error(m); } }
};
const plugin = new Function("vendetta", "return " + js)(vendetta);
plugin.onLoad();

// what React does with a View element: View.render(props, ref), read from the object each time
const draw = (C, props) => C.render(props, null).props;
const card = { borderRadius: 16, padding: 8 };
const props = { style: card, testID: "card" };
const out = draw(RN.View, props);
assert.deepStrictEqual(out.style, { borderRadius: 24, padding: 8 }, "cards rounder, nothing else changed");
assert.strictEqual(out.testID, "card", "other props kept");
assert.deepStrictEqual(card, { borderRadius: 16, padding: 8 }, "Discord's own style object untouched");
assert.strictEqual(props.style, card, "Discord's own props untouched");
assert.strictEqual(draw(RN.View, { style: card }).style, out.style, "same style, same copy (no work per render)");
assert.strictEqual(draw(RN.View, { style: out.style }).style, out.style, "never rounded twice (Pressable → View)");

const arr = [{ flex: 1 }, { borderTopLeftRadius: 8, borderTopRightRadius: 8 }, null, false];
const rounded = draw(RN.View, { style: arr }).style;
assert.deepStrictEqual(rounded, [{ flex: 1 }, { borderTopLeftRadius: 14, borderTopRightRadius: 14 }, null, false]);
assert.strictEqual(rounded[0], arr[0], "untouched parts kept as they are");
assert.strictEqual(draw(RN.Image, { style: { borderRadius: 8 } }).style.borderRadius, 14, "images too");

const plain = { flex: 1 };
assert.strictEqual(draw(RN.View, { style: plain }).style, plain, "nothing to round: same object");
assert.strictEqual(draw(RN.View, { style: { borderRadius: 0 } }).style.borderRadius, 0, "square stays square");
assert.strictEqual(draw(RN.View, { style: { borderRadius: 999 } }).style.borderRadius, 999, "pills stay pills");
assert.strictEqual(draw(RN.View, { children: "hi" }).style, undefined, "no style, nothing added");

plugin.onUnload();
assert.strictEqual(draw(RN.View, { style: card }).style, card, "unload: Discord's corners again");
console.log("rounded: ok, hash", JSON.parse(fs.readFileSync(__dirname + "/manifest.json")).hash.slice(0, 12));
