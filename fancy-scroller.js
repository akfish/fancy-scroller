(function (ns, $) {
  ns.ready = function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  function $$(tag, classList) {
    var elem = document.createElement(tag);
    if (classList) {
      elem.className = classList.join(" ");
    }
    return elem;
  }

  var FancyScroller = function(selector) {
    console.log('Fancy Post');
    this.el = $(selector);
    // TODO: fix this and make it self contained
    this.strecher = $$('div', ['strecher']);
    this.inner = $$('div', ['inner']);
    this.el.appendChild(this.strecher);
    this.el.appendChild(this.inner);
    this.sections = this.el.querySelectorAll(".section");
    for (var i = 0; i < this.sections.length; i++) {
      this.inner.appendChild(this.sections[i]);
    }

    // this.updateHeightMap();
    ns.ready(this.updateHeightMap.bind(this));
    // Somehow elements' height is not gauranteed to be correct on dom ready
    // Nasty little hack to make sure it works
    setTimeout(this.updateHeightMap.bind(this), 200);
    document.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
    this.el.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.el.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.el.addEventListener('touchend', this.onTouchEnd.bind(this));
    this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.el.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.el.addEventListener('mouseup', this.onMouseUp.bind(this));

    this._mouseDown = false;

    this.initialClassName = this.el.className;

    this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  };

  FancyScroller.prototype.onResize = function() {
    this.updateHeightMap();
  };

  FancyScroller.prototype.onTouchStart = function(e) {
    // TODO: disable scroll event handler
    e.preventDefault();
    this.el.className += " noselect";
    document.removeEventListener('scroll', this.onScroll.bind(this));
    this._touchStart = true;
    this._lastTouchEvent = e;
  };

  FancyScroller.prototype.onTouchMove = function(e) {
    // TODO: update scroll position
    if (!this._touchStart) return;
    function getY(evt) {
      return evt.pageY || evt.targetTouches[0].pageY;
    }
    var delta = getY(e) - getY(this._lastTouchEvent);
    var scrollTop = this.scrollTop;
    var newScrollTop = scrollTop - delta;
    this.scrollTo(scrollTop - delta);
    this._lastTouchEvent = e;
  };

  FancyScroller.prototype.onTouchEnd = function(e) {
    // TODO: enable scroll event handler
    document.addEventListener('scroll', this.onScroll.bind(this));
    this._touchStart = false;
    this.el.className = this.initialClassName;
  };

  FancyScroller.prototype.onMouseDown = function(e) {
    // TODO: disable scroll event handler
    this._mouseDown = true;
    this.el.className += " noselect";
    document.removeEventListener('scroll', this.onScroll.bind(this));

    this._lastMouseEvent = e;
  };

  FancyScroller.prototype.onMouseMove = function(e) {
    // TODO: update scroll position
    if (!this._mouseDown) return;
    var delta = e.clientY - this._lastMouseEvent.clientY;

    var scrollTop = this.scrollTop;
    var newScrollTop = scrollTop - delta;
    this.scrollTo(scrollTop - delta);
    document.documentElement.scrollTop = document.body.scrollTop = newScrollTop;
    this._lastMouseEvent = e;

  };

  FancyScroller.prototype.onMouseUp = function(e) {
    // TODO: enable scroll event handler
    this._mouseDown = false;
    document.addEventListener('scroll', this.onScroll.bind(this));
    this.el.className = this.initialClassName;
  };

  FancyScroller.prototype.updateHeightMap = function() {
    this._heights = [];
    this._accumulated = [];
    var acc = 0;
    for (var i = 0; i < this.sections.length; i++) {
      var section = this.sections[i];
      var height = section.clientHeight || section.offsetHeight;
      this._heights.push(height);
      acc += height;
      this._accumulated.push(acc);
    }
    this.totalHeight = acc;
    this.strecher.style.height = acc + "px";
  };

  FancyScroller.prototype.scrollTo = function(scrollTop) {
    function setTransform(el, value) {
      var style = el.style;
      style.transform = style['-webkit-transform'] = value;
    }

    if (scrollTop < 0) {
      scrollTop = 0;
    }
    if (scrollTop + window.innerHeight > this.totalHeight) {
      scrollTop = this.totalHeight - window.innerHeight;
    }
    var i;
    for (i = 0; i < this.sections.length; i++) {
      if (scrollTop < this._accumulated[i]) break;
    }
    setTransform(this.inner, "translateY(-" + scrollTop + "px)");
    if (scrollTop + window.innerHeight > this._accumulated[i]) {
      var delta = this._accumulated[i] - scrollTop;
      var f = delta / window.innerHeight;
      setTransform(this.sections[i], "translateY(" + (1- f) * 0.6 * window.innerHeight + "px)");
      setTransform(this.sections[i + 1], "translateY(0)");
      this.sections[i + 1].style['box-shadow'] = "0 0px " + f * 50 + "px 1px rgba(0, 0, 0, 0.7)";
    } else {
      // this.sections[i].style.opacity = 1;
      setTransform(this.sections[i], "translateY(0)");
    }
    this.scrollTop = scrollTop;
  };

  FancyScroller.prototype.doScroll = function() {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    this.scrollTo(scrollTop);

  };

  FancyScroller.prototype.onScroll = function (e) {
    this.doScroll();
  };

  ns.FancyScroller = FancyScroller;
})(window, document.querySelector.bind(document));
