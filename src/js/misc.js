
// Environment specific stuff
var $exports     = {},
    $zenv        = {},
    $global      = (typeof window !== "undefined" && window !== null) ? window
                                                                     : (typeof global !== 'undefined' ? global
                                                                                                      : this),
    $isInBrowser = typeof navigator !== "undefined",
    isIE         = $isInBrowser && (Object.hasOwnProperty.call(window, "ActiveXObject") ||
                                  !!window.ActiveXObject ||
                                  window.navigator.userAgent.indexOf("Edge") > -1),
    isFF         = $isInBrowser && window.mozInnerScreenX !== null,
    isMacOS      = $isInBrowser && navigator.platform.toUpperCase().indexOf('MAC') !== -1,
    $FN          = null;


/**
 * Reference to global space.
 * @attribute $global
 * @private
 * @readOnly
 * @type {Object}
 * @for zebkit
 */

if (parseInt.name !== "parseInt") {
    $FN = function(f) {  // IE stuff
        if (typeof f.$methodName === 'undefined') { // test if name has been earlier detected
            var mt = f.toString().match(/^function\s+([^\s(]+)/);
                f.$methodName = (mt === null) ? ''
                                              : (typeof mt[1] === "undefined" ? ''
                                                                              : mt[1]);
        }
        return f.$methodName;
    };
} else {
    $FN = function(f) {
        return f.name;
    };
}

function $export() {
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg === 'function') {
            $exports[$FN(arg)] = arg;
        } else {
            for (var k in arg) {
                if (arg.hasOwnProperty(k)) {
                    $exports[k] = arg[k];
                }
            }
        }
    }
}


if (typeof zebkitEnvironment === 'function') {
    $zenv = zebkitEnvironment();
} else if (typeof window !== 'undefined') {
    $zenv = window;
}

// Map class definition for old browsers
function $Map() {
    var Map = function() {
        this.keys   = [];
        this.values = [];
        this.size   = 0 ;
    };

    Map.prototype = {
        set : function(key, value) {
            var i = this.keys.indexOf(key);
            if (i < 0) {
                this.keys.push(key);
                this.values.push(value);
                this.size++;
            } else {
               this.values[i] = value;
            }
            return this;
         },

        delete: function(key) {
            var i = this.keys.indexOf(key);
            if (i < 0) {
               return false;
            }

            this.keys.splice(i, 1);
            this.values.splice(i, 1);
            this.size--;
            return true;
        },

        get : function(key) {
            var i = this.keys.indexOf(key);
            return i < 0 ? undefined : this.values[i];
        },

        clear : function() {
            this.keys = [];
            this.keys.length = 0;
            this.values = [];
            this.values.length = 0;
            this.size = 0;
        },

        has : function(key) {
            return this.keys.indexOf(key) >= 0;
        },

        forEach: function(callback, context) {
            var $this = arguments.length < 2 ? this : context;
            for(var i = 0 ; i < this.size; i++) {
                callback.call($this, this.values[i], this.keys[i], this);
            }
        }
    };
    return Map;
}

// ES6 Map is class
if (typeof Map === 'undefined' && (typeof $global !== 'undefined' || typeof $global.Map === "undefined")) {
    $global.Map = $Map();
}

function GET(url, data) {
    var req = $zenv.getHttpRequest();
    req.open("GET", url, true);
    return new DoIt(function() {
        var jn    = this.join(),
            $this = this;

        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                // evaluate http response
                if (req.status >= 400 || req.status < 100) {
                    var e = new Error("HTTP error '" + req.statusText + "', code = " + req.status + " '" + url + "'");
                    e.status     = req.status;
                    e.statusText = req.statusText;
                    e.readyState = req.readyState;
                    $this.error(e);
                } else {
                    jn(req);
                }
            }
        };

        try {
            req.send(null);
        } catch(e) {
            this.error(e);
        }
    });
}

/**
 * Dump the given error to output.
 * @param  {Exception | Object} e an error.
 * @method dumpError
 * @for  zebkit
 */
function dumpError(e) {
    if (typeof console !== "undefined" && typeof console.log !== "undefined") {
        var msg = "zebkit.err [";
        if (typeof Date !== 'undefined') {
            var date = new Date();
            msg = msg + date.getDate()   + "/" +
                  (date.getMonth() + 1) + "/" +
                  date.getFullYear() + " " +
                  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        }


        if (e === null || typeof e === 'undefined') {
            console.log("Unknown error");
        } else {
            console.log(msg + " : " + e);
            console.log((e.stack ? e.stack : e));
        }
    }
}


