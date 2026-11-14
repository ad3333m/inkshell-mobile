(function () {
    // Rounded for Endcord Mobile: Rounded Discord's softer corners on the phone. A theme link can only carry colours,
    // so the corners live in this plugin.
    // Discord's mobile corners come from tokens (discord_common/js/packages/tokens, Discord 355): `radii` (xs 4 … xxl 32)
    // and per-component radius tokens under `modules` (cards, table rows, inputs, the chat bar, channel rows, voice
    // tiles…) that components resolve on every render through useToken. Rounding those resolves rounds what's already
    // on screen at its next render.
    // The loader runs `return <file>`, so it must start with "(". Hermes: var only, no async/classes.
    "use strict";
    var log = vendetta.logger || console;

    // Corners Discord means to keep as they are: the keyboard and media keyboard (never touched), and the guild-bar
    // squircle, whose shape is how a selected server stands out from the round ones
    var KEEP = /KEYBOARD|GUILD_ITEM_SELECTED|GUILD_FOLDER/;
    var undo = [];

    // 4 → 9, 8 → 14, 12 → 19, 16 → 24, 24 → 34; square stays square, pills and circles stay as they are
    function rounder(r) {
        return typeof r === "number" && r > 0 && r < 100 ? Math.round(r * 1.25 + 4) : r;
    }

    return {
        onLoad: function () {
            var mod = vendetta.metro.findByProps("SemanticColor");
            var tokens = mod && mod.default;
            if (!tokens || !tokens.modules || !tokens.radii) return log.warn("Rounded: Discord's radius tokens not found");

            var count = 0;
            Object.keys(tokens.modules).forEach(function (group) {
                var g = tokens.modules[group];
                Object.keys(g || {}).forEach(function (key) {
                    if (!/RADIUS/.test(key) || KEEP.test(key) || !g[key] || typeof g[key].resolve !== "function") return;
                    undo.push(vendetta.patcher.after("resolve", g[key], function (args, r) { return rounder(r); }));
                    count++;
                });
            });

            // radii feed styles Discord builds after this point (new screens, and every style after a theme change)
            var before = {};
            Object.keys(tokens.radii).forEach(function (k) {
                before[k] = tokens.radii[k];
                try {
                    tokens.radii[k] = rounder(tokens.radii[k]);
                } catch (e) { }
            });
            undo.push(function () {
                Object.keys(before).forEach(function (k) {
                    try {
                        tokens.radii[k] = before[k];
                    } catch (e) { }
                });
            });
            log.log("Rounded: " + count + " corner tokens rounded");
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
