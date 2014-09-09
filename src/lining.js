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

    var Util = {
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
            Util.addCSSRule(
                'line',
                'display:inline;'
            );
        },
        adjustTextRange: function (r) {
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

        Util.init();

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
    };

    Lining.prototype.createLine = function(s, r) {
        var line = document.createElement('line');
        try {
            r.surroundContents(line);
        }
        catch (e) {
            this.surroundContents(line, r);
        }
    };

    Lining.prototype.surroundContents = function(line, r) {
        Util.adjustTextRange(r);
        var commonAncestor = r.commonAncestorContainer;
        var start;
        while (start = r.startContainer.parentNode) {
            
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
})();
