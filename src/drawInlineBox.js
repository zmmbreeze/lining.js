
var drawInlineBox = function(el) {
    el = typeof el === 'string' ?
                document.getElementById(el) :
                el;
    var lines = document.createElement('lines');
    lines.style.display = 'inline';

    var children = [];
    for (var i = 0, l = el.childNodes.length; i < l; i++) {
        children[i] = el.childNodes[i];
    }

    for (i = 0, l = children.length; i < l; i++) {
        lines.appendChild(children[i]);
    }
    el.appendChild(lines);

    var me = this;
    var rects = el.childNodes[0].getClientRects();
    var rect;
    for (var m = 0, n = rects.length; m < n; m++) {
        rect = rects[m];
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = rect.top + 'px';
        div.style.left = rect.left + 'px';
        div.style.width = (rect.right - rect.left) + 'px';
        div.style.height = (rect.bottom - rect.top) + 'px';
        div.style.border = '1px solid red';
        el.appendChild(div);
    }
};
