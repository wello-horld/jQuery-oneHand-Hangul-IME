/**
 * hangul.js
 * http://github.com/clee704/hangul-js
 * @version 1.1.2
 * @copyright Copyright 2013, Choongmin Lee
 * @license MIT license
 */
var hangul = (function (undefined) {
    "use strict";

// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
            if (this === void 0 || this === null) throw new TypeError();
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) return -1;
            var n = 0;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n !== n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) return -1;
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) return k;
            }
            return -1;
        };
    }

    /**
     * @constructor
     * @name hangul.Set
     */
    function Set() {
        var i;
        this.items = {};
        for (i = 0; i < arguments.length; i++) {
            this.add(arguments[i]);
        }
    }

    /**
     * Returns true if this set contains the specified object.
     * @param e {object} object whose presence in this set is to be tested
     * @method hangul.Set#has
     */
    Set.prototype.has = function (e) {
        return e in this.items;
    };

    /**
     * Adds the specified object into this set.
     * @param e {object} object to be added this set
     * @method hangul.Set#add
     */
    Set.prototype.add = function (e) {
        this.items[e] = 1;
    };

    /**
     * Constructs a new map, optionally containing the properties of the specified
     * object.
     * @classdesc A simple map supporting an inverse view.
     * @constructor
     * @name hangul.Map
     */
    function Map(o, _inverse) {
        this.items = {};
        /**
         * Inverse view of the map.
         * @member {hangul.Map} hangul.Map#inverse
         */
        this.inverse = _inverse || new Map(undefined, this);
        if (o) {
            this.addAll(o);
        }
    }

    /**
     * @param k {object} key
     * @param v {object} value
     * @method hangul.Map#add
     */
    Map.prototype.add = function (k, v) {
        this.items[k] = v;
        this.inverse.items[v] = k;
    };

    /**
     * @param o {object} object whose properties are to be added to this map
     * @method hangul.Map#addAll
     */
    Map.prototype.addAll = function (o) {
        var k;
        for (k in o) {
            this.add(k, o[k]);
        }
    };

    /**
     * Returns true if this map has a mapping for the specified key.
     * @param k {object} key
     * @method hangul.Map#hasKey
     */
    Map.prototype.hasKey = function (k) {
        return k in this.items;
    };

    /**
     * Returns true if this map has a mapping for the specified value.
     * @param v {object} value
     * @method hangul.Map#hasValue
     */
    Map.prototype.hasValue = function (v) {
        return v in this.inverse.items;
    };

    /**
     * Returns the associated object for the specified key or undefined
     * if there is no mapping for the key.
     * @param k {object} key
     * @method hangul.Map#get
     */
    Map.prototype.get = function (k) {
        return this.items[k];
    };

    /**
     * List of modern hangul jamo (U+3131-U+3163).
     * @member {hangul.Map} hangul.jamo
     */
    var jamo = collectJamo(0x3131, 0x3163);

    /**
     * List of modern hangul initial jamo. Actually some of these charaters are
     * not just initials, but can also be final jamo. Thus many characters in this
     * list overlap with the characters in {@link hangul.finals}.
     * @member {hangul.Map} hangul.initials
     */
    var initials = collectJamo(0x3131, 0x314e,
        [2, 4, 5, 9, 10, 11, 12, 13, 14, 15, 19]);

    /**
     * List of modern hangul medials.
     * @member {hangul.Map} hangul.medials
     */
    var medials = collectJamo(0x314f, 0x3163);

    /**
     * List of modern hangul finals. The details are the same as
     * {@link hangul.initials}. The list does not include a filler.
     * @member {hangul.Map} hangul.finals
     */
    var finals = collectJamo(0x3131, 0x314e, [7, 18, 24]);

    function collectJamo(from, to, exclude) {
        var map = new Map(),
            length = to - from + 1;
        for (var i = 0, j = 0; i < length; i++) {
            if (!exclude || exclude.indexOf(i) < 0) {
                map.add(j++, String.fromCharCode(i + from));
            }
        }
        return map;
    }

    /**
     * Returns true if the first character of the specified string represents
     * modern hangul characters (U+3131-U+3163 and U+AC00-U+D7A3; no support for
     * the "Hangul Jamo", "Hangul Jamo Extended-A", "Hangul Jamo Extended-B"
     * blocks).
     * @param {string} s
     * @function hangul.isHangul
     */
    function isHangul(s) {
        var c = s && s.charAt && s.charAt(0);
        return jamo.hasValue(c) || isSyllable(c);
    }

    /**
     * Returns true if the first character of the specified string represents
     * modern hangul syllables (U+AC00-U+D7A3).
     * @param {string} s
     * @function hangul.isSyllable
     */
    function isSyllable(s) {
        var code = s && s.charCodeAt && s.charCodeAt(0);
        return 0xac00 <= code && code <= 0xd7a3;
    }

    /**
     * Returns true if the first character of the specified string represents
     * modern jamo (U+3131-U+3163).
     * @param {string} s
     * @function hangul.isJamo
     */
    function isJamo(s) {
        return jamo.hasValue(s && s.charAt && s.charAt(0));
    }

    /**
     * Returns true if the first character of the specified string represents
     * modern hangul initials.
     * @param {string} s
     * @function hangul.isInitial
     */
    function isInitial(s) {
        return initials.hasValue(s && s.charAt && s.charAt(0));
    }

    /**
     * Returns true if the first character of the specified string represents
     * modern hangul medials.
     * @param {string} s
     * @function hangul.isMedial
     */
    function isMedial(s) {
        return medials.hasValue(s && s.charAt && s.charAt(0));
    }

    /**
     * Returns true if the first character of the specified string represents
     * modern hangul finals.
     * @param {string} s
     * @function hangul.isFinal
     */
    function isFinal(s) {
        return finals.hasValue(s && s.charAt && s.charAt(0));
    }

    /**
     * Returns the initial of the first chacater of the specified string.
     * Returns undefined if the character is not a hangul syllable.
     * @param {string} s
     * @function hangul.getInitial
     */
    function getInitial(s) {
        var code = s && s.charCodeAt && s.charCodeAt(0);
        return initials.get(Math.floor((code - 0xac00) / 28 / 21));
    }

    /**
     * Returns the medial of the first chacater of the specified string.
     * Returns undefined if the character is not a hangul syllable.
     * @param {string} s
     * @function hangul.getMedial
     */
    function getMedial(s) {
        var code = s && s.charCodeAt && s.charCodeAt(0);
        return medials.get(Math.floor((code - 0xac00) / 28) % 21);
    }

    /**
     * Returns the final of the first chacater of the specified string, or
     * an empty string '' if the syllable has no final jamo. Returns undefined
     * if the character is not a hangul syllable.
     * @param {string} s
     * @function hangul.getFinal
     */
    function getFinal(s) {
        var code = s && s.charCodeAt && s.charCodeAt(0),
            i = (code - 0xac00) % 28;
        return i > 0 ? finals.get(i - 1) : i === 0 ? '' : undefined;
    }

    /**
     * Decomposes the first character of the specified string into constituent
     * jamo and returns them as an array of length 3 (or 2 if there is no final).
     * They are obtained using {@link hangul.getInitial}, {@link hangul.getMedial}
     * and {@link hangul.getFinal}. Returns undefined if the character is not a
     * hangul syllable.
     * @param {string} s
     * @function hangul.decompose
     */
    function decompose(s) {
        var c = s && s.charAt && s.charAt(0);
        if (!isSyllable(c)) {
            return undefined;
        }
        var jamo = [getInitial(c), getMedial(c), getFinal(c)];
        if (jamo[2] === '') {
            jamo.pop();
        }
        return jamo;
    }

    /**
     * Composes from the specified constituent jamo a hangul syllable. Use
     * undefined or an empty string '' for the final filler. Returns undefined if
     * any of the arguments are not a modern jamo, except for the final which can
     * also be either undefined or an empty string.
     * @param {string} s
     * @function hangul.compose
     */
    function compose(ini, med, fin) {
        var x = initials.inverse.get(ini),
            y = medials.inverse.get(med),
            z = fin === undefined || fin === '' ? 0 : finals.inverse.get(fin) + 1,
            c = String.fromCharCode(0xac00 + (x * 21 + y) * 28 + z);
        return isSyllable(c) ? c : undefined;
    }

    /**
     * List of modern hangul double jamo (clusters and compounds).
     */
    var doubleJamo = new Map({
        '\u3133': '\u3131\u3145', '\u3135': '\u3134\u3148',
        '\u3136': '\u3134\u314e', '\u313a': '\u3139\u3131',
        '\u313b': '\u3139\u3141', '\u313c': '\u3139\u3142',
        '\u313d': '\u3139\u3145', '\u313e': '\u3139\u314c',
        '\u313f': '\u3139\u314d', '\u3140': '\u3139\u314e',
        '\u3144': '\u3142\u3145', '\u3132': '\u3131\u3131',
        '\u3138': '\u3137\u3137', '\u3143': '\u3142\u3142',
        '\u3146': '\u3145\u3145', '\u3149': '\u3148\u3148',
        '\u3158': '\u3157\u314f', '\u3159': '\u3157\u3150',
        '\u315a': '\u3157\u3163', '\u315d': '\u315c\u3153',
        '\u315e': '\u315c\u3154', '\u315f': '\u315c\u3163',
        '\u3162': '\u3163\u3163', '\u3152': '\u3150\u3150',
        '\u3156': '\u3154\u3154'
    });

    /**
     * Composes from the specified jamo a double jamo. Returns undefined if
     * the specified jamo do not make a double jamo.
     * @param {string} c1
     * @param {string} c2
     * @function hangul.composeDoubleJamo
     */
    function composeDoubleJamo(c1, c2) {
        return doubleJamo.inverse.get(c1 + c2);
    }

    /**
     * Decomposes the specified double jamo into two jamo and returns them as an
     * array of length 2. Returns undefined if the specified jamo is not a double
     * jamo.
     * @param {string} c
     * @function hangul.decomposeDoubleJamo
     */
    function decomposeDoubleJamo(c) {
        var cc = doubleJamo.get(c);
        return cc === undefined ? cc : [cc.charAt(0), cc.charAt(1)];
    }

    var iotizedVowels = new Set(
        '\u3163', '\u3151', '\u3152', '\u3155', '\u3156', '\u315b', '\u3160'
    );

    /**
     * Returns true if the first character of the specified string represents
     * a iotized vowel (including the close front vowel) that may cause
     * palatalization.
     * @param {string} s
     * @function hangul.isIotizedVowel
     */
    function isIotizedVowel(s) {
        return iotizedVowels.has(s && s.charAt && s.charAt(0));
    }

    return {
        Set: Set,
        Map: Map,
        jamo: jamo,
        initials: initials,
        medials: medials,
        finals: finals,
        isHangul: isHangul,
        isSyllable: isSyllable,
        isJamo: isJamo,
        isInitial: isInitial,
        isMedial: isMedial,
        isFinal: isFinal,
        getInitial: getInitial,
        getMedial: getMedial,
        getFinal: getFinal,
        decompose: decompose,
        compose: compose,
        composeDoubleJamo: composeDoubleJamo,
        decomposeDoubleJamo: decomposeDoubleJamo,
        isIotizedVowel: isIotizedVowel
    };

})();
/**
 * hangul-one-hand.js
 * @version 0.0.0
 * @copyright Copyright 2018, Yeonghun Lee and Minseo Kim
 *   Written based on hangu-dubeol.js, 2013, Choongmin Lee (http://github.com/clee704/hangul-js)
 * @license MIT license
 */
