// Self-check for the Midnight Logo plugin, run by make.js (needs `npm i --no-save react@18 react-test-renderer@18`).
// Loads plugin/index.js against a fake Discord: the Messages button, Animated, the dispatcher and stores.
const assert = require("assert");
const fs = require("fs");
const React = require("react");
const TR = require("react-test-renderer");
const h = React.createElement;

const js = fs.readFileSync(__dirname + "/index.js", "utf8");
assert(js.startsWith("("), "must start with ( for the loader's `return <file>`");
assert(!/\b(let|const|class|async)\s|=>|\?\.|\?\?/.test(js), "uses syntax Hermes won't run");

// Animated stand-in: values record what they were animated to
class Value {
    constructor(v) { this.v = v; }
    setValue(v) { this.v = v; }
    interpolate() { return this; }
}
const started = [];
const anim = (value, cfg) => ({ start: () => { started.push([value, cfg.toValue]); value.v = cfg.toValue; }, stop() { } });
let looping = 0;
const Animated = {
    Value, Image: p => h("MoonImage", p), View: p => h("AnimView", p, p.children),
    timing: anim, spring: anim, multiply: a => a,
    sequence: () => ({ start() { } }), stagger: () => ({ start() { } }),
    loop: () => ({ start: () => looping++, stop: () => looping-- })
};
const RN = { View: p => h("View", p, p.children), Animated, Easing: { inOut: () => 0, ease: 0 } };

// Endcord's element hook: every element Discord creates passes callbacks registered under its component's name
const hooks = new Map();
globalThis.bunny = {
    api: {
        react: {
            jsx: {
                onJsxCreate: (name, cb) => hooks.set(name, (hooks.get(name) || []).concat(cb)),
                deleteJsxCreate: (name, cb) => hooks.set(name, (hooks.get(name) || []).filter(f => f !== cb))
            }
        }
    }
};
const jsx = (type, props, child) => {
    let el = h(type, props, child);
    for (const cb of (typeof type === "function" && hooks.get(type.name)) || []) { const r = cb(type, el); if (r !== undefined) el = r; }
    return el;
};

// Discord 355's guild bar: the Messages button is a GuildsBarAnimatedItemWrapper holding ChatIcon; servers hold their icon
function ChatIcon(p) { return h("ChatIcon", p); }
function GuildIcon(p) { return h("GuildIcon", p); }
function GuildsBarAnimatedItemWrapper(p) { return h("Wrapper", p, p.children); }
let selected = false;
const GuildsBarMessages = { default: { type: () => jsx(GuildsBarAnimatedItemWrapper, { selected, label: "Messages" }, jsx(ChatIcon, { color: "#abcdef" })) } };
const serverItem = () => jsx(GuildsBarAnimatedItemWrapper, { selected: false, label: "A server" }, jsx(GuildIcon, { color: "#abcdef" }));

const subs = {};
const Dispatcher = {
    subscribe: (t, f) => (subs[t] = subs[t] || new Set()).add(f),
    unsubscribe: (t, f) => subs[t].delete(f),
    dispatch: e => (subs[e.type] || []).forEach(f => f(e))
};
const channels = { dm: { isPrivate: () => true }, group: { type: 3 }, guild: { isPrivate: () => false } };
const after = (name, obj, cb) => {
    const orig = obj[name];
    obj[name] = function (...a) { const r = orig.apply(this, a); const n = cb.call(this, a, r); return n === undefined ? r : n; };
    return () => { obj[name] = orig; };
};
const vendetta = {
    metro: {
        findByStoreName: n => ({ ChannelStore: { getChannel: id => channels[id] }, UserStore: { getCurrentUser: () => ({ id: "me" }) } })[n],
        common: { React, ReactNative: RN, FluxDispatcher: Dispatcher }
    },
    patcher: { after },
    logger: { log() { }, warn: m => { throw new Error(m); } }
};

const plugin = new Function("vendetta", "return " + js)(vendetta);
plugin.onLoad();

const render = () => GuildsBarMessages.default.type();
let el = render();
assert.strictEqual(el.type, GuildsBarAnimatedItemWrapper, "keeps Discord's button wrapper (badges, press, selection)");
assert.strictEqual(serverItem().props.children.type, GuildIcon, "server icons untouched");
assert.strictEqual(el.props.label, "Messages");
assert.strictEqual(el.props.children.props.color, "#abcdef", "moon takes the icon's colour");

let tree;
const mount = () => TR.act(() => { tree = TR.create(render()); });
const moon = () => tree.root.findByType("MoonImage").props;
const dotsVisible = () => tree.root.findAllByType("AnimView")[0].props.style.opacity.v;
const typingLabel = () => tree.root.findAllByType("View")[0].props.accessibilityLabel;
(async () => {
    await mount();
    assert(moon().source.uri.startsWith("data:image/png;base64,iVBOR"), "the moon picture");
    assert.strictEqual(moon().style.tintColor, "#abcdef");
    assert.strictEqual(dotsVisible(), 0, "moon showing, no dots");

    // selecting the button: Midnight's spin (one turn) and the slight shrink
    started.length = 0;
    selected = true;
    await TR.act(() => tree.update(render()));
    assert(started.some(([v, to]) => to === 0.92), "shrinks when selected");
    assert(started.some(([v, to]) => to === 1 && v === moon().style.transform[0].rotate), "spins when selected");

    // someone types in a DM: dots fade in and bounce; guild channels and my own typing don't count
    await TR.act(() => Dispatcher.dispatch({ type: "TYPING_START", channelId: "guild", userId: "friend" }));
    await TR.act(() => Dispatcher.dispatch({ type: "TYPING_START", channelId: "dm", userId: "me" }));
    assert.strictEqual(dotsVisible(), 0, "guild typing and my own typing ignored");
    await TR.act(() => Dispatcher.dispatch({ type: "TYPING_START", channelId: "dm", userId: "friend" }));
    assert.strictEqual(dotsVisible(), 1, "dots showing");
    assert.strictEqual(looping, 1, "dots bouncing");
    assert.strictEqual(typingLabel(), "Someone is typing in your DMs");
    await TR.act(() => Dispatcher.dispatch({ type: "TYPING_START", channelId: "group", userId: "other" }));

    // they send: that one stops; the group chat is still typing, then stops too, and the moon spins back
    await TR.act(() => Dispatcher.dispatch({ type: "MESSAGE_CREATE", channelId: "dm", message: { author: { id: "friend" } } }));
    assert.strictEqual(dotsVisible(), 1, "group DM still typing");
    started.length = 0;
    await TR.act(() => Dispatcher.dispatch({ type: "TYPING_STOP", channelId: "group", userId: "other" }));
    assert.strictEqual(dotsVisible(), 0, "back to the moon");
    assert.strictEqual(looping, 0, "bounce stopped");
    assert(started.some(([v, to]) => to === 1 && v === moon().style.transform[0].rotate), "spins back in");

    tree.unmount();
    plugin.onUnload();
    assert.strictEqual(render().props.children.type, ChatIcon, "unload gives Discord's icon back");
    for (const t in subs) assert.strictEqual(subs[t].size, 0, "listener left on " + t);
    console.log("plugin: ok, hash", JSON.parse(fs.readFileSync(__dirname + "/manifest.json")).hash.slice(0, 12));
})().catch(e => { console.error(e); process.exit(1); });
