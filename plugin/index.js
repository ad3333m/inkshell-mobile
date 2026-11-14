(function () {
    // Inkshell for Endcord Mobile: Midnight's moon where Discord shows its logo (the home button above the servers).
    // A theme link can only carry colours, so the icon lives in this plugin. make.js builds index.js from this file.
    var MOON = { uri: "data:image/png;base64,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" };
    var LOGOS = ["ClydeIcon"];
    var unpatch = null;

    return {
        onLoad: function () {
            var Image = vendetta.metro.common.ReactNative.Image;
            if (!Image || typeof Image.render !== "function") return vendetta.logger.warn("Inkshell: can't reach Image to swap the logo");

            var ids = {};
            LOGOS.forEach(function (name) {
                var id = vendetta.ui.assets.getAssetIDByName(name);
                if (typeof id === "number") ids[id] = true;
            });

            // white moon on transparent: Discord's tint colours it like the logo it replaces
            unpatch = vendetta.patcher.before("render", Image, function (args) {
                var props = args[0];
                if (props && typeof props.source === "number" && ids[props.source]) args[0] = Object.assign({}, props, { source: MOON });
            });
        },
        onUnload: function () {
            if (unpatch) unpatch();
            unpatch = null;
        }
    };
})()
