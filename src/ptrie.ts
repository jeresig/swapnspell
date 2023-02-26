/*
    PackedTrie - Trie traversal of a packed-string Trie representation.

        Copyright (c) 2011 Mike Koss, http://startpad.org
        MIT Licensed

    Usage:

        ptrie = new PackedTrie(<string> compressed);
        bool = ptrie.isWord(word)
*/
var NODE_SEP = ';',
    STRING_SEP = ',',
    TERMINAL_PREFIX = '!',
    BASE = 36,
    MAX_WORD = 'zzzzzzzzzz';

var reNodePart = new RegExp("([a-z]+)(" + STRING_SEP + "|[0-9A-Z]+|$)", 'g');
var reSymbol = new RegExp("([0-9A-Z]+):([0-9A-Z]+)");

type Match = {
    terminal: boolean,
    prefix: string,
    inode: number | undefined
};

// Implement isWord given a packed representation of a Trie.
export default class PackedTrie {
    nodes: Array<string>;
    syms: Array<number>;
    symCount: number;

    constructor(pack: string) {
        this.nodes = pack.split(NODE_SEP);
        this.syms = [];
        this.symCount = 0;

        while (true) {
            var m = reSymbol.exec(this.nodes[0]);
            if (!m) {
                break;
            }
            this.syms[fromAlphaCode(m[1])] = fromAlphaCode(m[2]);
            this.symCount++;
            this.nodes.shift();
        }
    }

    isWord(word: string) {
        return this.match(word) == word;
    }

    // Return largest matching string in the dictionary
    match(word: string, inode: number = 0): string | undefined {
        var next = this.findNextNode(word, inode);

        if (next == undefined) {
            return undefined;
        }
        if (next && next.terminal) {
            return next.prefix;
        }

        if (next.inode != undefined) {
            var suffix = this.match(word.slice(next.prefix.length), next.inode);
            if (suffix != undefined) {
                return next.prefix + suffix;
            }
            if (this.nodes[inode][0] == TERMINAL_PREFIX) {
                return '';
            }
        }
    }

    max() {
        return MAX_WORD;
    }

    enumerate(from: string, beyond: string, fn: (prefix: string) => boolean, inode: number, prefix: string) {
        var node = this.nodes[inode], cont = true;
        var self = this;

        if (node[0] == TERMINAL_PREFIX) {
            if (from <= prefix && prefix < beyond && fn(prefix)) {
                return false;
            }
            node = node.slice(1);
        }

        node.replace(reNodePart, function (w, str, ref) {
            var match = prefix + str;

            // Done or no possible future match from str
            if (!cont || match >= beyond || match < from.slice(0, match.length)) {
                return str;
            }

            var isTerminal = ref == STRING_SEP || ref == '';

            if (isTerminal) {
                if (from <= match && match < beyond && fn(match)) {
                    cont = false;
                }
                return str;
            }

            cont = self.enumerate(from, beyond, fn, self.inodeFromRef(ref, inode), match);
        });

        return cont;
    }

    // Find a prefix of word in the packed node and return the common prefix.
    // {inode: number, terminal: boolean, prefix: string}
    // (or undefined in no word prefix found).
    findNextNode(word: string, inode: number): Match | undefined {
        var node = this.nodes[inode], isTerminal;
        var match: Match | undefined = undefined;
        var self = this;

        if (node[0] == TERMINAL_PREFIX) {
            isTerminal = true;
            node = node.slice(1);
        }

        // Iterate through each pattern (prefix) string in the node
        node.replace(reNodePart, function (w, prefix, ref) {
            var common, isTerminal, fullMatch;

            // Quick exit - already matched, or first chars don't match
            if (match || prefix[0] != word[0]) {
                return prefix;
            }

            isTerminal = ref == STRING_SEP || ref == '';
            fullMatch = prefix == word.slice(0, prefix.length);
            common = commonPrefix(prefix, word);

            match = {
                terminal: isTerminal && fullMatch,
                prefix: common,
                inode: !isTerminal && fullMatch ? self.inodeFromRef(ref, inode) : undefined
            };
        });

        // No better match - then return the empty string match at this node
        if (!match && isTerminal) {
            return {
                terminal: true,
                prefix: '',
                inode: undefined
            };
        }

        return match;
    }

    // References are either absolute (symbol) or relative (1 - based)
    inodeFromRef(ref: string, inode: number) {
        var dnode = fromAlphaCode(ref);
        if (dnode < this.symCount) {
            return this.syms[dnode];
        }
        return inode + dnode + 1 - this.symCount;
    }

    // Increment a string one beyond any string with the current prefix
    beyond(s: string) {
        if (s.length == 0) {
            return this.max();
        }
        var asc = s.charCodeAt(s.length - 1);
        return s.slice(0, -1) + String.fromCharCode(asc + 1);
    }
}

// 0, 1, 2, ..., A, B, C, ..., 00, 01, ... AA, AB, AC, ..., AAA, AAB, ...
function toAlphaCode(n: number) {
    var places, range, s = "", d, ch;

    for (places = 1, range = BASE;
            n >= range;
            n -= range, places++, range *= BASE) {}

    while (places--) {
        d = n % BASE;
        s = String.fromCharCode((d < 10 ? 48 : 55) + d) + s;
        n = (n - d) / BASE;
    }
    return s;
}

function fromAlphaCode(s: string) {
    var n = 0, places, range, pow, i, d;

    for (places = 1, range = BASE;
            places < s.length;
            n += range, places++, range *= BASE) {}

    for (i = s.length - 1, pow = 1; i >= 0; i--, pow *= BASE) {
        d = s.charCodeAt(i) - 48;
        if (d > 10) {
            d -= 7;
        }
        n += d * pow;
    }
    return n;
}

function commonPrefix(w1: string, w2: string) {
    var maxlen = Math.min(w1.length, w2.length);
    for (var i = 0; i < maxlen && w1[i] == w2[i]; i++) {}
    return w1.slice(0, i);
}
