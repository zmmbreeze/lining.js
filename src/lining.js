/*global document:false */

(function() {
    var hash = 'da30f989015f41633488d5f17af66726';
    var lineNumberKey = 'lineNumber' + hash;
    var markClassName = 'mark' + hash;
    var upperReg = /([A-Z])/g;
    var dashReg = /-([a-z])/g;
    var numReg = /^-?\d/;
    var numpxReg = /^-?\d+(?:px)?$/i;
    var styleSheet;

    var util = {
        /**
         * add CSS rule at last.
         *
         * @param {string} selector '.foo'.
         * @param {string} rules 'color:red;background:blue;'.
         */
        addCSSRule: function(selector, rules) {
            if (!styleSheet) {
                var style = document.createElement('style');
                style.type = 'text/css';
                document.getElementsByTagName('head')[0].appendChild(style);
                styleSheet = document.styleSheets[0];
            }

            if (styleSheet.insertRule) {
                styleSheet.insertRule(
                    selector + '{' + rules + '}',
                    styleSheet.cssRules.length
                );
            } else {
                // IE
                styleSheet.addRule(selector, rules, -1);
            }
        },
        /**
         * Init this plugin at the first time.
         */
        init: function initStyle() {
            if (initStyle.inited) {
                return;
            }
            initStyle.inited = true;

            // init style
            util.addCSSRule(
                'line',
                'display:inline;'
            );
        },
        /**
         * split text node.
         *
         * @param {Range} r
         */
        splitTextNode: function (r) {
            var start = r.startContainer;
            var startOffset = r.startOffset;
            if (start.nodeType === 3) {
                start.splitText(startOffset);
            }

            var end = r.endContainer;
            var endOffset = r.endOffset;
            if (end.nodeType === 3) {
                end.splitText(endOffset);
            }
        },
        /**
         * split node.
         *
         * @param {Element} node
         * @param {boolean} appendIt
         */
        splitNode: function (node, appendIt) {
            var parent = node.parentNode;
            var clone = parent.cloneNode(false);
            var tmp = parent.lastChild;
            var cloneChildren = [];

            do {
                cloneChildren.push(tmp);
                tmp = tmp.previousSibling;
            } while (tmp !== node)
            cloneChildren.push(tmp);

            while (cloneChildren.length) {
                clone.appendChild(cloneChildren.pop());
            }

            if (appendIt) {
                parent.parentNode.insertBefore(clone, parent.nextSibling);
            }
            return clone;
        },
        /**
         * Merge two array or array like object.
         *
         * @param {Array} target .
         * @param {Array} src .
         */
        mergeArray: function(target, src) {
            var targetLength = target.length;
            for (var i = 0, l = src.length; i < l; i++) {
                target[targetLength + i] = src[i];
            }
        }
    };
    /**
     * Lining
     *
     * @constructor
     * @param {Element} element .
     */
    var Lining = function(element) {
        /**
         * @type {Element}
         * @private
         */
        this.e = element;

        util.init();

        this.lineCount = 0;
        this.measure();
    };

    Lining.prototype.setCursorAtFirst = function (s, r) {
        r.setStart(this.e, 0);
        r.collapse(true);
        if (s.rangeCount) {
            s.removeAllRanges();
        }
        s.addRange(r);
    };

    Lining.prototype.measure = function() {
        var doc = this.e.ownerDocument;
        var win = doc.defaultView;
        var s = win.getSelection();
        var r = doc.createRange();
        this.setCursorAtFirst(s, r);
        s.modify('extend', 'forward', 'lineboundary');
        r = s.getRangeAt(0);
        this.createLine(s, r);
    };

    Lining.prototype.createLine = function(s, r) {
        var line = document.createElement('line');
            this.surroundContents(line, r);
    };

    Lining.prototype.surroundContents = function(line, r) {
        util.splitTextNode(r);
        var commonAncestor = r.commonAncestorContainer;
        var start = r.startContainer;
        var startParent = start;
        while (startParent !== commonAncestor) {
            start = util.splitNode(start, true);
            startParent = start.parentNode;
        }

        var end = r.endContainer;
        var endParent = end;
        while (endParent !== commonAncestor) {
            end = util.splitNode(end, true);
            endParent = end.parentNode;
        }

        start.parentNode.insertBefore(line, start);
        var tmp = end;
        var tmps = [];

        do {
            tmps.push(tmp);
            tmp = tmp.previousSibling;
        } while (tmp !== start)
        tmps.push(start);

        while (tmps.length) {
            line.appendChild(tmps.pop());
        }
    };



    /**
     * lining.
     *
     * @param {string|Element} element id or element.
     */
    window.lining = function(element) {
        return new Lining(
            typeof element === 'string' ?
                document.getElementById(element) :
                element
        );
    };

    window.util = util;
})();
