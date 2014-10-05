(function(win, doc) {
    var styleSheet;
    var emptyNodeNames = {
        'STYLE': true,
        'SCRIPT': true,
        'LINK': true,
        'BR': true
    };
    var notEmptyNodeNames = {
        'TEXTAREA': true,
        'IMG': true,
        'INPUT': true
    };

    var util = {
        /**
         * add CSS rule at last.
         *
         * @param {string} selector '.foo'.
         * @param {string} rules 'color:red;background:blue;'.
         */
        addCSSRule: function(selector, rules) {
            if (!styleSheet) {
                var style = doc.createElement('style');
                style.type = 'text/css';
                doc.getElementsByTagName('head')[0].appendChild(style);
                styleSheet = doc.styleSheets[0];
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
                ''
                + 'display:block;'
                + 'text-indent:0;'
            );
            util.addCSSRule(
                'line[first-in-element]:first-child',
                ''
                + 'text-indent:inherit;'
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
        },
        /**
         * if it has no text.
         *
         * @param {Element} node
         * @return {boolean} true or false.
         */
        isEmptyNode: function (node) {
            if (node.nodeType === 3) {
                return node.nodeValue.trim() === '';
            }

            var nodeName = node.nodeName;
            if (emptyNodeNames[nodeName]) {
                return true;
            }

            if (notEmptyNodeNames[nodeName]) {
                return false;
            }

            var children = node.childNodes;
            if (!children.length) {
                return true;
            }

            for (var i = 0, l = children.length; i < l; i++) {
                if (!util.isEmptyNode(children[i])) {
                    return false;
                }
            }
            return true;
        },

        /**
         * get the next node which has content,
         * like text, img, textarea, input node.
         *
         * @param {Element} container
         * @return {Array} [container, offset] next node which has content.
         */
        getFirstContentNode: function (container) {
            if (container.nodeType === 3) {
                // is text node
                return [container, 0];
            }

            if (notEmptyNodeNames[container.nodeName]) {
                return [container.parentNode, util.getNodeOffset(container)];
            }

            var start = container.firstChild;
            if (!util.isEmptyNode(start)) {
                return util.getFirstContentNode(start);
            }

            var tmp = start;
            while (util.isEmptyNode(start)) {
                tmp = start.nextSibling;
                if (!tmp) {
                    return null;
                }
                start = tmp;
            }

            return util.getFirstContentNode(start);
        },
        /**
         * adjust or split node.
         *
         * ancestor = p
         * <p><span>aaa<b>|bbb</b>ccc</span></p>
         * ==>
         * <p><span>aaa</span>|<span><b>bbb</b>ccc</span></p>
         *
         * @param {Element} ancestor
         * @param {Element} node
         * @param {number} offset
         * @return {Array} [container, offset]
         */
        adjustOrSplitNode: function (ancestor, node, offset) {
            var parent;
            var tmpOffset;

            while (node !== ancestor) {
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

            return [node, offset];
        },
        /**
         * find the content sibling, forward or backward
         *
         * @param {Element} node
         * @param {string} direction forward / backward
         * @return {Array} siblingIsEmpty, offset from current node.
         */
        findContentSibling: function (node, direction) {
            var offset = 0;
            var siblingIsEmpty = true;
            direction = direction === 'forward'
                ? 'nextSibling'
                : 'previousSibling';
            var next = node[direction];
            while (next) {
                if (!util.isEmptyNode(next)) {
                    siblingIsEmpty = false;
                    break;
                }
                offset++;
                next = next[direction];
            }

            return [siblingIsEmpty, offset];
        }
    };

    /**
     * Lining
     *
     * @constructor
     * @param {Element} element
     * @param {Object=} opt_option
     */
    var Lining = function(element, opt_option) {
        var opt = opt_option || {};

        /**
         * @type {number}
         */
        this.from = (opt['from'] - 1)
            || (parseInt(element.getAttribute('data-from'), 10) - 1)
            || 0;
        this.from = Math.max(this.from, 0);

        /**
         * @type {number}
         */
        this.to = opt['to']
            || parseInt(element.getAttribute('data-to'), 10)
            || null;

        /**
         * @type {Element}
         * @private
         */
        this._e = element;

        /**
         * @type {number}
         * @private
         */
        this._oldWidth;

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
         * @private
         */
        this._ancestor = null;

        /**
         * @type {Element}
         * @private
         */
        this._start = null;

        /**
         * @type {number}
         * @private
         */
        this._startOffset = 0;

        /**
         * @type {Element}
         * @private
         */
        this._end = null;

        /**
         * @type {number}
         * @private
         */
        this._endOffset = 0;

        /**
         * @type {boolean}
         * @private
         */
        this._collapsed = false;

        /**
         * @type {number}
         */
        this.count;

        /**
         * @type {Element}
         * @private
         */
        this._currentLine;

        /**
         * inited
         * @type {boolean}
         * @private
         */
        this._inited = false;

        util.init();
    };

    /**
     * init and start
     */
    Lining.prototype.init = function() {
        var that = this;
        if (that._inited) {
            return;
        }
        that._inited = true;

        that.doc = that._e.ownerDocument;
        that.win = that.doc.defaultView;
        that.relining();

        var timeout;
        that.win.addEventListener('resize', function () {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            timeout = setTimeout(function () {
                that.relining();
            }, 1000);
        }, false);

        return that;
    };

    Lining.prototype.dispose = function () {
        var lines = this._e.getElementsByTagName('line');
        var line;
        var removed;
        var parent;
        for (var i = 0, l = lines.length; i < l; i++) {
            line = lines[i];
            parent = line.parentNode;
            removed = util.removeChildren(line, 0);
            while (removed.length) {
                parent.insertBefore(removed.pop(), line);
            }
        }
        while (lines.length) {
            line = lines[lines.length - 1];
            line.parentNode.removeChild(line);
        }

        this._e.normalize();
    };

    Lining.prototype.relining = function () {
        var newWidth = this._e.offsetWidth;
        if (this._oldWidth) {
            if (this._oldWidth !== newWidth) {
                this.dispose();
            }
            else {
                return;
            }
        }
        else {
            this._e.normalize();
        }
        this._currentLine = null;
        this._oldWidth = newWidth;
        this.count = this.from;

        var s = this.win.getSelection();
        while (this._selectNextLine(s)) {
            if (this.count < this.from) {
                continue;
            }

            this._createLine(s);
        }
        s.removeAllRanges();
    };

    /**
     * update container
     * @param {Range} r
     */
    Lining.prototype._update = function (r) {
        this._start = r.startContainer;
        this._startOffset = r.startOffset;
        this._end = r.endContainer;
        this._endOffset = r.endOffset;
        this._ancestor = r.commonAncestorContainer;
        this._collapsed = r.collapsed;
    };

    /**
     *
     * @param {ELement} start
     * @param {number} startOffset
     * @param {Selection} opt_s
     */
    Lining.prototype._setCursor = function (start, startOffset, opt_s) {
        var s = opt_s || this.win.getSelection();
        var r = this.doc.createRange();
        r.setStart(start, startOffset);
        r.collapse(true);
        s.removeAllRanges();
        s.addRange(r);
        return r;
    };

    /**
     * select one line.
     *
     * @param {number} i
     * @return {boolean} success
     */
    Lining.prototype.selectLine = function (i) {
        var s = this.win.getSelection();
        this._setCursor(this._e, 0, s);
        // For webkit(chrome, safari),
        // if next character is a space, extend line wouldn't work right.
        s.modify('extend', 'forward', 'character');
        s.modify('extend', 'forward', 'lineboundary');

        var oldR;
        var tmp;
        while (i > 1) {
            i--;
            oldR = s.getRangeAt(0);
            tmp = this._getNextLineStartPoint(oldR.endContainer, oldR.endOffset);
            if (!tmp) {
                s.removeAllRanges();
                return false;
            }
            this._setCursor(tmp[0], tmp[1], s);
            // For webkit(chrome, safari),
            // if next character is a space, extend line wouldn't work right.
            s.modify('extend', 'forward', 'character');
            s.modify('extend', 'forward', 'lineboundary');
        }

        this._update(s.getRangeAt(0));
        return true;
    };

    /**
     * get the next line's start point.
     * @param {Element} end endContainer or end node
     * @param {number} endoffset endOffset
     * @return {Array} [start, startOffset]
     */
    Lining.prototype._getNextLineStartPoint = function (end, endOffset) {
        var current;
        if (end.nodeType === 3) {
            // if it's a text node
            if (end.nodeValue.slice(endOffset).trim() !== '') {
                // and `endOffset` is not the end.
                return [end, endOffset];
            }
            else {
                current = end;
                endOffset = util.getNodeOffset(end) + 1;
                end = end.parentNode;
            }
        }
        else {
            current = end.childNodes[endOffset - 1];
        }

        var r = util.findContentSibling(current, 'forward');
        var nextSiblingIsEmpty = r[0];
        var nextContentNodeOffset = r[1];

        if (nextSiblingIsEmpty) {
            if (this._e.contains(end.parentNode)) {
                return this._getNextLineStartPoint(
                    end.parentNode,
                    util.getNodeOffset(end) + 1
                );
            }
            else {
                return null;
            }
        }

        endOffset += nextContentNodeOffset;
        return util.getFirstContentNode(end.childNodes[endOffset]);
    };

    /**
     * select next line.
     *
     * @param {Selection} s
     * @return {boolean} if selected;
     */
    Lining.prototype._selectNextLine = function (s) {
        if (this.to && this.count >= this.to) {
            return false;
        }

        var line = this._currentLine;
        if (line) {
            var start = line;
            var startOffset = util.getNodeOffset(start) + 1;
            start = start.parentNode;

            var nextPoint = this._getNextLineStartPoint(start, startOffset);
            if (nextPoint) {
                this._setCursor(nextPoint[0], nextPoint[1], s);
                // For webkit(chrome, safari),
                // if next character is a space, extend line wouldn't work right.
                s.modify('extend', 'forward', 'character');
                s.modify('extend', 'forward', 'lineboundary');
                this._update(s.getRangeAt(0));
            }

            return !!nextPoint;
        }
        else {
            return this.selectLine(this.from + 1);
        }
    };

    /**
     * get range at 0
     * @return {Range} range.
     */
    Lining.prototype._getRange = function () {
        return this.win.getSelection().getRangeAt(0);
    };

    /**
     * adjust line
     * @param {Element} line
     * @param {Selection} s
     */
    Lining.prototype._adjustLine = function(line, s) {
        var r = this._setCursor(line, 0, s);
        s.modify('extend', 'forward', 'character');
        s.modify('extend', 'forward', 'lineboundary');
        r = s.getRangeAt(0);
        this._update(r);

        if (line !== this._end && line.contains(this._end)) {
            // split text node
            this._adjustTextBoundary();
            // append rest of nodes after line
            // split node
            var r = util.adjustOrSplitNode(line, this._end, this._endOffset);
            this._end = r[0];
            this._endOffset = r[1];
        }

        // append rest of nodes after line
        var removed = util.removeChildren(this._end, this._endOffset);
        var parent = this._end.parentNode;
        var next = this._end.nextSibling;
        while (removed.length) {
            parent.insertBefore(removed.pop(), next);
        }
    };

    /**
     * create line.
     * @param {Selection} s
     */
    Lining.prototype._createLine = function(s) {
        var line = doc.createElement('line');
        line.setAttribute('index', ++this.count);
        try {
            this._getRange().surroundContents(line);
        }
        catch (e) {
            this.surroundContents(line);
        }

        this._currentLine = line;
        this._adjustLine(line, s);
        if (!line.previousSibling
            || util.findContentSibling(line, 'backward')[0]) {
            line.setAttribute('first-in-element', '');
        }
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

        var r = util.adjustOrSplitNode(commonAncestor, node, offset);

        if (isStart) {
            this._start = r[0];
            this._startOffset = r[1];
        }
        else {
            this._end = r[0];
            this._endOffset = r[1];
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
     * @param {string|Element} element id or element
     * @param {Object=} opt_option
     */
    var lining = win.lining = function (element, opt_option) {
        return new Lining(
            typeof element === 'string' ?
                doc.getElementById(element) :
                element,
            opt_option
        ).init();
    };

    lining.Lining = Lining;
    lining.util = util;

    win.addEventListener('load', function () {
        var elements = doc.querySelectorAll('[data-lining]');
        var e;
        for (var i = 0, l = elements.length; i < l; i++) {
            e = elements[i]
            lining(e);
        }
    }, false);
})(window, document);
