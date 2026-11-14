(function () {
    // Rounded for Endcord Mobile: Rounded Discord's softer corners on the phone. A theme link can only carry colours,
    // so the corners live in this plugin.
    // Every element Discord creates goes through the JSX runtime, which Endcord has already wrapped (spitroast keeps one
    // wrapper per function, and Discord's modules hold that wrapper), so a hook here sees them all, even screens drawn
    // before plugins load, at their next render. Corner radii in an element's style get rounder; nothing else changes.
    // Rounding Discord's radius tokens instead did nothing visible: most styles copy the numbers when they're built.
    // The loader runs `return <file>`, so it must start with "(". Hermes: var only, no async/classes.
    "use strict";
    var log = vendetta.logger || console;
    var KEYS = ["borderRadius", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius",
        "borderTopStartRadius", "borderTopEndRadius", "borderBottomStartRadius", "borderBottomEndRadius"];
    var undo = [];

    // 4 → 9, 8 → 14, 12 → 19, 16 → 24, 24 → 34; square stays square, pills and circles stay as they are
    function rounder(r) {
        return r > 0 && r < 100 ? Math.round(r * 1.25 + 4) : r;
    }

    // Each style object is looked at once: its rounded copy (or itself, with nothing to round) is remembered
    var seen = new WeakMap();
    var copies = new WeakSet();
    function roundStyle(s) {
        if (!s || typeof s !== "object") return s;
        if (Array.isArray(s)) {
            var out = null;
            for (var i = 0; i < s.length; i++) {
                var r = roundStyle(s[i]);
                if (r !== s[i]) {
                    out = out || s.slice();
                    out[i] = r;
                }
            }
            return out || s;
        }
        if (copies.has(s)) return s;
        var known = seen.get(s);
        if (known) return known;
        var copy = null;
        for (var k = 0; k < KEYS.length; k++) {
            var v = s[KEYS[k]];
            if (typeof v === "number" && rounder(v) !== v) {
                copy = copy || Object.assign({}, s);
                copy[KEYS[k]] = rounder(v);
            }
        }
        if (copy) copies.add(copy);
        seen.set(s, copy || s);
        return copy || s;
    }

    function onElement(args, el) {
        var props = el && el.props;
        if (!props || !props.style) return undefined;
        var style = roundStyle(props.style);
        if (style !== props.style) props.style = style; // the runtime made this props object for this element alone
        return undefined;
    }

    return {
        onLoad: function () {
            var runtime = vendetta.metro.findByProps("jsx", "jsxs");
            if (!runtime) return log.warn("Rounded: Discord's JSX runtime not found");
            ["jsx", "jsxs"].forEach(function (fn) { undo.push(vendetta.patcher.after(fn, runtime, onElement)); });
        },
        onUnload: function () {
            undo.forEach(function (fn) {
                try {
                    fn();
                } catch (e) { }
            });
            undo = [];
        }
    };
})()
