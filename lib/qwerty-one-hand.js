// Not finished
/**
 * qwerty-one-hand.js
 * @version 0.0.0
 * @copyright Copyright 2018, Yeonghun Lee and Minseo Kim
 *   Written based on hangul-dubeol.js and hangul.js, 2013, Choongmin Lee (http://github.com/clee704/hangul-js)
 *@licence MIT license
 */
/**
 * @namespace qwerty.oneHand
 */
var flipState = 0,
    shiftState = 0,
    nowTime,
    shiftTime;

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


(function (undefined) {
    "use strict";

    /**
     * Key mapping between QWERTY and qwerty-one-hand
     * @member {hangul.Map} qwerty.oneHand.map
     */
    var map1 = new hangul.Map();
    var map2 = new hangul.Map();
    map1.addAll({
        '~': '~', '!': '_', '@': '!', '#': '@', '$': '#', '%': '$', '^': '%',
        'Q': '\b', 'W': 'Q', 'E': 'W', 'R': 'E', 'T': 'R', 'Y': 'T',
        'A': ']', 'S': 'A', 'D': 'S', 'F': 'D', 'G': 'F', 'H': 'G',
        'Z': '\\', 'X': 'Z', 'C': 'X', 'V': 'C', 'B':'V', 'N':'B'
    });

    map1.addAll({
        '`': '`', '1': '-', '2': '1', '3': '2', '4': '3', '5': '4', '6': '5',
        'q': '\b', 'w': 'q', 'e': 'w', 'r': 'e', 't': 'r', 'y': 't',
        'a': '[', 's': 'a', 'd': 's', 'f': 'd', 'g': 'f', 'h': 'g',
        'z': '\'', 'x': 'z', 'c': 'x', 'v': 'c', 'b':'v', 'n':'b'
    });

    map2.addAll({
        '~': '·', '!': '+', '@': ')', '#': '(', '$': '*', '%': '&', '^': '^',
        'Q': '\n', 'W': 'P', 'E': 'O', 'R': 'I', 'T': 'U', 'Y': 'Y',
        'A': '}', 'S': ';', 'D': 'L', 'F': 'K', 'G': 'J', 'H': 'H',
        'Z': '|', 'X': '?', 'C': '>', 'V': '<', 'B':'M', 'N':'N'
    });

    map2.addAll({
        '`': '·', '1': '=', '2': '0', '3': '9', '4': '8', '5': '7', '6': '6',
        'q': '\n', 'w': 'q', 'e': 'w', 'r': 'e', 't': 'r', 'y': 't',
        'a': '{', 's': ':', 'd': 'l', 'f': 'k', 'g': 'j', 'h': 'h',
        'z': '\"', 'x': '/', 'c': '.', 'v': ',', 'b':'m', 'n':'n'
    });

    /**
     * @param {string} text
     * @function qwerty.oneHand.fromQwerty
     */
    function fromQwerty(text) {
        var buffer = [],
            m = new OneHandAutomaton(buffer);
        for(var i = 0; i < text.length; i++) {
            m.next(text.charAt(i));
        }
        m.next();
        return buffer.join('');
    }

    /**
     * @constructor
     * @name qwerty.oneHand.Automaton
     */
    function OneHandAutomaton(output) {
        /**
         * @member qwerty.oneHand.Automaton#output
         */
        this.output = output;
    }

    OneHandAutomaton.prototype._next = function(currKey) {
        var buffer = this.output,
            currChar;

        // Shift operation
        if (shiftState === 1) {
            if (shiftLetter(currKey)) {
                currKey = shiftLetter(currKey);
                shiftState = 0;
            }
        }


        if (flipState === 0) currChar = map1.get(currKey);
        else currChar = map2.get(currKey);

        if (currKey === '\b' || currChar === '\b') buffer.pop();

        this.output.push(currChar);
    };

    function toQwerty(text) {
        var buffer = [];
        for (var i = 0; i < text.length; i++) {
            _toQwerty(buffer, text.charAt(i));
        }
        return buffer.join('');
    }

    function _toQwerty(buffer, currKey) {
        var map;
        if (flipState === 0) map = map1;
        else map = map2;
        if (map.hasValue(currKey)) {
            buffer.push(map.inverse.get(currKey));
        }
    }

    qwerty.oneHand = {
        map1: map1,
        map2: map2,
        fromQwerty: fromQwerty,
        toQwerty: toQwerty,
        Automaton: OneHandAutomaton
    };

})(undefined);