/**
 * @namespace hangul.oneHand
 */

var flipState = 0,
    shiftState = 0,
    nowTime,
    shiftTime,
    timeArr = [0, 0];

var numShiftMap = {
    '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^'
};

window.addEventListener("keydown", shift_flip_down, false);
window.addEventListener("keyup", shift_flip_up, false);

function shift_flip_down(event) {
    nowTime = new Date().getTime();
    if (event.keyCode === 32 && flipState === 0) flipState = 1;
    else if (event.keyCode === 16) {
        if (shiftState === 0) {
            shiftState = 1;
            shiftTime = setTimeout(function () {
                shiftState = 0;
            }, 500);
        }
        else if (shiftState === 1) {
            shiftState = 0;
        }
    }

    else{
        timeArr[0] = nowTime - timeArr[1];
        timeArr[1] = nowTime;
        if (event.keyCode !== 32 && event.keyCode !== 16 && flipState !== 0) {
            flipState = 2;
            shiftState = 0;
        }
    }

}

function shift_flip_up(event) {
    if (event.keyCode === 32) flipState = 0;
    else if (event.keyCode === 16) {
        if (shiftTime) clearTimeout(shiftTime);
        shiftTime = undefined;
    }
}

function shiftLetter(letter) {
    if (letter !== letter.toUpperCase()) return letter.toUpperCase();
    else if (letter in numShiftMap) return numShiftMap[letter];
    else return letter;
}

