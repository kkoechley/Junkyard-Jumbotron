// ----------------------------------------------------------------------
// Utilities, some mirrored from node.js, connect, underscore, and string

var path = require('path');
var log4js = require('log4js')();
var logger = log4js.getLogger();
var nutils = require('util');
var params = require('./params');
var _  = require('underscore');

// Return string version of an object
function stringify(obj) {
    if (obj === null)           return "null";	
    if (_.isUndefined(obj))     return "undefined";
    if (_.isFunction(obj))	return "[Function]";
    if (_.isString(obj))	return obj;
    if (obj.message)		return obj.message; // For Exceptions
    if (_.isArguments(obj))
	return _.toArray(obj).map(stringify).join(" ");
    return nutils.inspect(obj, false, 0, false).replace(/\n|( ) */g, '$1');
}

module.exports = {

    stringify: stringify,
    inspect: nutils.inspect,

    stackTrace: function stackTrace() {
	var err = {};
	Error.captureStackTrace(err, this.printStack);
	return err.stack;
    },

    uid: function uid(len) {
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charlen = chars.length;
	var buf = [];
	for (var i = 0; i < len; ++i)
	    buf.push(chars[Math.floor(Math.random() * charlen)]);
	return buf.join('');
    },

    error: function error() {
	logger.error("ERROR: " + stringify(arguments));
	for (var a in arguments) {
	    if (arguments[a].stack)
		logger.error(arguments[a].stack);
	}
    },

    log: function log() {
	logger.info(stringify(arguments));
    },

    debug: function debug() {
	logger.debug(stringify(arguments));
    },

    inherits: function inherits(superCtor, props) { 
	var prototype = Object.create(superCtor.prototype);
	if (props)
	    _.extend(prototype, props);
	return prototype;
    },

    uniqueFileName: function uniqueFileName() {
	return [Date.now().toString(36),
		(Math.random() * 0x100000000 + 1).toString(36)].join('.');
    },

    tmpFileName: function tmpFileName() {
	return path.join(params.tmpDir, this.uniqueFileName());
    },

    escapeForShell: function escapeForShell(str){
	return str.replace(/(?=[^a-zA-Z0-9_.\/\-\x7F-\xFF\n])/gm, '\\');
    },
    
    // copied from underscore.strings
    isStartsWith: function(str, starts){
    return str.length >= starts.length && str.substring(0, starts.length) === starts;
    },
    // copied from underscore.strings
	sprintf: function(){

		var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
		while (f) {
			if (m = /^[^\x25]+/.exec(f)) {
				o.push(m[0]);
			}
			else if (m = /^\x25{2}/.exec(f)) {
				o.push('%');
			}
			else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
				if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) {
					throw('Too few arguments.');
				}
				if (/[^s]/.test(m[7]) && (typeof(a) != 'number')) {
					throw('Expecting number but found ' + typeof(a));
				}
				switch (m[7]) {
					case 'b': a = a.toString(2); break;
					case 'c': a = String.fromCharCode(a); break;
					case 'd': a = parseInt(a); break;
					case 'e': a = m[6] ? a.toExponential(m[6]) : a.toExponential(); break;
					case 'f': a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a); break;
					case 'o': a = a.toString(8); break;
					case 's': a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a); break;
					case 'u': a = Math.abs(a); break;
					case 'x': a = a.toString(16); break;
					case 'X': a = a.toString(16).toUpperCase(); break;
				}
				a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+'+ a : a);
				c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
				x = m[5] - String(a).length - s.length;
				p = m[5] ? this.str_repeat(c, x) : '';
				o.push(s + (m[4] ? a + p : p + a));
			}
			else {
				throw('Huh ?!');
			}
			f = f.substring(m[0].length);
		}
		return o.join('');
	},
	str_repeat: function (i, m) {
        for (var o = []; m > 0; o[--m] = i);
        return o.join('');
    }

    
};

// Add all of underscore
_.extend(module.exports, _);

// ----------------------------------------------------------------------
// Extend classes and prototypes
// Object.defineProperty makes them non-enumerable, etc.

// String.prototype.format
Object.defineProperty(String.prototype, 'format', {
    value: function format() {
	var parts = this.split(/\{([0-9]+)\}/);
	for (var p = 1; p < parts.length; p += 2)
	    parts[p] = arguments[parseInt(parts[p])];
	return parts.join('');
    }
});

// Math.mod to deal correctly with negative numbers
Object.defineProperty(Math, 'mod', {
    value: function mod(a, b) {
	return ((a % b) + b) % b;
    }
});
