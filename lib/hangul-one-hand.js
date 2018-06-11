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