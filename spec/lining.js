describe('lining.js -- main', function() {
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

    it('lining', function () {

    });
});
