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
         * get css style
         *
         * @param {Element} el dom element
         * @param {string} cssStyleName
         * @return {string} style
         */
        getStyle: function(el, cssStyleNamem) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                Util.getStyle = function(el, cssStyleName) {
                    var re = '';
                    var defaultView = el.ownerDocument.defaultView;
                    if (!defaultView) {
                        return '';
                    }

                    cssStyleName = cssStyleName
                        .replace(upperReg, '-$1')
                        .toLowerCase();
                    var computedStyle = defaultView.getComputedStyle(el, null);
                    if (computedStyle) {
                        re = computedStyle.getPropertyValue(cssStyleName);
                    }
                    return re;
                };
            } else {
                Util.getStyle = function(el, cssStyleName) {
                    cssStyleName = cssStyleName.replace(dashReg, function($1) {
                        return $1.charAt(1).toUpperCase();
                    });
                    var left;
                    var rsLeft;
                    var re = el.currentStyle &&
                             el.currentStyle[cssStyleName];
                    var style = el.style;

                    // From the awesome hack by Dean Edwards
                    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

                    // If we're not dealing with a regular pixel number
                    // but a number that has a weird ending,
                    // we need to convert it to pixels
                    if ( !numpxReg.test( re ) && numReg.test( re ) ) {
                        // Remember the original values
                        left = style.left;
                        rsLeft = el.runtimeStyle.left;

                        // Put in the new values to get a computed value out
                        el.runtimeStyle.left = el.currentStyle.left;
                        style.left = cssStyleName === 'fontSize' ?
                                        '1em' :
                                        (re || 0);
                        re = style.pixelLeft + 'px';

                        // Revert the changed values
                        style.left = left;
                        el.runtimeStyle.left = rsLeft;
                    }

                    return re === '' ? 'auto' : re.toString();
                };
            }

            return Util.getStyle.apply(this, arguments);
        },
        /**
         * Check if element is inline style.
         *
         * @param {Element} el .
         * @return {boolean} .
         */
        isInlineElement: function(el) {
            var display = Util.getStyle(el, 'display');
            return display.indexOf('inline') !== -1;
        },
        /**
         * Is block-level element.
         *
         * @param {Element} el .
         * @return {boolean} .
         */
        isBlockElement: function(el) {
            var display = Util.getStyle(el, 'display');
            return display === 'block' ||
                   display === 'list-item' ||
                   display === 'inline-block' ||
                   display === 'table-cell' ||
                   display === 'table-caption';
        },
        /**
         * If this element has a scrollbar.
         *
         * @param {Element} el .
         * @return {boolean} .
         */
        hasScrollBar: function(el) {
            
        },
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
                'lines',
                'display:block;' +
                'overflow:auto;'
            );
            Util.addCSSRule(
                'line',
                'display:block;' +
                'white-space:nowrap;'
            );
            Util.addCSSRule(
                '.' + markClassName,
                'position:absolute !important;' +
                'top:auto !important;' +
                'left:auto !important;' +
                'right:auto !important;' +
                'bottom:auto !important;' +
                'vertical-align:top !important;' +
                'width:0 !important;' +
                'height:0 !important;'
            );
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
        var el = this.el = element;

        // force it to become block element.
        el.style.display = 'block';

        Util.init();

        // create lines
        this.lines = [];
        this._currentTop = el.offsetTop +
                parseInt(Util.getStyle(el, 'border-top-width'), 10) +
                parseInt(Util.getStyle(el, 'padding-top'), 10);
        this._currentNumber = 1;
        this._measure(el, true);
        this._createLines(el);
        this._appendLines(el);
    };

    Lining.prototype._createMark = function() {
        var span = document.createElement('span');
        span.className = markClassName;
        return span;
    };

    Lining.prototype._insertMarkAfter = function(el, parent) {
        var mark = this._createMark();
        parent.insertBefore(mark, el.nextSibling);
        return mark.offsetTop;
    };

    Lining.prototype._splitText = function(textNode, parent) {
        var text = textNode.data;

        var firstTxt = document.createTextNode(text.charAt(0));
        parent.insertBefore(firstTxt, textNode);
        parent.insertBefore(this._createMark(), textNode);

        for (var i = 1, l = text.length; i < l; i++) {
            parent.insertBefore(document.createTextNode(text.charAt(i)), textNode);
            parent.insertBefore(this._createMark(), textNode);
        }

        var top;
        var next = firstTxt.nextSibling;
        while (next !== textNode ) {
            if (next.nodeType === 1) {
                top = next.offsetTop;
                if (this._currentTop < top) {
                    this._currentTop = top;
                    this._currentNumber++;
                }
                next.previousSibling[lineNumberKey] = this._currentNumber;
            }
            next = next.nextSibling;
        }

        parent.removeChild(textNode);
    };

    Lining.prototype._measure = function(el) {
        var children = [];
        Util.mergeArray(children, el.childNodes);

        var child;
        var top;
        for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            top = this._insertMarkAfter(child, el);

            if (this._currentTop < top) {
                if (child.nodeType === 3) {
                    // split text
                    // TODO
                    this._currentTop = null;
                    this._splitText(child, el);
                } else if (Util.getStyle(child, 'display') === 'inline' &&
                           child.childNodes.length !== 0) {
                    // split node
                    this._measure(child);
                    child[lineNumberKey] = this._currentNumber;
                } else {
                    // next line
                    this._currentTop = top;
                    this._currentNumber++;
                    child[lineNumberKey] = this._currentNumber;
                }
            } else {
                // current line
                child[lineNumberKey] = this._currentNumber;
            }
        }
    };

    Lining.prototype._pushIntoLine = function(el, parent) {
        var lineNumber = el[lineNumberKey];
        if (!lineNumber) {
            parent.removeChild(el);
            return;
        }

        var line = this.lines[lineNumber];
        if (!line) {
            line = document.createElement('line');
            this.lines[lineNumber] = line;
        }

        line.appendChild(el);
    };

    Lining.prototype._createLines = function(el) {
        var children = [];
        Util.mergeArray(children, el.childNodes);

        var child;
        var top;
        for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            this._pushIntoLine(child, el);
        }
    };

    Lining.prototype._appendLines = function(el) {
        var linesEl = document.createElement('lines');
        var lines = this.lines;
        var line;
        for (var i = 1, l = lines.length; i < l; i++) {
            line = lines[i];
            line.className = 'line' + i;
            linesEl.appendChild(line);
        }

        el.appendChild(linesEl);
    };

    /**
     * Watch style(width) change and update it.
     */
    Lining.prototype.wratch = function() {
        var el = this.el;
        var lines = document.createElement('lines');
        el.appendChild(lines);
        this.lines = lines;
    };

    /**
     * unwatch
     *
     */
    Lining.prototype.unwratch = function() {
        var el = this.el;
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
