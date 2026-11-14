(function () {
    // Inkshell for Endcord Mobile: Midnight's moon where Discord shows its logo (the home button above the servers).
    // A theme link can only carry colours, so the icon lives in this plugin. make.js builds index.js from this file.
    var MOON = { uri: "__MOON__" };
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