/**
 * Load image or complete the given image loading.
 * @param  {String|Image} ph path or image to complete loading.
 * @param  {Boolean} [fireErr] flag to force or preserve error firing.
 * @return {zebkit.DoIt}
 * @method image
 * @for  zebkit
 */
function image(ph, fireErr) {
    if (arguments.length < 2) {
        fireErr = false;
    }

    var d  = new DoIt(),
        jn = d.join();

    $zenv.loadImage(ph,
        function(img) {
            jn(img);
        },
        function(img, e) {
            if (fireErr === true) {
                d.error(e);
            } else {
                jn(img);
            }
        }
    );
    return d;
}


// ( (http) :// (host)? (:port)? (/)? )? (path)? (?query_string)?
//
//  [1] scheme://host/
//  [2] scheme
//  [3] host
//  [4]  port
//  [5] /
//  [6] path
//  [7] ?query_string
//
var $uriRE = /^(([a-zA-Z]+)\:\/\/([^\/:]+)?(\:[0-9]+)?(\/)?)?([^?]+)?(\?.+)?/;

//  Faster match operation analogues:
//  Math.floor(f)  =>  ~~(a)
//  Math.round(f)  =>  (f + 0.5) | 0



/**
 * Check if the given value is string
 * @param {Object} v a value.
 * @return {Boolean} true if the given value is string
 * @method isString
 * @for zebkit
 */
function isString(o)  {
    return typeof o !== "undefined" && o !== null &&
          (typeof o === "string" || o.constructor === String);
}

/**
 * Check if the given value is number
 * @param {Object} v a value.
 * @return {Boolean} true if the given value is number
 * @method isNumber
 * @for zebkit
 */
function isNumber(o)  {
    return typeof o !== "undefined" && o !== null &&
          (typeof o === "number" || o.constructor === Number);
}

/**
 * Check if the given value is boolean
 * @param {Object} v a value.
 * @return {Boolean} true if the given value is boolean
 * @method isBoolean
 * @for zebkit
 */
function isBoolean(o) {
    return typeof o !== "undefined" && o !== null &&
          (typeof o === "boolean" || o.constructor === Boolean);
}

// get a value by the specified path from the given object or global space object
function lookupObjValue(obj, name) {
    if (arguments.length === 1) {
        name = obj;
        obj  = $global;
    }

    if (typeof name === 'undefined' || name.trim().length === 0) {
        throw new Error("Invalid field name: '" + name + "'");
    }

    var names = name.trim().split('.');
    for(var i = 0; i < names.length; i++) {
        obj = obj[names[i]];

        if (typeof obj === 'undefined' || ((i + 1) === names.length && obj === null)) {
            throw new Error("'" + name + "' value cannot be detected");
        }
    }
    return obj;
}

/**
 * Get a property setter method if it is declared with the class of the specified object for the
 * given property. Setter is a method whose name matches the following pattern: "set<PropertyName>"
 * where the first letter of the property name is in upper case. For instance setter method for
 * property "color" has to have name "setColor".
 * @param  {Object} obj an object instance
 * @param  {String} name a property name
 * @return {Function}  a method that can be used as a setter for the given property
 * @method  getPropertySetter
 * @for zebkit
 */
function getPropertySetter(obj, name) {
    var pi = obj.constructor.$propertyInfo, m = null;
    if (typeof pi !== 'undefined') {
        if (typeof pi[name] === "undefined") {
            m = obj[ "set" + name[0].toUpperCase() + name.substring(1) ];
            pi[name] = (typeof m  === "function") ? m : null;
        }
        return pi[name];
    }

    m = obj[ "set" + name[0].toUpperCase() + name.substring(1) ];
    return (typeof m  === "function") ? m : null;
}

/**
 * Populate the given target object with the properties set. The properties set
 * is a dictionary that keeps properties names and its corresponding values.
 * The method detects if a property setter method exits and call it to apply
 * the property value. Otherwise property is initialized as a field. Setter
 * method is a method that matches "set<PropertyName>" pattern.
 * @param  {Object} target a target object
 * @param  {Object} p   a properties set
 * @return {Object} an object with the populated properties set.
 * @method  properties
 * @for  zebkit
 */
