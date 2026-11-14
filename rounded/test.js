// Self-check for the Rounded plugin, run by make.js. Loads rounded/index.js against a JSX runtime that, like
// Endcord's, is already wrapped, with Discord holding on to the wrapper.
const assert = require("assert");
const fs = require("fs");

const js = fs.readFileSync(__dirname + "/index.js", "utf8");
assert(js.startsWith("("), "must start with ( for the loader's `return <file>`");
assert(!/\b(let|const|class|async)\s|=>|\?\.|\?\?/.test(js), "uses syntax Hermes won't run");

// spitroast-style patcher: one wrapper per function, hooks read at call time
const hooks = new Map();
function after(name, obj, cb) {
    if (!hooks.has(obj[name])) {
        const orig = obj[name];
        const list = [];
        obj[name] = function (...a) { let r = orig.apply(this, a); for (const f of list) { const n = f(a, r); if (n !== undefined) r = n; } return r; };
        hooks.set(obj[name], list);
    }
    const list = hooks.get(obj[name]);
    list.push(cb);
    return () => list.splice(list.indexOf(cb), 1);
}
const runtime = { jsx: (type, props) => ({ type, props: Object.assign({}, props) }), jsxs: (type, props) => ({ type, props: Object.assign({}, props) }) };
after("jsx", runtime, () => undefined); // Endcord's own hook got there first
after("jsxs", runtime, () => undefined);
const jsx = runtime.jsx; // what Discord's modules hold

const vendetta = {
    metro: { findByProps: (...p) => (p.join() === "jsx,jsxs" ? runtime : undefined) },
    patcher: { after },
    logger: { log() { }, warn: m => { throw new Error(m); } }
};
const plugin = new Function("vendetta", "return " + js)(vendetta);
plugin.onLoad();

const card = { borderRadius: 16, padding: 8 };
const el = jsx("View", { style: card });
assert.deepStrictEqual(el.props.style, { borderRadius: 24, padding: 8 }, "cards rounder, nothing else changed");
assert.deepStrictEqual(card, { borderRadius: 16, padding: 8 }, "Discord's own style object untouched");
assert.strictEqual(jsx("View", { style: card }).props.style, el.props.style, "same style, same copy (no work per render)");
assert.strictEqual(jsx("Pressable", { style: el.props.style }).props.style, el.props.style, "never rounded twice");

const arr = [{ flex: 1 }, { borderTopLeftRadius: 8, borderTopRightRadius: 8 }, null, false];
const rounded = runtime.jsxs("View", { style: arr }).props.style;
assert.deepStrictEqual(rounded, [{ flex: 1 }, { borderTopLeftRadius: 14, borderTopRightRadius: 14 }, null, false]);
assert.strictEqual(rounded[0], arr[0], "untouched parts kept as they are");

const plain = { flex: 1 };
assert.strictEqual(jsx("View", { style: plain }).props.style, plain, "nothing to round: same object");
assert.strictEqual(jsx("View", { style: { borderRadius: 0 } }).props.style.borderRadius, 0, "square stays square");
assert.strictEqual(jsx("View", { style: { borderRadius: 999 } }).props.style.borderRadius, 999, "pills stay pills");
assert.strictEqual(jsx("Text", { children: "hi" }).props.style, undefined, "no style, nothing added");

plugin.onUnload();
assert.strictEqual(jsx("View", { style: card }).props.style, card, "unload: Discord's corners again");
console.log("rounded: ok, hash", JSON.parse(fs.readFileSync(__dirname + "/manifest.json")).hash.slice(0, 12));
