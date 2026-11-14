(function () {
    // Rounded for Endcord Mobile: Rounded Discord's softer corners on the phone. A theme link can only carry colours,
    // so the corners live in this plugin.
    // Every box Discord draws is React Native's View (Pressable, cards, rows, inputs, buttons all end in one), and View
    // is a forwardRef whose `render` React reads on every render. Rounding the corner radii in its style there reaches
    // everything, including screens drawn before plugins load, at their next render. Images get the same.
    // (v1 rounded Discord's radius tokens and v2 hooked the JSX runtime; neither reached the screen.)
    // The loader runs `return <file>`, so it must start with "(". Hermes: var only, no async/classes.
    "use strict";
    var RN = vendetta.metro.common.ReactNative;
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

    function roundProps(args) {
        var props = args[0];
        if (!props || !props.style) return;
        var style = roundStyle(props.style);
        if (style !== props.style) args[0] = Object.assign({}, props, { style: style });
    }

    return {
        onLoad: function () {
            var count = 0;
            ["View", "Image", "ImageBackground"].forEach(function (name) {
                var C = RN[name];
                var target = C && typeof C.render === "function" ? C : null; // forwardRef
                if (!target) return;
                undo.push(vendetta.patcher.before("render", target, roundProps));
                count++;
            });
            if (!count) log.warn("Rounded: React Native's View isn't a forwardRef here, nothing to round");
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
