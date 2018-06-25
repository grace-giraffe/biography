"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class IgnoreParser {
    constructor() {
        this.cache = {};
    }
    ignore(fp, options) {
        if (!fp || !fs.existsSync(fp))
            return [];
        if (this.cache.hasOwnProperty(fp)) {
            return this.cache[fp];
        }
        this.options = options;
        const str = fs.readFileSync(fp, 'utf8');
        const lines = str.split(/\r\n|\n/);
        const arr = this.unique(this.parse(lines, this.options));
        if (this.options && this.options['cache'] !== false) {
            this.cache[fp] = arr;
        }
        return arr;
    }
    parse(arr, opts) {
        arr = this.arrayify(arr);
        const len = arr.length;
        let i = -1;
        let res = [];
        while (++i < len) {
            let str = arr[i];
            str = (str || '').trim();
            if (!str || str.charAt(0) === '#') {
                continue;
            }
            const parsed = this.toGlob(str);
            this.addPattern(res, parsed.patterns, parsed.stats, opts);
        }
        return res;
    }
    addPattern(res, arr, stats, options) {
        arr = this.arrayify(arr);
        const len = arr.length;
        let i = -1;
        while (++i < len) {
            let str = arr[i];
            if (stats.isNegated) {
                str = '!' + str;
            }
            if (res.indexOf(str) === -1) {
                res.push(str);
            }
        }
        return res;
    }
    toGlob(str) {
        let parsed = {
            stats: {},
            patterns: []
        }, stats = {
            first: '',
            last: '',
            isNegated: false,
        };
        stats.first = str.charAt(0);
        stats.last = str.slice(-1);
        stats.isNegated = stats.first === '!';
        if (stats.isNegated) {
            str = str.slice(1);
            stats.first = str.charAt(0);
        }
        if (stats.first === '/') {
            str = str.slice(1);
        }
        if (/\w\/[*]{2}\/\w/.test(str)) {
            str += '|' + str.split('/**/').join('/');
        }
        if (/^[\w.]/.test(str) && /\w$/.test(str) && this.options.isGlob) {
            str += '|' + str + '/**';
        }
        else if (/\/$/.test(str)) {
            str += '**';
        }
        parsed.stats = stats;
        parsed.patterns = str.split('|');
        return parsed;
    }
    arrayify(val) {
        return Array.isArray(val) ? val : [val];
    }
    unique(_arr) {
        const arr = this.immutable(_arr);
        if (!Array.isArray(arr)) {
            throw new TypeError('array-unique expects an array.');
        }
        const len = arr.length;
        let i = -1;
        while (i++ < len) {
            let j = i + 1;
            for (; j < arr.length; ++j) {
                if (arr[i] === arr[j]) {
                    arr.splice(j--, 1);
                }
            }
        }
        return arr;
    }
    immutable(arr) {
        if (!Array.isArray(arr)) {
            throw new TypeError('array-unique expects an array.');
        }
        let arrLen = arr.length;
        let newArr = new Array(arrLen);
        for (let i = 0; i < arrLen; i++) {
            newArr[i] = arr[i];
        }
        return newArr;
    }
}
exports.IgnoreParser = IgnoreParser;
//# sourceMappingURL=ignoreparser.js.map