(function (hangul, undefined) {
    "use strict";


    /**
     * Key mapping between QWERTY and one-hand.
     * @member {hangul.Map} hangul.one-hand.map
     */
    var map1 = new hangul.Map();
    var map2 = new hangul.Map();
    var doubleMap = new hangul.Map();
    // deliberately avoided overlapping keys or values

    map1.addAll({
        '~': '~', '!': '_', '@': '!', '#': '@', '$': '#', '%': '$', '^': '%', '&': '',
        'Q': ' ', 'W': '\u3151', 'E': '\u3150', 'R': '\u3142', 'T': '\u314C', 'Y': '\u3145',
        'A': ']', 'S': '\u315B', 'D': '\u3163', 'F': '\u314F', 'G': '\u314E', 'H': '\u3134',
        'Z': '\\', 'X': '?', 'C': '>', 'V': '<', 'B':';'
    });

    map1.addAll({
        '`': '`', '1': '-', '2': '1', '3': '2', '4': '3', '5': '4', '6': '5','7': '',
        'q': ' ', 'w': '\u3151', 'e': '\u3150', 'r': '\u3142', 't': '\u3137', 'y': '\u3145',
        'a': '[', 's': '\u3157', 'd': '\u3163', 'f': '\u314F', 'g': '\u3147', 'h': '\u3134',
        'z': '\'', 'x': '/', 'c': '.', 'v': ',', 'b':':'
    });

    map2.addAll({
        '~': '·', '!': '+', '@': ')', '#': '(', '$': '*', '%': '&', '^': '^', '&': '',
        'Q': '\n', 'W': '\u3155', 'E': '\u3154', 'R': '\u314D', 'T': '\u314A', 'Y': '\u3141',
        'A': '}', 'S': '\u3160', 'D': '\u3161', 'F': '\u3153', 'G': '\u314B', 'H': '\u3139',
        'Z': '|', 'X': '?', 'C': '>', 'V': '<', 'B':';'
    });

    map2.addAll({
        '`': '·', '1': '=', '2': '0', '3': '9', '4': '8', '5': '7', '6': '6', '7': '',
        'q': '\n', 'w': '\u3155', 'e': '\u3154', 'r': '\u314d', 't': '\u3148', 'y': '\u3141',
        'a': '{', 's': '\u315c', 'd': '\u3161', 'f': '\u3153', 'g': '\u3131', 'h': '\u3139',
        'z': '\"', 'x': '/', 'c': '.', 'v': ',', 'b':':'
    });

    doubleMap.addAll({
        'q': '\u3138', 'w': '\u3152', 'e': '\u3156', 'r': '\u3143', 't': '\u3132', 'y': '\u3146', 'u': '\u3149', 'i': '\u3162'
    });
    /**
     * @param {string} text
     * @function hangul.oneHand.fromQuerty
     */
    function fromQwerty(text) {
        var buffer = [],
            m = new OneHandAutomaton(buffer);
        for (var i = 0; i < text.length; i++) {
            m.next(text.charAt(i));
        }
        m.next();
        return buffer.join('');
    }

    /**
     * @constructor
     * @name hangul.oneHand.Automaton
     */
    function OneHandAutomaton(output) {
        /**
         * @member hangul.oneHand.Automaton#output
         */
        this.output = output;
        /**
         * @member hangul.oneHand.Automaton#currentBlock
         */
        this.currentBlock = undefined;
        this._prevJamo = undefined;
    }

    /**
     * @method hangul.oneHand.Automaton#reset
     */
    OneHandAutomaton.prototype.reset = function(){
        this.currentBlock = undefined;
        this._prevJamo = undefined;
    };

    /**
     * @param {string} key
     * @method hangul.oneHand.Automaton#next
     */
    OneHandAutomaton.prototype.next = function(key){
        this.currentBlock = this._next(key);
    };

    OneHandAutomaton.prototype._next = function (currKey) {
        var buffer = this.output,
            block = this.currentBlock,
            currJamo,
            prevJamo = this._prevJamo,
            jamo,
            d;

        // Shift operation
        if (shiftState === 1) {
            if (shiftLetter(currKey)) {
                currKey = shiftLetter(currKey);
                shiftState = 0;
            }
        }

        if (flipState === 0) currJamo = map1.get(currKey);
        else currJamo = map2.get(currKey);

        if (currKey === '\b') {
            var c = undefined;
            if (block === undefined) {
                buffer.pop();
            }
            else if (hangul.isSyllable(block)) {
                jamo = hangul.decompose(block);
                if (jamo[2]) {
                    c = hangul.compose(jamo[0], jamo[1]);
                }
                else {
                    c = jamo[0];
                }
            }

            if (!hangul.isSyllable(block)) this._prevJamo = undefined;
            else {
                jamo = hangul.decompose(block);
                if (jamo[2]) this._prevJamo = jamo[1];
                else this._prevJamo = jamo[0];
            }

            return c;
        }

        if (currKey !== '\b' && currJamo === undefined) {
            return block;
        }

        if (!hangul.isJamo(currJamo)){
            this._flush();
            this.output.push(currJamo);
            this.reset();
            return undefined;
        }

        this._prevJamo = currJamo;

        if (flipState === 0) {
            if (!map1.hasKey(currKey)) {
                this._flush();
                if (currKey !== undefined) buffer.push(currKey);
                return undefined;
            }
        }
        else {
            flipState = 2;
            if (!map2.hasKey(currKey)) {
                this._flush();
                if (currKey !== undefined) buffer.push(currKey);
                return undefined;
            }
        }

        if (prevJamo !== currJamo) d = hangul.composeDoubleJamo(prevJamo, currJamo);
        else {
            if (timeArr[0] >= 500) d = undefined;
            else d = hangul.composeDoubleJamo(prevJamo, currJamo);
        }

        if (doubleMap.hasValue(d)) {
            if (!hangul.isSyllable(block)){
                if (block === d)d = undefined;
                else return d;
            }
            else {
                jamo = hangul.decompose(block);
                if (jamo[2]) {
                    if (jamo[2] === d) d = undefined;
                }
                else if (jamo[1]) {
                    if (jamo[1] === d) d = undefined;
                }
                else if (jamo[0] === d) d = undefined;
            }
        }

        if (d && !hangul.isSyllable(block)) return d;
        if (!hangul.isMedial(d) && !hangul.isFinal(d)) d = undefined;
        if (d) {
            jamo = hangul.decompose(block);
            jamo[hangul.isMedial(d) ? 1 : 2] = d;
            return hangul.compose.apply(hangul, jamo);
        }
        if (hangul.isFinal(currJamo)) {
            if (!hangul.isSyllable(block) || hangul.getFinal(block) !== '') {
                this._flush();
                return currJamo;
            }
            jamo = hangul.decompose(block);
            return hangul.compose(jamo[0], jamo[1], currJamo);
        }
        if (hangul.isInitial(currJamo)) {
            this._flush();
            return currJamo;
        }
        if (hangul.isInitial(block)) {
            return hangul.compose(block, currJamo, '');
        }
        if (!hangul.isSyllable(block) || !hangul.isInitial(prevJamo)) {
            this._flush();
            return currJamo;
        }
        jamo = hangul.decompose(block);
        if (hangul.isInitial(jamo[2])) {
            buffer.push(hangul.compose(jamo[0], jamo[1], ''));
            return hangul.compose(jamo[2], currJamo, '');
        }
        var cc = hangul.decomposeDoubleJamo(jamo[2]);
        buffer.push(hangul.compose(jamo[0], jamo[1], cc[0]));
        return hangul.compose(cc[1], currJamo, '');
    };

    OneHandAutomaton.prototype._flush = function() {
        if (this.currentBlock !== undefined){
            this.output.push(this.currentBlock);
            console.log("output.push")
        }
    };

    /**
     * @param {string} text
     * @function hangul.oneHand.toQwerty
     */
    function toQwerty(text) {
        var buffer = [];
        for (var i = 0; i < text.length; i++) {
            _toQwerty(buffer, text.charAt(i));
        }
        return buffer.join('');
    }
    function _toQwerty(buffer, currKey) {
        var cc, map;
        if (state === 0) map = map1;
        else map = map2;
        if (map.hasValue(currKey)) {
            buffer.push(map.inverse.get(currKey));
            return;
        }
        cc = hangul.decomposeDoubleJamo(currKey);
        if (cc) {
            buffer.push(map.inverse.get(cc[0]));
            buffer.push(map.inverse.get(cc[1]));
            return;
        }
        if (!hangul.isSyllable(currKey)) {
            buffer.push(currKey);
            return;
        }
        var jamo = hangul.decompose(currKey);
        for (var i =0; i < jamo.length; i++) {
            var c = jamo[i];
            if (map.hasValue(c)) {
                buffer.push(map.inverse.get(c));
                continue;
            }
            cc = hangul.decomposeDoubleJamo(c);
            buffer.push(map.inverse.get(cc[0]));
            buffer.push(map.inverse.get(cc[1]));
        }
    }

    hangul.oneHand = {
        map1: map1,
        map2: map2,
        fromQwerty: fromQwerty,
        toQwerty: toQwerty,
        Automaton: OneHandAutomaton
    };
})(hangul);
/**
 * rangyinputs_jquery.js
 */

