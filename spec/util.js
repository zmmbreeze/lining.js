describe('lining.js -- util', function() {
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

    it('util.removeChildren(start, 1)', function() {
        var span = root.childNodes[1];
        var count = span.childNodes.length;
        var removed = util.removeChildren(span, 1);
        expect(span.innerHTML).toBe('bbb');
        expect(span.childNodes.length).toBe(1);
        expect(removed.length).toBe(count - 1);
        expect(removed[0].nodeValue).toBe('iii');
        expect(removed[removed.length - 1].innerHTML).toBe('ccc');
    });

    it('util.removeChildren(start, 0)', function() {
        util.removeChildren(root, 0);
        expect(root.childNodes.length).toBe(0);
    });

    it('util.removeChildren(start, -1)', function() {
        util.removeChildren(root, -1);
        expect(root.childNodes.length).toBe(0);
    });

    it('util.removeChildren(start, lastIndex)', function() {
        var oldHtml = root.innerHTML;
        var count = root.childNodes.length;
        util.removeChildren(root, count);
        expect(root.childNodes.length).toBe(count);
        util.removeChildren(root, count + 1);
        expect(root.childNodes.length).toBe(count);
        expect(root.innerHTML).toBe(oldHtml);
        util.removeChildren(root, count - 1);
        expect(root.childNodes.length).toBe(count - 1);
        expect(root.lastChild.innerHTML).toBe('fffff');
    });

    it('util.removeChildren(start, 0, lastIndex)', function() {
        util.removeChildren(root, 0, root.childNodes.length);
        expect(root.childNodes.length).toBe(0);
    });

    it('util.removeChildren(start, 1, 3)', function() {
        var removed = util.removeChildren(root, 1, 3);
        expect(root.childNodes.length).toBe(3);
        expect(removed.length).toBe(2);
        expect(root.innerHTML).toBe('aaaaa<span>fffff</span>gggg');
    });

    it('util.removeChildren(start, 1, 1)', function() {
        var removed = util.removeChildren(root, 1, 1);
        expect(root.childNodes.length).toBe(5);
        expect(removed).toEqual([]);

        var removed = util.removeChildren(root, 4, 0);
        expect(root.childNodes.length).toBe(5);
        expect(removed).toEqual([]);
    });

    it('util.splitNode(span, offset)', function() {
        var span = root.childNodes[1];
        var re = util.splitNode(span, 2);
        expect(span.childNodes.length).toBe(2);
        expect(span.innerHTML).toBe('bbb<b>ccc</b>');
        expect(span.nextSibling.nodeName).toBe('SPAN');
        expect(span.nextSibling.childNodes.length).toBe(3);
        expect(re).toBe(span.parentNode);
    });

    it('util.splitNode(span, 0)', function() {
        var span = root.childNodes[1];
        util.splitNode(span, 0);
        expect(span.childNodes.length).toBe(0);
        expect(span.innerHTML).toBe('');
        expect(span.nextSibling.nodeName).toBe('SPAN');
        expect(span.nextSibling.childNodes.length).toBe(5);
        expect(span.nextSibling.innerHTML).toBe('bbb<b>ccc</b>ddd<i>hhh</i>iii');
    });

    it('util.getNodeOffset(node)', function () {
        expect(util.getNodeOffset(root.firstChild)).toBe(0);
        expect(util.getNodeOffset(root.lastChild)).toBe(root.childNodes.length - 1);
        expect(util.getNodeOffset(root.childNodes[2])).toBe(2);
    });

    it('util.isEmptyNode(node)', function () {
        var span = root.childNodes[1];
        expect(util.isEmptyNode(span)).toBe(false);
        var b = span.childNodes[1];
        b.innerHTML = '';
        expect(util.isEmptyNode(b)).toBe(true);
        span.innerHTML = '<b><i>xxx</i></b>';
        expect(util.isEmptyNode(span)).toBe(false);
        span.innerHTML = '<b><i></i></b>';
        expect(util.isEmptyNode(span)).toBe(true);
    });

    describe('util.getFirstContentNode(node)', function () {
        beforeEach(function() {
            root.innerHTML = '<span>111</span>'
                + '<span><b><i></i></b><b>222</b></span>'
                + '<span><b><i>333</i></b><b></b></span>'
                + '<span><b><i></i>444</b><b></b></span>'
                + '<span><b><i></i></b><b></b></span>'
                + '<span><b><i></i></b><b><i>555</i></b></span>'
                + '<span><b><i></i></b><b><i></i></b><span>666</span></span>'
                + '<span><b><i></i></b><b><i></i></b>777</span>';
        });

        it('1', function () {
            expect(util.getFirstContentNode(root.childNodes[0])[0].nodeValue).toBe('111');
        });

        it('2', function () {
            expect(util.getFirstContentNode(root.childNodes[1])[0].nodeValue).toBe('222');
        });

        it('3', function () {
            expect(util.getFirstContentNode(root.childNodes[2])[0].nodeValue).toBe('333');
        });

        it('4', function () {
            expect(util.getFirstContentNode(root.childNodes[3])[0].nodeValue).toBe('444');
        });

        it('5', function () {
            expect(util.getFirstContentNode(root.childNodes[4])).toBe(null);
        });

        it('6', function () {
            expect(util.getFirstContentNode(root.childNodes[5])[0].nodeValue).toBe('555');
        });

        it('7', function () {
            expect(util.getFirstContentNode(root.childNodes[6])[0].nodeValue).toBe('666');
        });

        it('8', function () {
            expect(util.getFirstContentNode(root.childNodes[7])[0].nodeValue).toBe('777');
        });
    });

    describe('util.adjustOrSplitNode(ancestor, node, offset)', function () {
        it('1', function () {
            // <span>bbb<b>|ccc</b>ddd<i>hhh</i>iii</span>
            var span = root.childNodes[1];
            var b = span.childNodes[1];
            var r = util.adjustOrSplitNode(root, b, 0);
            expect(root.childNodes.length).toBe(6);
            expect(r[0]).toBe(root);
            expect(r[1]).toBe(2);
            expect(span.innerHTML).toBe('bbb');
            expect(span.nextSibling.nodeName).toBe('SPAN');
            expect(span.nextSibling.innerHTML).toBe('<b>ccc</b>ddd<i>hhh</i>iii');
        });

        it('2', function () {
            // <span>bbb<b>ccc</b>ddd<i>hhh</i>iii|</span>
            var span = root.childNodes[1];
            var r = util.adjustOrSplitNode(root, span, 5);
            expect(root.childNodes.length).toBe(5);
            expect(r[0]).toBe(root);
            expect(r[1]).toBe(2);
        });

        it('3', function () {
            // <span>|bbb<b>ccc</b>ddd<i>hhh</i>iii</span>
            var span = root.childNodes[1];
            var r = util.adjustOrSplitNode(root, span, 0);
            expect(root.childNodes.length).toBe(5);
            expect(r[0]).toBe(root);
            expect(r[1]).toBe(1);
        });

        it('4', function () {
            // <span>bbb<b>|ccc</b>ddd<i>hhh</i>iii</span>
            var span = root.childNodes[1];
            var b = span.childNodes[1];
            var r = util.adjustOrSplitNode(root, b, 0);
            expect(root.childNodes.length).toBe(6);
            expect(r[0]).toBe(root);
            expect(r[1]).toBe(2);
            expect(span.innerHTML).toBe('bbb');
            expect(span.nextSibling.nodeName).toBe('SPAN');
            expect(span.nextSibling.innerHTML).toBe('<b>ccc</b>ddd<i>hhh</i>iii');
        });

        it('5', function () {
            // node === ancestor
            var r = util.adjustOrSplitNode(root, root, 0);
            expect(r[0]).toBe(root);
            expect(r[1]).toBe(0);
        });
    });
});
