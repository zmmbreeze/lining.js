LINING.JS
==

> An easy to use javascript plugin offers you complete DOWN-TO-THE-LINE control for radical web typography.

<img src="https://travis-ci.org/zmmbreeze/lining.js.svg?branch=master"/>

In CSS we already have the selector `::first-line` to apply style on the first line of element. But there is no selector like `::nth-line()`, `::nth-last-line()` or even `::last-line`. Then I read an article [A Call for ::nth-everything](http://css-tricks.com/a-call-for-nth-everything/) from CSS tricks. `::nth-line()` is actually really useful in some situation.

There comes [LINING.JS](http://zencode.in/lining.js/). It offers you complete DOWN-TO-THE-LINE control like this:

```html
<div class="poem" data-lining>Some text...</div>
<style>
.poem .line[first] { /* `.poem::first-line`*/ }
.poem .line[last] { /* `.poem::last-line` */ }
.poem .line[index="5"] { /* `.poem::nth-line(5)` */ }
.poem .line:nth-of-type(-n+2) { /* `.poem::nth-line(-n+2)` */ }
.poem .line:nth-last-of-type(2n) { /* `.poem:::nth-last-line(2n)` */ }
</style>
<script src="YOUR_PATH/lining.min.js"></script>
```

Supported browsers 
<img src="assets/chrome_256x256.png" width="24" height="24" alt="Lastest Chrome" title="Latest Chrome">
<img src="assets/firefox_256x256.png" width="24" height="24" alt="Lastest Firefox" title="Latest Firefox">
<img src="assets/safari_256x256.png" width="24" height="24" alt="Lastest Safari" title="Latest Safari">
<img src="assets/safari-ios_256x256.png" width="24" height="24" alt="Lastest Mobile Safari" title="Lastest Mobile Safari">
<img src="assets/opera_256x256.png" width="24" height="24" alt="Lastest Opera" title="Lastest Opera">

BASIC USAGE
--
All you need to do is adding `data-lining` attribute on your block element and including the `lining.min.js` script. Then you can write css to control it's line style. For example:

```html
<div class="poem" data-lining>Some text...</div>
<style>
.poem { /* default style for `.poem` */ }
.nolining .poem { /* style for `.poem` when browser don't support lining.js */ }
.poem[data-lining] { /* style for `.poem` when browser support lining.js */ }
.poem[data-lining="end"] { /* style for `.poem` when `line` tags created */ }
.poem .line { /* style for lines */ }
</style>
<script src="YOUR_PATH/lining.min.js"></script>
```

RWD
--
If you want your line style support Responsive web design. Make sure you add the `data-auto-resize` attribute. It will automatically relining when window resize event happen.

```html
<div class="poem" data-lining data-auto-resize>Some text...</div>
```

Other attributes
--
`data-from` and `data-to` help help you control which line tags to be created. For example:

```html
<div class="poem"
    data-lining
    data-from="2"
    data-to="3">
First Line.<br/>
Second Line.<br/>
Third Line.<br/>
Fourth Line.<br/>
</div>
```

After lining, only the second and third line tag will be created. Check out the [demo](http://jsbin.com/riweb/2/edit?output).

And `data-line-class` help you control the class name of line tags, if you don't want to use the default class name: `line`.

Javascript
--
You can also create and manage line tags by javascript. And give you four events to do special things.

```html
<div id="poem">Some text..</div>
<script>
var poem = document.getElementById('poem');
poem.addEventListener('beforelining', function (e) {
    // prevent lining if you want
    e.preventDefault();
}, false);
poem.addEventListener('afterlining', function () {
    // do something after lining
}, false);
poem.addEventListener('beforeunlining', function () {
    // do something before unlining
    // can't prevent unlining
}, false);
poem.addEventListener('afterunlining', function () {
    // do something after unlining
}, false);

// start lining
var poemLining = lining(poem, {
    // optional config
    'autoResize': true,
    'from': 2,
    'to': 3,
    'lineClass': 'my-class'
});
// `unlining` method will remove all line tags.
poemLining.unlining();
// `relining` method will call `unlining` first if needed,
// then start lining again.
poemLining.relining();
</script>
lining.effect.js
```

`lining.effect.js` is an extra part of `lining.js`. It gives you the power to add appearances animation on your lines. Use it like this:

```html
<script src="YOUR_PATH/lining.min.js"></script>
<script src="YOUR_PATH/lining.effect.min.js"></script>

<div data-lining data-effect="rolling">
Your text...
<div>
```

INSTALL
--

[DOWNLOAD](https://github.com/zmmbreeze/lining.js/releases) or using [bower](http://bower.io/) to install like this:

```sh
$ bower install lining.js
```

### CDN

jsDelivr provides free CDN hosting which helps speed webpage loading.  Usage is simple:
```html
<script src="//cdn.jsdelivr.net/lining.js/VERSION/lining.min.js"></script>
```
then change `VERSION` with the version number you can find [hosted at jsDelivr](http://www.jsdelivr.com/#!lining.js).<br>
If you want to also use effects, you can take advantage of collating and reduce a HTTP request:
```html
<script src="//cdn.jsdelivr.net/g/lining.js@VERSION(lining.min.js+lining.effect.min.js)"></script>
```

Other
--

- [Post from Dailyjs](http://dailyjs.com/2014/11/17/protractor-perf-lining/#liningjs)
- [#liningjs](https://twitter.com/hashtag/liningjs)
- [Demo for lining.js working with scrollReveal.js](http://codepen.io/zmmbreeze/pen/dPYYOo)
- [中文首页](http://zencode.in/lining.js/index_cn.html)