(function($) {
    var UNDEF = "undefined";
    var getSelection, setSelection, deleteSelectedText, deleteText, insertText;
    var replaceSelectedText, surroundSelectedText, extractSelectedText, collapseSelection;

    // Trio of isHost* functions taken from Peter Michaux's article:
    // http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
    function isHostMethod(object, property) {
        var t = typeof object[property];
        return t === "function" || (!!(t == "object" && object[property])) || t == "unknown";
    }

    function isHostProperty(object, property) {
        return typeof(object[property]) != UNDEF;
    }

    function isHostObject(object, property) {
        return !!(typeof(object[property]) == "object" && object[property]);
    }

    function fail(reason) {
        if (window.console && window.console.log) {
            window.console.log("RangyInputs not supported in your browser. Reason: " + reason);
        }
    }

    function adjustOffsets(el, start, end) {
        if (start < 0) {
            start += el.value.length;
        }
        if (typeof end == UNDEF) {
            end = start;
        }
        if (end < 0) {
            end += el.value.length;
        }
        return { start: start, end: end };
    }

    function makeSelection(el, start, end) {
        return {
            start: start,
            end: end,
            length: end - start,
            text: el.value.slice(start, end)
        };
    }

    function getBody() {
        return isHostObject(document, "body") ? document.body : document.getElementsByTagName("body")[0];
    }

    $(document).ready(function() {
        var testTextArea = document.createElement("textarea");

        getBody().appendChild(testTextArea);

        if (isHostProperty(testTextArea, "selectionStart") && isHostProperty(testTextArea, "selectionEnd")) {
            getSelection = function(el) {
                var start = el.selectionStart, end = el.selectionEnd;
                return makeSelection(el, start, end);
            };

            setSelection = function(el, startOffset, endOffset) {
                var offsets = adjustOffsets(el, startOffset, endOffset);
                el.selectionStart = offsets.start;
                el.selectionEnd = offsets.end;
            };

            collapseSelection = function(el, toStart) {
                if (toStart) {
                    el.selectionEnd = el.selectionStart;
                } else {
                    el.selectionStart = el.selectionEnd;
                }
            };
        } else if (isHostMethod(testTextArea, "createTextRange") && isHostObject(document, "selection") &&
            isHostMethod(document.selection, "createRange")) {

            getSelection = function(el) {
                var start = 0, end = 0, normalizedValue, textInputRange, len, endRange;
                var range = document.selection.createRange();

                if (range && range.parentElement() == el) {
                    len = el.value.length;

                    normalizedValue = el.value.replace(/\r\n/g, "\n");
                    textInputRange = el.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());
                    endRange = el.createTextRange();
                    endRange.collapse(false);
                    if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                        start = end = len;
                    } else {
                        start = -textInputRange.moveStart("character", -len);
                        start += normalizedValue.slice(0, start).split("\n").length - 1;
                        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                            end = len;
                        } else {
                            end = -textInputRange.moveEnd("character", -len);
                            end += normalizedValue.slice(0, end).split("\n").length - 1;
                        }
                    }
                }

                return makeSelection(el, start, end);
            };

            // Moving across a line break only counts as moving one character in a TextRange, whereas a line break in
            // the textarea value is two characters. This function corrects for that by converting a text offset into a
            // range character offset by subtracting one character for every line break in the textarea prior to the
            // offset
            var offsetToRangeCharacterMove = function(el, offset) {
                return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
            };

            setSelection = function(el, startOffset, endOffset) {
                var offsets = adjustOffsets(el, startOffset, endOffset);
                var range = el.createTextRange();
                var startCharMove = offsetToRangeCharacterMove(el, offsets.start);
                range.collapse(true);
                if (offsets.start == offsets.end) {
                    range.move("character", startCharMove);
                } else {
                    range.moveEnd("character", offsetToRangeCharacterMove(el, offsets.end));
                    range.moveStart("character", startCharMove);
                }
                range.select();
            };

            collapseSelection = function(el, toStart) {
                var range = document.selection.createRange();
                range.collapse(toStart);
                range.select();
            };
        } else {
            getBody().removeChild(testTextArea);
            fail("No means of finding text input caret position");
            return;
        }

        // Clean up
        getBody().removeChild(testTextArea);

        deleteText = function(el, start, end, moveSelection) {
            var val;
            if (start != end) {
                val = el.value;
                el.value = val.slice(0, start) + val.slice(end);
            }
            if (moveSelection) {
                setSelection(el, start, start);
            }
        };

        deleteSelectedText = function(el) {
            var sel = getSelection(el);
            deleteText(el, sel.start, sel.end, true);
        };

        extractSelectedText = function(el) {
            var sel = getSelection(el), val;
            if (sel.start != sel.end) {
                val = el.value;
                el.value = val.slice(0, sel.start) + val.slice(sel.end);
            }
            setSelection(el, sel.start, sel.start);
            return sel.text;
        };

        var updateSelectionAfterInsert = function(el, startIndex, text, selectionBehaviour) {
            var endIndex = startIndex + text.length;

            selectionBehaviour = (typeof selectionBehaviour == "string") ?
                selectionBehaviour.toLowerCase() : "";

            switch (selectionBehaviour) {
                case "collapsetostart":
                    setSelection(el, startIndex, startIndex);
                    break;
                case "collapsetoend":
                    setSelection(el, endIndex, endIndex);
                    break;
                case "select":
                    setSelection(el, startIndex, endIndex);
                    break;
            }
        };

        insertText = function(el, text, index, selectionBehaviour) {
            var val = el.value;
            el.value = val.slice(0, index) + text + val.slice(index);
            if (typeof selectionBehaviour == "boolean") {
                selectionBehaviour = selectionBehaviour ? "collapseToEnd" : "";
            }
            updateSelectionAfterInsert(el, index, text, selectionBehaviour);
        };

        replaceSelectedText = function(el, text, selectionBehaviour) {
            var sel = getSelection(el), val = el.value;
            el.value = val.slice(0, sel.start) + text + val.slice(sel.end);
            updateSelectionAfterInsert(el, sel.start, text, selectionBehaviour || "collapseToEnd");
        };

        surroundSelectedText = function(el, before, after, selectionBehaviour) {
            if (typeof after == UNDEF) {
                after = before;
            }
            var sel = getSelection(el), val = el.value;
            el.value = val.slice(0, sel.start) + before + sel.text + after + val.slice(sel.end);
            var startIndex = sel.start + before.length;
            updateSelectionAfterInsert(el, startIndex, sel.text, selectionBehaviour || "select");
        };

        function jQuerify(func, returnThis) {
            return function() {
                var el = this.jquery ? this[0] : this;
                var nodeName = el.nodeName.toLowerCase();

                if (el.nodeType == 1 && (nodeName == "textarea" || (nodeName == "input" && el.type == "text"))) {
                    var args = [el].concat(Array.prototype.slice.call(arguments));
                    var result = func.apply(this, args);
                    if (!returnThis) {
                        return result;
                    }
                }
                if (returnThis) {
                    return this;
                }
            };
        }

        $.fn.extend({
            getSelection: jQuerify(getSelection, false),
            setSelection: jQuerify(setSelection, true),
            collapseSelection: jQuerify(collapseSelection, true),
            deleteSelectedText: jQuerify(deleteSelectedText, true),
            deleteText: jQuerify(deleteText, true),
            extractSelectedText: jQuerify(extractSelectedText, false),
            insertText: jQuerify(insertText, true),
            replaceSelectedText: jQuerify(replaceSelectedText, true),
            surroundSelectedText: jQuerify(surroundSelectedText, true)
        });
    });
})(jQuery);


