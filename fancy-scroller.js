(function (ns, $) {
  // window.performance polyfill
  (function(){

    if ("performance" in window === false) {
        window.performance = {};
    }

    Date.now = (Date.now || function () {  // thanks IE8
  	  return new Date().getTime();
    });

    if ("now" in window.performance === false){

      var nowOffset = Date.now();

      if (performance.timing && performance.timing.navigationStart){
        nowOffset = performance.timing.navigationStart;
      }

      window.performance.now = function now(){
        return Date.now() - nowOffset;
      };
    }

  })();

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

  var FancyScroller = function(container, opts) {
    opts = opts || {};
    this.friction = opts.friction || 0.9;
    this.maxEndSpringLength = opts.maxEndSpringLength || 64;
    this.overlapFactor = opts.overlapFactor || 0.6;
    this.snapTime = opts.snapTime || 300;
    this.snapSectionTop = opts.snapSectionTop || true;
    this.snapSectionBottom = opts.snapSectionBottom || true;

    this.container = container;
    this.el = $$('div', ['wrapper']);
    this.container.appendChild(this.el);
    this.strecher = $$('div', ['strecher']);
    this.inner = $$('div', ['inner']);
    this.el.appendChild(this.strecher);
    this.el.appendChild(this.inner);
    this.sections = this.container.querySelectorAll(".section");
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

    this._movement = {
      moving: false,
      lastPosition: 0,
      lastTime: 0,
      startPosition: 0,
      startTime: 0,
      dY: 0,
      velocity: 0,
      dT: 0,
    };

    this._animation = {
      epsilon: 0.01,
      animating: false,
      shouldCancel: false,
      lastTick: 0,
      tickCallback: null,
      targetState: null,
      completeCallback: null
    };
  };

  FancyScroller.prototype.onResize = function() {
    this.updateHeightMap();
  };

  FancyScroller.prototype.startAnimation = function(onTick, targetState, onComplete) {
    this._animation.lastTick = window.performance.now();
    this._animation.animating = true;
    this._animation.shouldCancel = false;
    this._animation.tickCallback = onTick;
    this._animation.targetState = targetState;
    this._animation.completeCallback = onComplete;
    requestAnimationFrame(this.tick.bind(this));
  };

  FancyScroller.prototype.tick = function(t) {
    if (this._animation.shouldCancel) return;
    this._animation.animating = true;
    var now = window.performance.now(),
      dt = now - this._animation.lastTick;
    this._animation.lastTick = now;

    var state = this._animation.tickCallback(dt),
      target = this._animation.targetState;

    // Check if we have reched target state
    if (Math.abs(state - target) > this._animation.epsilon) {
      requestAnimationFrame(this.tick.bind(this));
    } else {
      this._animation.animating = false;

      if (this._animation.completeCallback) {
        this._animation.completeCallback();
      }
    }
  };

  FancyScroller.prototype.handleMoveStart = function(pos) {
    this.el.className += " noselect";
    document.removeEventListener('scroll', this.onScroll.bind(this));
    var now = window.performance.now();
    this._movement.moving = true;
    this._movement.lastPosition = this._movement.startPosition = pos;
    this._movement.lastTime = this._movement.startTime = now;

    this._animation.shouldCancel = true;
  };

  FancyScroller.prototype.updateMovement = function(pos, updateScrollBar) {
    var delta = this._movement.dY = pos - this._movement.lastPosition,
      now = window.performance.now(),
      dT = this._movement.dT = now - this._movement.lastTime,
      velocity = this._movement.velocity = delta / dT;

    this._movement.lastTime = now;
    this._movement.lastPosition = pos;
    this._movement.updateScrollBar = updateScrollBar;
  };

  FancyScroller.prototype.scrollByDelta = function(delta, updateScrollBar) {
    var scrollTop = this.scrollTop;
    var newScrollTop = scrollTop - delta;
    this.scrollTo(newScrollTop, updateScrollBar);
  };

  FancyScroller.prototype.handleMoveUpdate = function(pos, updateScrollBar) {
    if (!this._movement.moving) return;
    this.updateMovement(pos, updateScrollBar);
    this.scrollByDelta(this._movement.dY, updateScrollBar);
  };

  FancyScroller.prototype.handleMoveEnd = function(pos) {
    this.el.className = this.initialClassName;
    document.addEventListener('scroll', this.onScroll.bind(this));
    this._movement.moving = false;

    // Inertial animation
    var that = this;
    // var pV = (this._movement.velocity > 0) ? 1 : -1;
    this.startAnimation(function (dt) {
      var delta = that._movement.velocity * dt;
      that.scrollByDelta(delta, that._movement.updateScrollBar);

      // var v = that._movement.velocity,
      //   k = 0.02,
      //   dV = k * v * v * dt;
      //
      // // dV should always pointing to the opposite direction
      // if (v > 0) dV = -dV;

      // that._movement.velocity += dV;
      that._movement.velocity *= that.friction;

      // Cannot go further
      if (that.scrollTop <= -that.maxEndSpringLength ||
        that.scrollTop + window.innerHeight > that.totalHeight + that.maxEndSpringLength * that.overlapFactor) {
        that._movement.velocity = 0;
      }

      // Avoid changing sign
      // if (pV * that._movement.velocity < 0) {
      //   that._movement.velocity = 0;
      // }

      return that._movement.velocity;
    }, 0, that.onMovementComplete.bind(that));
  };

  FancyScroller.prototype.onMovementComplete = function() {
    var snapToPos;

    if (this.scrollTop < 0) {
      snapToPos = 0;
    } else if (this.scrollTop + window.innerHeight > this.totalHeight) {
      snapToPos = this.totalHeight - window.innerHeight;
    } else if (this.snapSectionTop &&
      this.visibleSectionBorderPos > 0 && this.visibleSectionBorderPos < window.innerHeight * 0.3) {
      snapToPos = this._accumulated[this.currentSectionIndex];
    } else if (this.snapSectionBottom &&
      this.visibleSectionBorderPos > window.innerHeight * 0.7 && this.visibleSectionBorderPos < window.innerHeight) {
        snapToPos = this.currentSectionIndex > 0 ? this._accumulated[this.currentSectionIndex - 1] : 0;
    }
    var snapTime = this.snapTime;
    if (snapToPos !== null && !isNaN(snapToPos)) {
      var that = this,
        ti = 0,
        p0 = this.scrollTop,
        delta = snapToPos - p0;
      this.startAnimation(function (dt) {
        ti += dt;
        f = Math.min(1, ti / snapTime);
        that.scrollTo(p0 + f * f * delta, true);
        return f;
      }, 1);
    }
  };

  FancyScroller.prototype.onTouchStart = function(e) {
    e.preventDefault();
    this.handleMoveStart(e.pageY || e.touches[0].pageY || e.targetTouches[0].pageY);
  };

  FancyScroller.prototype.onTouchMove = function(e) {
    this.handleMoveUpdate(e.pageY || e.touches[0].pageY || e.targetTouches[0].pageY, false);
  };

  FancyScroller.prototype.onTouchEnd = function(e) {
    this.handleMoveEnd(e.clientY);
  };

  FancyScroller.prototype.onMouseDown = function(e) {
    this.handleMoveStart(e.clientY);
  };

  FancyScroller.prototype.onMouseMove = function(e) {
    this.handleMoveUpdate(e.clientY, true);
  };

  FancyScroller.prototype.onMouseUp = function(e) {
    this.handleMoveEnd(e.clientY);
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

  FancyScroller.prototype.scrollTo = function(scrollTop, updateScrollBar) {
    function setTransform(el, value) {
      var style = el.style;
      style.transform = style['-webkit-transform'] = value;
    }

    this.topOvershoot = this.bottomOvershoot = false;

    if (scrollTop < -this.maxEndSpringLength) {
      scrollTop = -this.maxEndSpringLength;
      this.topOvershoot = true;
    } else if (scrollTop + window.innerHeight > this.totalHeight + this.maxEndSpringLength) {
      scrollTop = this.totalHeight - window.innerHeight + this.maxEndSpringLength;
      this.bottomOvershoot = true;
    }
    var i;
    for (i = 0; i < this.sections.length; i++) {
      if (scrollTop < this._accumulated[i]) break;
    }

    this.visibleSectionBorderPos = scrollTop < 0 ? -scrollTop : this._accumulated[i] - scrollTop;

    // Current secion is always the upper one
    this.currentSectionIndex = i;

    var currentSection = this.sections[i],
      nextSection = this.sections[i + 1];
    setTransform(this.inner, "translateY(" + (-scrollTop) + "px)");
    if (scrollTop + window.innerHeight > this._accumulated[i]) {
      var delta = this._accumulated[i] - scrollTop;
      var f = delta / window.innerHeight;
      setTransform(currentSection, "translateY(" + (1- f) * this.overlapFactor * window.innerHeight + "px)");
      if (nextSection) {
        setTransform(nextSection, "translateY(0)");
        nextSection.style['box-shadow'] = "0 0px " + f * 50 + "px 1px rgba(0, 0, 0, 0.7)";
      }
    } else if (scrollTop < 0) {
      var _f = -scrollTop / window.innerHeight;
      currentSection.style['box-shadow'] = "0 0px " + _f * 50 + "px 1px rgba(0, 0, 0, 0.7)";
    } else {
      // this.sections[i].style.opacity = 1;
      if (i != this.sections.length - 1) {
        setTransform(currentSection, "translateY(0)");
      }
    }
    this.scrollTop = scrollTop;

    if (updateScrollBar) {
      document.documentElement.scrollTop = document.body.scrollTop = scrollTop;
    }
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
