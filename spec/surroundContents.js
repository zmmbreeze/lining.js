describe('lining.js -- surroundContents', function() {
    var util = lining.util;
    var Lining = lining.Lining;
    var root = document.createElement('div');
    document.body.appendChild(root);

    beforeEach(function() {
        root.innerHTML = 'aaaaa'
            + '<span>bbb<b>ccc</b>ddd<i>hhh</i>iii</span>'
            + 'eeeee'
            + '<span>fffff</span>gggg';
    });

    afterEach(function () {
        root.innerHTML = '';
    });

    it('lining._adjustTextBoundary:1', function () {
        // f[ff]ff
        var l = new Lining(root);
        var span = root.childNodes[3];
        l._start = span.firstChild;
        l._startOffset = 1;
        l._end = l._start;
        l._endOffset = 3;
        l._ancestor = l._start;
        l._adjustTextBoundary();
        expect(span.childNodes.length).toBe(3);
        expect(l._start).toBe(span);
        expect(l._startOffset).toBe(1);
        expect(l._end).toBe(span);
        expect(l._endOffset).toBe(2);
        expect(span.firstChild.nodeValue).toBe('f');
        expect(span.lastChild.nodeValue).toBe('ff');
        expect(l._ancestor).toBe(span);
    });

    it('lining._adjustTextBoundary:2', function () {
        // [fffff]
        var l = new Lining(root);
        var span = root.childNodes[3];
        l._start = span.firstChild;
        l._startOffset = 0;
        l._end = l._start;
        l._endOffset = span.firstChild.length;
        l._ancestor = l._start;
        l._adjustTextBoundary();
        expect(span.childNodes.length).toBe(1);
        expect(l._start).toBe(span);
        expect(l._startOffset).toBe(0);
        expect(l._end).toBe(span);
        expect(l._endOffset).toBe(1);
        expect(span.firstChild.nodeValue).toBe('fffff');
    });

    it('lining._adjustTextBoundary:3', function () {
        // <span>b[bb<b>cc]c</b>ddd<i>hhh</i>iii</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        l._start = span.firstChild;
        l._startOffset = 1;
        l._end = span.childNodes[1].firstChild;
        l._endOffset = 2;
        l._ancestor = span;
        l._adjustTextBoundary();
        expect(span.childNodes.length).toBe(6);
        expect(l._start).toBe(span);
        expect(l._startOffset).toBe(1);
        expect(l._end).toBe(span.childNodes[2]);
        expect(l._endOffset).toBe(1);
    });

    it('lining._adjustTextBoundary:4', function () {
        // <span>b[bb<b>ccc</b>ddd<i>hhh</i>iii]</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        l._start = span.firstChild;
        l._startOffset = 1;
        l._end = span.lastChild;
        l._endOffset = 3;
        l._ancestor = span;
        l._adjustTextBoundary();
        expect(span.childNodes.length).toBe(6);
        expect(l._start).toBe(span);
        expect(l._startOffset).toBe(1);
        expect(l._end).toBe(span);
        expect(l._endOffset).toBe(6);
    });

    it('lining._adjustTextBoundary:5', function () {
        // <span>bbb<b>c[cc</b>ddd<i>hh]h</i>iii</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        l._start = span.childNodes[1].firstChild;
        l._startOffset = 1;
        l._end = span.childNodes[3].firstChild;
        l._endOffset = 2;
        l._ancestor = span;
        l._adjustTextBoundary();
        expect(span.childNodes.length).toBe(5);
        expect(l._start).toBe(span.childNodes[1]);
        expect(l._startOffset).toBe(1);
        expect(l._end).toBe(span.childNodes[3]);
        expect(l._endOffset).toBe(1);
    });

    it('lining._adjustTextBoundary:6', function () {
        // <span>bbb<b>[ccc</b>ddd<i>hhh]</i>iii</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        l._start = span.childNodes[1].firstChild;
        l._startOffset = 0;
        l._end = span.childNodes[3].firstChild;
        l._endOffset = 3;
        l._ancestor = span;
        l._adjustTextBoundary();
        expect(span.childNodes.length).toBe(5);
        expect(l._start).toBe(span.childNodes[1]);
        expect(l._startOffset).toBe(0);
        expect(l._end).toBe(span.childNodes[3]);
        expect(l._endOffset).toBe(1);
    });

    it('lining._adjustOrSplitNode(true):1', function () {
        // <span>bbb<b>|ccc</b>ddd<i>hhh</i>iii</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._start = b;
        l._startOffset = 0;
        l._ancestor = root;
        l._adjustOrSplitNode(true);
        expect(root.childNodes.length).toBe(6);
        expect(l._ancestor).toBe(root);
        expect(l._start).toBe(root);
        expect(l._startOffset).toBe(2);
        expect(span.innerHTML).toBe('bbb');
        expect(span.nextSibling.nodeName).toBe('SPAN');
        expect(span.nextSibling.innerHTML).toBe('<b>ccc</b>ddd<i>hhh</i>iii');
    });

    it('lining._adjustOrSplitNode(true):2', function () {
        // <span>bbb<b>ccc</b>ddd<i>hhh</i>iii|</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._start = span;
        l._startOffset = 5;
        l._ancestor = root;
        l._adjustOrSplitNode(true);
        expect(root.childNodes.length).toBe(5);
        expect(l._ancestor).toBe(root);
        expect(l._start).toBe(root);
        expect(l._startOffset).toBe(2);
    });

    it('lining._adjustOrSplitNode(true):3', function () {
        // <span>|bbb<b>ccc</b>ddd<i>hhh</i>iii</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._start = span;
        l._startOffset = 0;
        l._ancestor = root;
        l._adjustOrSplitNode(true);
        expect(root.childNodes.length).toBe(5);
        expect(l._ancestor).toBe(root);
        expect(l._start).toBe(root);
        expect(l._startOffset).toBe(1);
    });

    it('lining._adjustOrSplitNode(false):4', function () {
        // <span>bbb<b>|ccc</b>ddd<i>hhh</i>iii</span>
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._end = b;
        l._endOffset = 0;
        l._ancestor = root;
        l._adjustOrSplitNode(false);
        expect(root.childNodes.length).toBe(6);
        expect(l._ancestor).toBe(root);
        expect(l._end).toBe(root);
        expect(l._endOffset).toBe(2);
        expect(span.innerHTML).toBe('bbb');
        expect(span.nextSibling.nodeName).toBe('SPAN');
        expect(span.nextSibling.innerHTML).toBe('<b>ccc</b>ddd<i>hhh</i>iii');
    });

    it('lining._adjustOrSplitNode(false):5', function () {
        // l._end === l._ancestor
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._end = root;
        l._endOffset = 0;
        l._ancestor = root;
        l._adjustOrSplitNode(false);
        expect(l._ancestor).toBe(root);
        expect(l._end).toBe(root);
        expect(l._endOffset).toBe(0);
    });

    it('lining._adjustOrSplitNode(false):6', function () {
        // l._end === l._ancestor
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._end = root;
        l._endOffset = 0;
        l._ancestor = root;
        l._adjustOrSplitNode(false);
        expect(l._ancestor).toBe(root);
        expect(l._end).toBe(root);
        expect(l._endOffset).toBe(0);
    });

    it('lining.surroundContents:1', function () {
        // <span>bbb<b>c[cc</b>ddd<i>hh]h</i>iii</span>
        var element = document.createElement('line');
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        var i = span.childNodes[3];
        l._start = b.firstChild;
        l._startOffset = 1;
        l._end = i.firstChild;
        l._endOffset = 2;
        l._ancestor = span;
        l.surroundContents(element);
        expect(span.childNodes.length).toBe(5);
        expect(span.innerHTML).toBe('bbb<b>c</b><line><b>cc</b>ddd<i>hh</i></line><i>h</i>iii');
    });

    it('lining.surroundContents:2', function () {
        // <span>bbb<b>[ccc]</b>ddd<i>hhh</i>iii</span>
        var element = document.createElement('line');
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._start = b.firstChild;
        l._startOffset = 0;
        l._end = b.firstChild;
        l._endOffset = 3;
        l._ancestor = b.firstChild;
        l.surroundContents(element);
        expect(span.innerHTML).toBe('bbb<b><line>ccc</line></b>ddd<i>hhh</i>iii');
    });

    it('lining.surroundContents:3', function () {
        // <span>bbb<b>c[c]c</b>ddd<i>hhh</i>iii</span>
        var element = document.createElement('line');
        var l = new Lining(root);
        var span = root.childNodes[1];
        var b = span.childNodes[1];
        l._start = b.firstChild;
        l._startOffset = 1;
        l._end = b.firstChild;
        l._endOffset = 2;
        l._ancestor = b.firstChild;
        l.surroundContents(element);
        expect(span.innerHTML).toBe('bbb<b>c<line>c</line>c</b>ddd<i>hhh</i>iii');
    });
});
