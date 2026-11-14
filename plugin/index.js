(function () {
    // Midnight Logo for Endcord Mobile: Midnight's moon on the Messages button at the top of the server list, with
    // Midnight's spin when you open it, and typing dots while someone in your DMs is typing.
    // make.js builds index.js from this file (it inlines moon.png). The loader runs `return <file>`, so it must start
    // with "(". Hermes: var only, no async/classes.
    //
    // Discord draws that button in modules/guilds_bar/native/GuildsBarMessages.tsx (Discord 355): a memo component
    // returning GuildsBarAnimatedItemWrapper with the icon (ChatIcon) as `children`, and `selected` while DMs are open.
    // Its own code keeps a private copy of jsx(), so the icon has to be swapped in that component's output.
    "use strict";
    var metro = vendetta.metro;
    var common = metro.common;
    var React = common.React;
    var RN = common.ReactNative;
    var Animated = RN.Animated;
    var h = React.createElement;
    var log = vendetta.logger || console;
    var G = typeof globalThis !== "undefined" ? globalThis : global;

    var MOON = { uri: "data:image/png;base64,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" };
    var SIZE = 24;
    var TYPING_MS = 10000; // Discord shows someone typing for 10 s after their last keystroke
    var unpatches = [];
    var ChannelStore, UserStore;

    // ---- who's typing in DMs: channelId -> { userId: until } ----

    var typing = {};
    var listeners = [];

    function someoneTyping() {
        var now = Date.now();
        for (var c in typing) for (var u in typing[c]) if (typing[c][u] > now) return true;
        return false;
    }

    function changed() {
        listeners.slice().forEach(function (fn) { fn(); });
    }

    function isDm(channelId) {
        var ch = ChannelStore && ChannelStore.getChannel(channelId);
        if (!ch) return false;
        return typeof ch.isPrivate === "function" ? ch.isPrivate() : ch.type === 1 || ch.type === 3;
    }

    function onTypingStart(e) {
        var me = UserStore && UserStore.getCurrentUser();
        if (!e || (me && e.userId === me.id) || !isDm(e.channelId)) return;
        (typing[e.channelId] = typing[e.channelId] || {})[e.userId] = Date.now() + TYPING_MS;
        changed();
        setTimeout(changed, TYPING_MS + 50);
    }

    // TYPING_STOP carries userId; a sent message (MESSAGE_CREATE) ends its author's typing too
    function onTypingEnd(e) {
        var who = e && (e.userId || (e.message && e.message.author && e.message.author.id));
        if (who && typing[e.channelId] && typing[e.channelId][who]) {
            delete typing[e.channelId][who];
            changed();
        }
    }

    function useDmTyping() {
        var s = React.useState(someoneTyping());
        React.useEffect(function () {
            var fn = function () { s[1](someoneTyping()); };
            listeners.push(fn);
            fn();
            return function () { listeners.splice(listeners.indexOf(fn), 1); };
        }, []);
        return s[0];
    }

    // ---- the logo ----

    function timing(value, toValue, duration) {
        return Animated.timing(value, { toValue: toValue, duration: duration, easing: RN.Easing.inOut(RN.Easing.ease), useNativeDriver: true });
    }

    function MoonLogo(p) {
        var dmTyping = useDmTyping();
        var color = p.color || "#ffffff";
        var anim = React.useRef(null);
        if (!anim.current) anim.current = {
            spin: new Animated.Value(0),
            scale: new Animated.Value(p.selected ? 0.92 : 1),
            dots: new Animated.Value(dmTyping ? 1 : 0), // 0 = moon, 1 = typing dots
            bounce: [0, 1, 2].map(function () { return new Animated.Value(0); }),
            loop: null
        };
        var a = anim.current;
        var first = React.useRef(true);

        // Midnight's spin: one turn whenever the button is selected (and when typing ends, back to the moon)
        function spin() {
            a.spin.setValue(0);
            timing(a.spin, 1, 400).start();
        }

        React.useEffect(function () {
            Animated.spring(a.scale, { toValue: p.selected ? 0.92 : 1, useNativeDriver: true }).start();
            if (!first.current && p.selected) spin();
        }, [p.selected]);

        React.useEffect(function () {
            timing(a.dots, dmTyping ? 1 : 0, 220).start();
            if (dmTyping) {
                a.loop = Animated.loop(Animated.stagger(140, a.bounce.map(function (b) {
                    return Animated.sequence([timing(b, 1, 260), timing(b, 0, 260)]);
                })));
                a.loop.start();
            } else {
                if (a.loop) a.loop.stop();
                a.loop = null;
                a.bounce.forEach(function (b) { b.setValue(0); });
                if (!first.current) spin();
            }
            first.current = false;
            return function () {
                if (a.loop) a.loop.stop();
                a.loop = null;
            };
        }, [dmTyping]);

        var moonStyle = {
            position: "absolute", width: SIZE, height: SIZE, tintColor: color,
            opacity: a.dots.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [
                { rotate: a.spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-360deg"] }) },
                { scale: Animated.multiply(a.scale, a.dots.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] })) }
            ]
        };
        var dotsStyle = {
            position: "absolute", flexDirection: "row", alignItems: "center",
            opacity: a.dots,
            transform: [{ scale: a.dots.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
        };
        return h(RN.View, { style: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }, accessibilityLabel: dmTyping ? "Someone is typing in your DMs" : undefined },
            h(Animated.Image, { source: MOON, style: moonStyle }),
            h(Animated.View, { style: dotsStyle }, a.bounce.map(function (b, i) {
                return h(Animated.View, {
                    key: i,
                    style: {
                        width: 5, height: 5, borderRadius: 2.5, marginHorizontal: 1.5, backgroundColor: color,
                        opacity: b.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
                        transform: [{ translateY: b.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }]
                    }
                });
            })));
    }

    // ---- patching the Messages button ----

    function findFile(path) {
        try {
            var b = G.bunny;
            return b && b.metro && typeof b.metro.findByFilePath === "function" ? b.metro.findByFilePath(path) : undefined;
        } catch (e) {
            return undefined;
        }
    }

    // A component's render, whatever form it's exported in: function, memo, forwardRef, memo of forwardRef
    function afterRender(mod, key, cb) {
        var after = vendetta.patcher.after;
        var c = mod && mod[key];
        var wrap = function (args, res) { return cb(res); };
        if (typeof c === "function") return after(key, mod, wrap);
        if (c && typeof c.type === "function") return after("type", c, wrap);
        if (c && c.type && typeof c.type.render === "function") return after("render", c.type, wrap);
        if (c && typeof c.render === "function") return after("render", c, wrap);
        return null;
    }

    return {
        onLoad: function () {
            ChannelStore = metro.findByStoreName("ChannelStore");
            UserStore = metro.findByStoreName("UserStore");

            var button = findFile("modules/guilds_bar/native/GuildsBarMessages.tsx");
            var un = afterRender(button, "default", function (res) {
                if (!res || !res.props || !res.props.children) return res;
                var icon = res.props.children;
                return React.cloneElement(res, null, h(MoonLogo, { selected: !!res.props.selected, color: icon.props && icon.props.color }));
            });
            if (!un) return log.warn("Midnight Logo: Messages button not found in this Discord");
            unpatches.push(un);

            var D = common.FluxDispatcher;
            [["TYPING_START", onTypingStart], ["TYPING_STOP", onTypingEnd], ["MESSAGE_CREATE", onTypingEnd]].forEach(function (s) {
                D.subscribe(s[0], s[1]);
                unpatches.push(function () { D.unsubscribe(s[0], s[1]); });
            });
        },
        onUnload: function () {
            unpatches.forEach(function (un) {
                try {
                    un();
                } catch (e) { }
            });
            unpatches = [];
            typing = {};
        }
    };
})()