function properties(target, p) {
    for(var k in p) {
        // skip private properties( properties that start from "$")
        if (k !== "clazz" && k[0] !== '$' && p.hasOwnProperty(k) && typeof p[k] !== "undefined" && typeof p[k] !== 'function') {
            if (k[0] === '-') {
                delete target[k.substring(1)];
            } else {
                var v = p[k],
                    m = getPropertySetter(target, k);

                // value factory detected
                if (v !== null && typeof v.$new !== 'undefined') {
                    v = v.$new();
                }

                if (m === null) {
                    target[k] = v;  // setter doesn't exist, setup it as a field
                } else {
                    // property setter is detected, call setter to
                    // set the property value
                    if (Array.isArray(v)) {
                        m.apply(target, v);
                    } else {
                        m.call(target, v);
                    }
                }
            }
        }
    }
    return target;
}

/**
 * URI class. Pass either a full uri (as a string or zebkit.URI) or number of an URI parts
 * (scheme, host, etc) to constructor it.
 * @param {String} [uri] an URI.
 * @param {String} [scheme] a scheme.
 * @param {String} [host] a host.
 * @param {String|Integer} [port] a port.
 * @param {String} [path] a path.
 * @param {String} [qs] a query string.
 * @constructor
 * @class zebkit.URI
 */
