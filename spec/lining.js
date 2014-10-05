describe('lining.js -- main', function() {
    var util = lining.util;
    var Lining = lining.Lining;
    var root = document.createElement('div');
    document.body.appendChild(root);

    beforeEach(function() {
        root.innerHTML = 'aaaaa'
            + '<span>bbb<b>ccc</b>ddd<i>hhh</i>iii</span>'
            + 'eeeee'
            + '<span><b>hhh<i>fffff</i></b></span>gggg'
            + '<span><b>lll<i>mmmmm</i>nnn</b></span>gggg'
            + '<span><b>jjj<i>iiiii<span><i>\n</i></span><span> </span></i></b><b></b>kkk</span>ttt'
            + '<span><b>ooo<i>qqqqq<span><i>\n</i></span><span> </span></i><b></b></b></span>'
            + '<span><b>rrr<i>sssss<span><i>\n</i></span><span> </span></i><b></b></b></span>';
    });

    afterEach(function () {
        root.innerHTML = '';
    });

    it('_getNextLineStartPoint:1', function () {
        // <span><b>hhh<i>fff|ff</i></b></span>gggg
        // ==>
        // <span><b>hhh<i>fff|ff</i></b></span>gggg
        var l = new Lining(root);
        var span = root.childNodes[3];
        var text = span.childNodes[0].childNodes[1].childNodes[0];
        var r = l._getNextLineStartPoint(text, 3);
        expect(r[0]).toBe(text);
        expect(r[1]).toBe(3);
    });

    it('_getNextLineStartPoint:2', function () {
        // <span><b>lll<i>mmmmm|</i>nnn</b></span>gggg
        // ==>
        // <span><b>lll<i>mmmmm</i>|nnn</b></span>gggg
        var l = new Lining(root);
        var span = root.childNodes[5];
        var b = span.childNodes[0];
        var i = b.childNodes[1];
        var text = i.childNodes[0];
        var r = l._getNextLineStartPoint(text, 5);
        expect(r[0]).toBe(b.childNodes[2]);
        expect(r[1]).toBe(0);
    });

    it('_getNextLineStartPoint:3', function () {
        // <span><b>jjj<i>iiiii|<span><i>\n</i></span><span> </span></i></b><b></b>kkk</span>
        // ==>
        // <span><b>jjj<i>iiiii<span><i>\n</i></span><span> </span></i></b><b></b>|kkk</span>
        var l = new Lining(root);
        var span = root.childNodes[7];
        var b = span.childNodes[0];
        var i = b.childNodes[1];
        var text = i.childNodes[0];
        var r = l._getNextLineStartPoint(text, 5);
        expect(r[0]).toBe(span.childNodes[2]);
        expect(r[1]).toBe(0);
    });

    it('_getNextLineStartPoint:4', function () {
        // <span><b>ooo<i>qqqqq|<span><i>\n</i></span><span> </span></i><b></b></b></span>
        // ==>
        // <span><b>ooo<i>qqqqq<span><i>\n</i></span><span> </span></i><b></b></b></span>
        // <span><b>|rrr<i>sssss|<span><i>\n</i></span><span> </span></i><b></b></b></span>
        var l = new Lining(root);
        var span = root.childNodes[9];
        var b = span.childNodes[0];
        var i = b.childNodes[1];
        var text = i.childNodes[0];
        var r = l._getNextLineStartPoint(text, 5);
        expect(r[0]).toBe(root.childNodes[10].childNodes[0].childNodes[0]);
        expect(r[1]).toBe(0);
    });

    it('_getNextLineStartPoint:5', function () {
        // <span><b>rrr<i>sssss|<span><i>\n</i></span><span> </span></i><b></b></b></span>
        // ==>
        // null
        var l = new Lining(root);
        var span = root.childNodes[10];
        var b = span.childNodes[0];
        var i = b.childNodes[1];
        var text = i.childNodes[0];
        var r = l._getNextLineStartPoint(text, 5);
        expect(r).toBe(null);
    });
});
