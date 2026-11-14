(function () {
    // Inkshell for Endcord Mobile: Midnight's moon where Discord shows its logo (the home button above the servers).
    // A theme link can only carry colours, so the icon lives in this plugin. make.js builds index.js from this file.
    //
    // The home button draws the asset "ClydeIcon". Newer React Native makes Image a plain function, so patching
    // Image.render does nothing there; instead every element Discord creates is checked for that asset as its source.
    var MOON = { uri: "__MOON__" };
    var unpatches = [];

    return {
        onLoad: function () {
            var logo = vendetta.ui.assets.getAssetIDByName("ClydeIcon");
            if (typeof logo !== "number") return vendetta.logger.warn("Inkshell: no ClydeIcon asset in this Discord");

            // white moon on transparent: Discord's tint colours it like the logo it replaces
            function swap(args) {
                var props = args[1];
                if (props && props.source === logo) args[1] = Object.assign({}, props, { source: MOON });
            }

            var runtime = vendetta.metro.findByProps("jsx", "jsxs"); // compiled JSX calls these
            if (runtime) ["jsx", "jsxs"].forEach(function (name) { unpatches.push(vendetta.patcher.before(name, runtime, swap)); });
            unpatches.push(vendetta.patcher.before("createElement", vendetta.metro.common.React, swap));
        },
        onUnload: function () {
            unpatches.forEach(function (unpatch) { unpatch(); });
            unpatches = [];
        }
    };
})()