/**
jQuery-oneHandIME.js
 */
(function ($, hangul, undefined) {

    var buffer = [],
        automaton = new hangul.oneHand.Automaton(buffer),
        inputMode = 'hangul';

    var methods = {
        init: function(options) {
            return this.each(function() {
                var $this = $(this),

                    data = $this.data('onehandime');
                if (!data) {
                    var config = $.extend({
                            // TODO default options
                        }, options),
                        listeners = {
                            'keypress.onehandime': keypress,
                            'keydown.onehandime': keydown,
                            'mousedown.onehandime': reset,
                            'blur.onehandime': reset
                        };
                    $this.data('onehandime', {
                        config: config
                    }).bind(listeners);
                }
            });
        },
        destroy: function() {
            return this.each(function(){
                var $this = $(this),
                    data = $this.data('onehandime');
                if (data) {
                    $this.unbind('.onehandime').removeData('onehandime');
                }
            });
        }
    };

    $.fn.onehandime = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method' + method + ' does not exist on jQuery.onehandime');
        }
    };

    var KEY_CODE = {
        BACKSPACE: 8,
        TAB: 9,
        RETURN: 13,
        PAUSE_BREAK: 19,
        CAPS_LOCK: 20,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        INSERT: 45,
        DELETE: 46,
        LEFT_WINDOWS: 91,
        RIGHT_WINDOWS: 92,
        RIGHT_COMMAND: 93,
        F1: 112,
        F12: 123,
        SCROLL_LOCK: 145,
        IME: 229
    };

    function keypress(e) {
        var $this = $(this),
            c = e.which;
        // In Firefox, special keys also trigger keypress events; so filter them
        if (e.metaKey || e.altKey || e.ctrlKey ||
            e.shiftKey && c == KEY_CODE.SPACE || c == KEY_CODE.IME ||
            c == 0 || c == KEY_CODE.BACKSPACE || c == KEY_CODE.TAB ||
            c == KEY_CODE.PAUSE_BREAK || c == KEY_CODE.CAPS_LOCK ||
            c == KEY_CODE.SCROLL_LOCK) return;
        if (inputMode === 'hangul') {
            return put($this, c);
        }
    }

    function keydown(e){
        var $this = $(this),
            c = e.which;
        if (e.shiftKey && e.altKey) {
            changeInputMode();
            return false;
        }
        else if (inputMode === 'hangul') {
            if (c == KEY_CODE.BACKSPACE) {
                return del($this);
            }
            else if (e.metaKey || e.altKey || e.ctrlKey ||
                c == KEY_CODE.TAB || c == KEY_CODE.PAUSE_BREAK ||
                c == KEY_CODE.CAPS_LOCK || c == KEY_CODE.INSERT ||
                c == KEY_CODE.DELETE || c == KEY_CODE.LEFT_WINDOWS ||
                c == KEY_CODE.RIGHT_WINDOWS || c == KEY_CODE.SCROLL_LOCK ||
                c >= KEY_CODE.PAGE_UP && c <= KEY_CODE.DOWN_ARROW ||
                c >= KEY_CODE.F1 && c <= KEY_CODE.F12) {
                automaton.reset();
            }
        }
    }

    function reset() {
        if (inputMode === 'hangul') automaton.reset();
    }

    function changeInputMode() {
        inputMode = (inputMode === 'qwerty') ? 'hangul' : 'qwerty';
        automaton.reset();
    }

    function put($this, keyCode) {
        var useNativePutter = false;
        if (automaton.currentBlock !== undefined) {
            var s = $this.getSelection();
            $this.setSelection(s.end - 1, s.end);
            if ($this.getSelection().text !== automaton.currentBlock) {
                $this.setSelection(s.start, s.end);
            }
        }
        if (keyCode == KEY_CODE.RETURN) {
            keyCode = 10;
        }

        var ch = String.fromCharCode(keyCode);
        automaton.next(ch);
        if (buffer.length > 0) {
            if (buffer[buffer.length-1] === ch &&
                automaton.currentBlock === undefined) {
                buffer.pop();
                useNativePutter = true;
            }
            $this.replaceSelectedText(buffer.join(''));
            buffer.length = 0;
            if (useNativePutter) {
                return;
            }
        }
        if (automaton.currentBlock !== undefined) {
            $this.replaceSelectedText(automaton.currentBlock);
        }
        return false;
    }

    function del($this) {
        if (automaton.currentBlock === undefined) {
            return true;
        }
        else {
            var s = $this.getSelection();
            $this.setSelection(s.end-1, s.end);
            automaton.next('\b');
            if (automaton.currentBlock === undefined) {
                $this.deleteSelectedText();
            }
            else {
                $this.replaceSelectedText(automaton.currentBlock);
            }
            return false;
        }

    }

})(jQuery, hangul);