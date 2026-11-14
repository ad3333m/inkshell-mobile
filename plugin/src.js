(function () {
    // Midnight Logo for Endcord Mobile: Midnight's moon on the Messages button at the top of the server list, with
    // Midnight's spin when you open it, and typing dots while someone in your DMs is typing.
    // make.js builds index.js from this file (it inlines moon.png). The loader runs `return <file>`, so it must start
    // with "(". Hermes: var only, no async/classes.
    //
    // Discord draws that button in modules/guilds_bar/native/GuildsBarMessages.tsx (Discord 355): it creates a
    // GuildsBarAnimatedItemWrapper element with the chat-bubble ChatIcon as `children`, and `selected` while DMs are
    // open. The guild bar is on screen before plugins load, so patching that component's render comes too late;
    // Endcord's own element hook (bunny.api.react.jsx.onJsxCreate) sees every element as it's created, so the icon is
    // swapped there, by component name.
    "use strict";
    var metro = vendetta.metro;
    var common = metro.common;
    var React = common.React;
    var RN = common.ReactNative;
    var Animated = RN.Animated;
    var h = React.createElement;
    var log = vendetta.logger || console;
    var G = typeof globalThis !== "undefined" ? globalThis : global;

    var MOON = { uri: "__MOON__" };
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

    // ---- swapping the Messages button's icon ----

    var WRAPPER = "GuildsBarAnimatedItemWrapper";
    var ICONS = ["ChatIcon", "ClydeIcon"]; // the chat bubble now; Clyde on older Discord

    // Every guild-bar item goes through the wrapper; only the Messages button has one of these icons inside
    function swapIcon(Component, el) {
        var icon = el && el.props && el.props.children;
        if (!icon || !icon.type || ICONS.indexOf(icon.type.name) === -1) return undefined;
        return React.cloneElement(el, null, h(MoonLogo, { selected: !!el.props.selected, color: icon.props && icon.props.color }));
    }

    return {
        onLoad: function () {
            ChannelStore = metro.findByStoreName("ChannelStore");
            UserStore = metro.findByStoreName("UserStore");

            var jsx = G.bunny && G.bunny.api && G.bunny.api.react && G.bunny.api.react.jsx;
            if (!jsx || typeof jsx.onJsxCreate !== "function") return log.warn("Midnight Logo: needs Endcord's element hook (bunny.api.react.jsx)");
            jsx.onJsxCreate(WRAPPER, swapIcon);
            unpatches.push(function () { jsx.deleteJsxCreate(WRAPPER, swapIcon); });

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
