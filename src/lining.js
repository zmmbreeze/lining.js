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
         * remove childNodes
         * <span>aaa|<b>bbb</b>ccc</span>
         * ==>
         * <span>aaa</span>
         *
         * @param {Element} node
         * @param {number} from
         * @param {number=} opt_to
         * @return {Array.<Element>} children
         */
        removeChildren: function (node, from, opt_to) {
            if (from < 0) {
                from = 0;
            }
            var children = node.childNodes;
            var to = opt_to == null ? children.length : opt_to;
            if (from >= to) {
                return [];
            }

            var removed = [];
            var i = to - 1;
            var lastChild;
            while (i >= from) {
                lastChild = children[i];
                removed.push(lastChild);
                node.removeChild(lastChild);
                i--;
            }
            return removed;
        },
        /**
         * append children
         * @param {Element} parent
         * @param {Array.<Element>} children
         */
        appendChildren: function (parent, children) {
            while (children.length) {
                parent.appendChild(children.pop());
            }
        },
        /**
         * split node.
         * <span>aaa|<b>bbb</b>ccc</span>
         * ==>
         * <span>aaa</span>|<span><b>bbb</b>ccc</span>
         *
         * @param {Element} node
         * @param {number} offset
         */
        splitNode: function (node, offset) {
            var parent = node.parentNode;
            var clone = node.cloneNode(false);

            util.appendChildren(clone, util.removeChildren(node, offset));
            parent.insertBefore(clone, node.nextSibling);
            return parent;
        },
        /**
         * get node's offset
         * @param {Element} node
         * @param {boolean} ignoreTextNode;
         * @return {number} offset
         */
        getNodeOffset: function (node, ignoreTextNode) {
            var prev = node;
            var i = 0;
            while (prev = prev.previousSibling) {
                if (ignoreTextNode && prev.nodeType == 3) {
                    if (prev.nodeType != prev.nextSibling.nodeType ){
                        i++;
                    }
                    continue;
                }
                i++;
            }
            return i;
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

        /**
         * @type {Document}
         */
        this.doc = null;

        /**
         * @type {Window}
         */
        this.win = null;

        /**
         * @type {Element}
         */
        this._ancestor = null;

        /**
         * @type {Element}
         */
        this._start = null;

        /**
         * @type {number}
         */
        this._startOffset = 0;

        /**
         * @type {Element}
         */
        this._end = null;

        /**
         * @type {number}
         */
        this._endOffset = 0;

        util.init();

        /**
         * @type {number}
         */
        this.lineCount = 0;

        /**
         * @type {Element}
         */
        this._currentLine = null;

        /**
         * inited
         * @type {boolean}
         */
        this.inited = false;
    };

    /**
     * init and start
     */
    Lining.prototype.init = function() {
        if (this.inited) {
            return;
        }
        this.inited = true;
        this.doc = this.e.ownerDocument;
        this.win = this.doc.defaultView;
        var s = this.win.getSelection();
        /*
        while (this._selectNextLine(s)) {
            this._currentLine = this.createLine();
        }
        */
        this._selectNextLine(s);
        this._currentLine = this.createLine();
        this._selectNextLine(s);
        this._currentLine = this.createLine();
        this._selectNextLine(s);
        this._currentLine = this.createLine();
        return this;
    };

    /**
     * update container
     */
    Lining.prototype._update = function (r) {
        this._start = r.startContainer;
        this._startOffset = r.startOffset;
        this._end = r.endContainer;
        this._endOffset = r.endOffset;
        this._ancestor = r.commonAncestorContainer;
    };

    /**
     * @param {Selection} s
     * @return {boolean} if has next line
     */
    Lining.prototype._selectNextLine = function (s) {
        var offset;
        var element;
        var r = this.doc.createRange();
        if (this._currentLine) {
            console.log(this._currentLine);
            console.log(this._currentLine.nextSibling);
            if (!this._currentLine.nextSibling) {
                return false;
            }

            offset = util.getNodeOffset(this._currentLine) + 1;
            element = this._currentLine.parentNode;
        }
        else {
            offset = 0;
            element = this.e;
        }
        r.setStart(element, offset);
        r.collapse(true);

        if (s.rangeCount) {
            s.removeAllRanges();
        }
        s.addRange(r);
        s.modify('extend', 'forward', 'lineboundary');
        r = s.getRangeAt(0);
        this._update(r);
        return true;
    };

    Lining.prototype._getRange = function () {
        return this.win.getSelection().getRangeAt(0);
    };

    Lining.prototype.createLine = function() {
        var line = document.createElement('line');
        /*
        try {
            r.surroundContents(line);
        }
        catch (e) {
            this.surroundContents(line, r);
        }
        */
        this.surroundContents(line);
        this.lineCount++;
        return line;
    };

    /**
     * adjust text boundary into node boundary.
     */
    Lining.prototype._adjustTextBoundary = function () {
        if (this._ancestor.nodeType === 3) {
            this._ancestor = this._ancestor.parentNode;
        }

        var offsetAdjust = 0;
        var start = this._start;
        var startOffset = this._startOffset;
        var newStart = start;
        if (start.nodeType === 3) {
            if (startOffset !== 0 && startOffset !== start.nodeValue.length) {
                newStart = start.splitText(startOffset);
                if (this._start === this._end) {
                    offsetAdjust = this._start.nodeValue.length;
                }
            }
            this._start = newStart.parentNode;
            this._startOffset = util.getNodeOffset(newStart);
        }

        var end = offsetAdjust ? this._end.nextSibling : this._end;
        var endOffset = this._endOffset - offsetAdjust;
        if (end.nodeType === 3) {
            if (endOffset !== 0 && endOffset !== end.nodeValue.length) {
                end.splitText(endOffset);
            }
            this._end = end.parentNode;
            this._endOffset = util.getNodeOffset(end) + 1;
        }
    };

    /**
     * adjust or split node
     *
     * ancestor = p
     * <p><span>aaa<b>b|bb</b>ccc</span></p>
     * ==>
     * <p><span>aaa<b>b</b></span>|<span><b>bb</b>ccc</span></p>
     *
     * @param {boolean} isStart
     */
    Lining.prototype._adjustOrSplitNode = function (isStart) {
        var commonAncestor = this._ancestor;
        var node;
        var offset;
        var parent;
        var tmpOffset;

        if (isStart) {
            node = this._start;
            offset = this._startOffset;
        }
        else {
            node = this._end;
            offset = this._endOffset;
        }

        while (node !== commonAncestor) {
            parent = node.parentNode;
            tmpOffset = util.getNodeOffset(node);

            switch (offset) {
                case 0:
                    break;
                case node.childNodes.length:
                    tmpOffset++;
                    break;
                default:
                    util.splitNode(node, offset);
                    tmpOffset++;
                    break;
            }
            node = parent;
            offset = tmpOffset;
        }

        if (isStart) {
            this._start = node;
            this._startOffset = offset;
        }
        else {
            this._end = node;
            this._endOffset = offset;
        }
    };

    /**
     * adjust boundary
     *
     * ancestor = p
     * start = b.firstChild
     * startOffset = 1
     * end = p.lastChild
     * endOffset = 1
     * <p>111<span>aaa<b>b[bb</b>ccc</span>2]22</p>
     * ==>
     * <p>111<span>aaa<b>b</b></span><line><span><b>bb</b>ccc</span>2</line>22</p>
     * @param {Element} line
     */
    Lining.prototype.surroundContents = function (line) {
        this._adjustTextBoundary();
        this._adjustOrSplitNode(true);
        this._adjustOrSplitNode(false);
        // if come to this step
        // then this._ancestor === this._start === this._end
        var removed = util.removeChildren(this._ancestor, this._startOffset, this._endOffset);
        util.appendChildren(line, removed);
        var i = this._startOffset;
        this._ancestor.insertBefore(line, this._ancestor.childNodes[i]);
    };



    /**
     * lining.
     *
     * @param {string|Element} element id or element.
     */
    window.lining = function (element) {
        return new Lining(
            typeof element === 'string' ?
                document.getElementById(element) :
                element
        ).init();
    };

    window.lining.Lining = Lining;
    window.lining.util = util;
})();