function URI(uri) {
    if (arguments.length > 1) {
        if (arguments[0] !== null) {
            this.scheme = arguments[0].toLowerCase();
        }

        if (arguments[1] !== null) {
            this.host = arguments[1];
        }

        var ps = false;
        if (arguments.length > 2) {
            if (isNumber(arguments[2])) {
                this.port = arguments[2];
            } else if (arguments[2] !== null) {
                this.path = arguments[2];
                ps = true;
            }
        }

        if (arguments.length > 3) {
            if (ps === true) {
                this.qs = arguments[3];
            } else {
                this.path = arguments[3];
            }
        }

        if (arguments.length > 4) {
            this.qs = arguments[4];
        }
    } else if (uri instanceof URI) {
        this.host   = uri.host;
        this.path   = uri.path;
        this.qs     = uri.qs;
        this.port   = uri.port;
        this.scheme = uri.scheme;
    } else {
        var m = uri.match($uriRE);
        if (m === null) {
            throw new Error("Invalid URI '" + uri + "'");
        }

        // fetch scheme
        if (typeof m[1] !== 'undefined') {
            this.scheme = m[2].toLowerCase();

            if (typeof m[3] === 'undefined') {
                if (this.scheme !== "file") {
                    throw new Error("Invalid host name : '" + uri + "'");
                }
            } else {
                this.host = m[3];
            }

            if (typeof m[4] !== 'undefined') {
                this.port = parseInt(m[4].substring(1), 10);
            }
        }

        // fetch path
        if (typeof m[6] !== 'undefined') {
            this.path = m[6];
        } else if (typeof m[1] !== 'undefined') {
            throw new Error("Invalid URL '" + uri + "'");
        }

        if (typeof m[7] !== 'undefined' && m[7].length > 1) {
            this.qs = m[7].substring(1).trim();
        }
    }

    if (this.path !== null) {
        this.path = this.path.replace(/\/\/*/g, '/');

        var l = this.path.length;
        if (l > 1 && this.path[l - 1] === '/') {
            this.path = this.path.substring(0, l - 1);
        }

        if ((this.host !== null || this.scheme !== null) && this.path[0] !== '/') {
            this.path = "/" + this.path;
        }
    }

    /**
     * URI path.
     * @attribute path
     * @type {String}
     * @readOnly
     */

    /**
     * URI host.
     * @attribute host
     * @type {String}
     * @readOnly
     */

    /**
     * URI port number.
     * @attribute port
     * @type {Integer}
     * @readOnly
     */

    /**
     * URI query string.
     * @attribute qs
     * @type {String}
     * @readOnly
     */

     /**
      * URI scheme (e.g. 'http', 'ftp', etc).
      * @attribute scheme
      * @type {String}
      * @readOnly
      */
}

URI.prototype = {
    scheme   : null,
    host     : null,
    port     : -1,
    path     : null,
    qs       : null,

    /**
     * Serialize URI to its string representation.
     * @method  toString
     * @return {String} an URI as a string.
     */
    toString : function() {
        return (this.scheme !== null ? this.scheme + "://" : '') +
               (this.host !== null ? this.host : '' ) +
               (this.port !== -1   ? ":" + this.port : '' ) +
               (this.path !== null ? this.path : '' ) +
               (this.qs   !== null ? "?" + this.qs : '' );
    },

    /**
     * Get a parent URI.
     * @method getParent
     * @return {zebkit.URI} a parent URI.
     */
    getParent : function() {
        if (this.path === null) {
            return null;
        } else {
            var i = this.path.lastIndexOf('/');
            return (i < 0 || this.path === '/') ? null
                                                : new URI(this.scheme,
                                                          this.host,
                                                          this.port,
                                                          this.path.substring(0, i),
                                                          this.qs);
        }
    },

    /**
     * Append the given parameters to a query string of the URI.
     * @param  {Object} obj a dictionary of parameters to be appended to
     * the URL query string
     * @method appendQS
     */
    appendQS : function(obj) {
        if (obj !== null) {
            if (this.qs === null) {
                this.qs = '';
            }

            if (this.qs.length > 0) {
                this.qs = this.qs + "&" + URI.toQS(obj);
            } else {
                this.qs = URI.toQS(obj);
            }
        }
    },

    /**
     * Test if the URI is absolute.
     * @return {Boolean} true if the URI is absolute.
     * @method isAbsolute
     */
    isAbsolute : function() {
        return URI.isAbsolute(this.toString());
    },

    /**
     * Join URI with the specified path
     * @param  {String} p* relative paths
     * @return {String} an absolute URI
     * @method join
     */
    join : function() {
        var args = Array.prototype.slice.call(arguments);
        args.splice(0, 0, this.toString());
        return URI.apply(URI, args);
    }
};

/**
 * Test if the given string is absolute path or URI.
 * @param  {String|zebkit.URI}  u an URI
 * @return {Boolean} true if the string is absolute path or URI.
 * @method isAbsolute
 * @static
 */
URI.isAbsolute = function(u) {
    return u[0] === '/' || /^[a-zA-Z]+\:\/\//i.test(u);
};

/**
 * Test if the given string is URL.
 * @param  {String|zebkit.URI}  u a string to be checked.
 * @return {Boolean} true if the string is URL
 * @method isURL
 * @static
 */
URI.isURL = function(u) {
    return /^[a-zA-Z]+\:\/\//i.test(u);
};

/**
 * Parse the specified query string of the given URI.
 * @param  {String|zebkit.URI} url an URI
 * @param  {Boolean} [decode] pass true if query string has to be decoded.
 * @return {Object} a parsed query string as a dictionary of parameters
 * @method parseQS
 * @static
 */
URI.parseQS = function(qs, decode) {
    if (qs instanceof URI) {
        qs = qs.qs;
        if (qs === null) {
            return null;
        }
    } else if (qs[0] === '?') {
        qs = qs.substring(1);
    }

    var mqs      = qs.match(/[a-zA-Z0-9_.]+=[^?&=]+/g),
        parsedQS = {};

    if (mqs !== null) {
        for(var i = 0; i < mqs.length; i++) {
            var q = mqs[i].split('=');
            parsedQS[q[0]] = (decode === true ? $zenv.decodeURIComponent(q[1])
                                              : q[1]);
        }
    }
    return parsedQS;
};

/**
 * Convert the given dictionary of parameters to a query string.
 * @param  {Object} obj a dictionary of parameters
 * @param  {Boolean} [encode] pass true if the parameters values have to be
 * encoded
 * @return {String} a query string built from parameters list
 * @static
 * @method toQS
 */
URI.toQS = function(obj, encode) {
    if (isString(obj) || isBoolean(obj) || isNumber(obj)) {
        return "" + obj;
    }

    var p = [];
    for(var k in obj) {
        if (obj.hasOwnProperty(k)) {
            p.push(k + '=' + (encode === true ? $zenv.encodeURIComponent(obj[k].toString())
                                              : obj[k].toString()));
        }
    }
    return p.join("&");
};

/**
 * Join the given  paths
 * @param  {String} p* relative paths
 * @return {String} an absolute URI
 * @method join
 * @static
 */
URI.join = function() {
    var pu = new URI(arguments[0]);

    for(var i = 1; i < arguments.length; i++) {
        var p = arguments[i].toString().trim();
        if (p.length === 0 || URI.isAbsolute(p)) {
            throw new Error("Absolute path '" + p + "' cannot be joined");
        }

        p = p.replace(/\/\/*/g, '/');
        if (p[p.length - 1] === '/' ) {
            p = p.substring(0, p.length - 1);
        }

        if (pu.path === null) {
            pu.path = p;
            if ((pu.host !== null || pu.scheme !== null) && pu.path[0] !== '/') {
                pu.path = "/" + pu.path;
            }
        } else {
            pu.path = pu.path + "/" + p;
        }
    }

    return pu.toString();
};

$export(
    URI,        isNumber, isString, $Map,
    dumpError,  image,    getPropertySetter,
    properties, GET,      isBoolean, DoIt,
    { "$global"    : $global,
      "$FN"        : $FN,
      "environment": $zenv,
      "isIE"       : isIE,
      "isFF"       : isFF,
      "isMacOS"    : isMacOS }
);

