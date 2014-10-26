/**
 * lining.effect.js
 * Special lining effect.
 * https://github.com/zmmbreeze/lining.
 *
 * @author zmmbreeze / @zhoumm
 */

/* jshint sub:true, camelcase:false */
/* global lining:true */

(function (lining) {
    if (!lining || !lining.util || !lining.Lining) {
        return;
    }

    document.body.addEventListener('beforelining', function (e) {
        var target = e.target;
        var effectName = target.getAttribute('data-effect');
        var effect = Effects[effectName];
        if (effect && effect['before']) {
            effect['before'].call(this, e);
        }
    });

    document.body.addEventListener('afterlining', function (e) {
        var target = e.target;
        var effectName = target.getAttribute('data-effect');
        var effect = Effects[effectName];
        if (effect && effect['after']) {
            effect['after'].call(this, e);
        }
    });

    var allCssText = '';
    var Effects = {};
    var createEffect = function (name, effect) {
        Effects[name] = effect;
        allCssText += effect['css'];
    };

    createEffect('fadeIn', {
        'css': ''
            + '[data-effect="fadeIn"] {'
            +     'opacity:0;'
            + '}'
            + '[data-effect="fadeIn"][data-lining="end"],'
            + '.nolining [data-effect="fadeIn"] {'
            +     'opacity:1;'
            + '}'
            + '[data-effect="fadeIn"] line {'
            +     'opacity:0;'
            +     'transition:1s opacity;'
            + '}',
        'after': function (e) {
            var target = e.target;
            var lines = Array.prototype.slice.call(target.getElementsByTagName('line'), 0);
            (function animate() {
                if (!lines.length) {
                    return;
                }

                setTimeout(function () {
                    lines.shift().style.opacity = 1;
                    animate();
                }, 150);
            })();
        }
    });

    createEffect('slideIn', {
        'css': ''
            + '[data-effect="slideIn"] {'
            +     'opacity:0;'
            + '}'
            + '[data-effect="slideIn"][data-lining="end"],'
            + '.nolining [data-effect="slideIn"] {'
            +     'opacity:1;'
            + '}'
            + '[data-effect="slideIn"] line {'
            +     'opacity:0;'
            +     'transition:1s opacity, .5s left;'
            +     '-webkit-transform:translate3d(0, 0, 0);'
            +     'transform:translate3d(0, 0, 0);'
            +     'position:relative;'
            +     'left:-100%;'
            + '}',
        'after': function (e) {
            var target = e.target;
            var lines = Array.prototype.slice.call(target.getElementsByTagName('line'), 0);
            (function animate() {
                if (!lines.length) {
                    return;
                }

                setTimeout(function () {
                    var line = lines.shift();
                    line.style.opacity = 1;
                    line.style.left = '0';
                    animate();
                }, 150);
            })();
        }
    });

    lining.util.createStyle(allCssText);
})(lining);
