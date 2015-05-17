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

  ns.LOADED_STYLES = ns.LOADED_STYLES || {};
  ns.loadStyle = function(url) {
    if (ns.LOADED_STYLES[url]) {
      return;
    }
    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", url);
    document.getElementsByTagName("head")[0].appendChild(link);
    ns.LOADED_STYLES[url] = true;
  };

  // Check for mobile platform.
  // Note that unlike some other applications, we actually consider iPad as mobile devices
  // because we need to disable its native scroll behavior
  ns.isMobile = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

  var style_url = 'style.min.css',
    style_debug_url = 'style.css';

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

  function defaults() {
    var o = {};
    for (var i = 0; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        o[key] = arguments[i][key];
      }
    }
    return o;
  }

  var DEFAULT_OPTS = {
    friction: 0.9,
    maxEndSpringLength: 64,
    overlapFactor: 0.6,
    snapTime: 300,
    snapSectionTop: true,
    snapSectionBottom: true,
    showMobileScrollIndicator: true,
    hashPrefix: 'section-',
    autoSetHash: false,
    debug: false,
    // loadDefaultStyle: true,
    animationEpsilon: 0.01,
    enablePageKeyNavigation: true,
    keyEventSource: 'window',
    maxSnapableVelocity: 0.1,
    idleTimeout: 1000
  };

  var CONSOLE = {
    log: function () {
      console.log.apply(console, arguments);
    },
    warn: function () {
      console.warn.apply(console, arguments);
    },
    error: function () {
      console.error.apply(console, arguments);
    }
  },

  KONSOLE = {
    log: function () {},
    warn: function () {},
    error: function () {}
  };

  var FancyScroller = function(container, opts) {
    this.opts = defaults(DEFAULT_OPTS, opts);

    // if (this.opts.loadDefaultStyle) {
    //   ns.loadStyle(this.opts.debug ? style_debug_url : style_url);
    // }

    this.console = this.opts.debug ? CONSOLE : KONSOLE;

    this.container = container;
    if (ns.isMobile()) {
      this.container.className += 'is-mobile';
    }
    this.el = $$('div', ['wrapper']);
    this.el.tabIndexAttr = document.createAttribute('tabindex');
    this.el.tabIndexAttr.value = -1;
    this.el.setAttributeNode(this.el.tabIndexAttr);
    this.container.appendChild(this.el);
    this.strecher = $$('div', ['strecher']);
    this.inner = $$('div', ['inner']);
    this.indicator = $$('div', ['mobile-scroll-indicator']);

    this.indicator.activeAttr = document.createAttribute('active');
    this.indicator.activeAttr.value = false;
    this.indicator.setAttributeNode(this.indicator.activeAttr);
    if (!this.opts.showMobileScrollIndicator) {
      this.indicator.style.display = 'none';
    }

    this.el.appendChild(this.strecher);
    this.el.appendChild(this.inner);
    this.el.appendChild(this.indicator);
    this.sections = this.container.querySelectorAll(".section");
    for (var i = 0; i < this.sections.length; i++) {
      this.inner.appendChild(this.sections[i]);
    }


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
      epsilon: this.opts.animationEpsilon,
      animating: false,
      shouldCancel: false,
      lastTick: 0,
      tickCallback: null,
      targetState: null,
      completeCallback: null
    };
    // this.updateHeightMap();
    // ns.ready(this.init.bind(this));
    // Somehow elements' height is not gauranteed to be correct on dom ready
    // Nasty little hack to make sure it works
    // setTimeout(this.init.bind(this), 200);
    this._handlers = {};
    document.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('hashchange', this.onHashChange.bind(this));

    this.el.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.el.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.el.addEventListener('touchend', this.onTouchEnd.bind(this));
    this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.el.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.el.addEventListener('mouseup', this.onMouseUp.bind(this));
    if (this.opts.enablePageKeyNavigation) {
      var source;
      switch(this.opts.keyEventSource) {
      case 'window':
        source = window;
        break;
      case 'wrapper':
        source = this.el;
        break;
      default:
        source = window;
        console.warn('keyEventSource should be either "window" or "wrapper", not "' + this.opts.keyEventSource + '"');
      }
      source.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    this.init();
  };


  FancyScroller.prototype.on = function(evt, handler) {
    this.console.log('On ' + evt + ', do ' + handler);
    if (!this._handlers[evt]) this._handlers[evt] = [];
    this._handlers[evt].push(handler);
  };

  FancyScroller.prototype.off = function(evt, handler) {
    this.console.log('Off ' + evt + ', do ' + handler);
    if (!this._handlers[evt]) return;
    var handlers = this._handlers[evt];
    this._handlers[evt] = [];
    if (!handler) return;

    for (var i = 0; i < handlers.length; i++) {
      if (handlers[i] != handler) {
        this._handlers[evt].push(handlers[i]);
      }
    }
  };

  FancyScroller.prototype.trigger = function(evt) {
    this.console.log('Trigger ' + evt);
    if (!this._handlers[evt]) return;
    var handlers = this._handlers[evt];
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < handlers.length; i++) {
      var handler = handlers[i];
      handler.apply(this, args);
    }
  };

  FancyScroller.prototype.init = function() {
    this.scrollTimeout = -1;
    this.currentSectionIndex = 0;
    this.updateHeightMap();
    this.mobileMediaQuery = window.matchMedia("only screen and (max-width: 529px), only screen and (min-width: 530px) and (max-width: 949px)");
    this.isMobile = ns.isMobile();
    this.onHashChange();
    this.trigger('initialized');
  };

  FancyScroller.prototype.onKeyDown = function(e) {
    // Possible Snap positions:
    // * One window height before/after
    // * This section bottom/top
    // * Next section top, prev section bottom
    var i = this.currentSectionIndex,
      topToThisTop = i === 0 ? 0 : this._accumulated[i - 1],
      bottomToThisBottom = this._accumulated[i] - window.innerHeight,
      topToNextTop = this._accumulated[i],
      upOneWindowHeight = this.scrollTop - window.innerHeight,
      downOneWindowHeight = this.scrollTop + window.innerHeight,
      bottomToPrevBottom = i === 0 ? 0 : this._accumulated[i - 1] - window.innerHeight;

    var positionCandidates = [
      topToThisTop,
      bottomToThisBottom,
      topToNextTop,
      upOneWindowHeight,
      downOneWindowHeight,
    ];

    function searchUp(current) {
      var p = -1;
      for (var i = 0; i < positionCandidates.length; i++) {
        var pos = positionCandidates[i];
        if (pos >= current) continue;
        p = Math.max(p, pos);
      }
      return p;
    }

    function searchDown(current) {
      var p = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;
      for (var i = 0; i < positionCandidates.length; i++) {
        var pos = positionCandidates[i];
        if (pos <= current) continue;
        p = Math.min(p, pos);
      }
      return p;
    }

    switch (e.keyCode) {
    case 33:
      // PageUp
      e.preventDefault();
      var upPos = searchUp(this.scrollTop);
      this.snapTo(upPos, true);
      break;
    case 34:
      // PageDown
      e.preventDefault();
      var downPos = searchDown(this.scrollTop);
      this.snapTo(downPos, true);
      break;
    }
  };

  FancyScroller.prototype._preserveTopAfterScroll = function(topElement) {
    function getElementTop(root, el){
      var top = el.offsetTop;
      while (el.offsetParent != root) {
        el = el.offsetParent;
        top += el.offsetTop;
      }
      return top;
    }

    if (topElement) {
      var elementTop = getElementTop(this.inner, topElement);
      this.snapTo(elementTop, !this.isMobile);
    }
  };

  FancyScroller.prototype.onResize = function() {
    // Mulitple resize events will be fired
    // Only process the first one
    if (this.scrollTimeout < 0) {
      var topElement = this.currentTopElement;
      var that = this;

      this.scrollTimeout = setTimeout(function() {
        that._preserveTopAfterScroll(topElement);
        that.scrollTimeout = -1;
      }, 300);
    }
    this.updateHeightMap();
    this.trigger('resized');
  };

  FancyScroller.prototype.onHashChange = function(e) {
    var hashSectionIndex = this._hashToIndex[location.hash.substr(1)];

    this._animation.shouldCancel = true;
    var pos = hashSectionIndex > 0 ? this._accumulated[hashSectionIndex - 1] : 0;
    this.snapTo(pos, !this.isMobile);
  };

  FancyScroller.prototype.startAnimation = function(onTick, targetState, onComplete) {
    this._animation.lastTick = window.performance.now();
    this._animation.animating = true;
    this._animation.shouldCancel = false;
    this._animation.tickCallback = onTick;
    this._animation.targetState = targetState;
    this._animation.completeCallback = onComplete;
    requestAnimationFrame(this.tick.bind(this));
    this.trigger('animation_start');
  };

  FancyScroller.prototype.tick = function(t) {
    if (this._animation.shouldCancel) return this.trigger('animation_cancelled');
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
      if (this._animation.completeCallback) {
        this._animation.completeCallback();
      }
      this._animation.animating = false;
      this.trigger('animation_end');
    }
  };

  FancyScroller.prototype.handleMoveStart = function(pos, updateScrollBar) {
    clearTimeout(this.idleTimer);
    this.indicator.activeAttr.value = true;
    this.el.className += " noselect";
    document.removeEventListener('scroll', this.onScroll.bind(this));
    var now = window.performance.now();
    this._movement.moving = true;
    this._movement.lastPosition = this._movement.startPosition = pos;
    this._movement.lastTime = this._movement.startTime = now;
    this._movement.updateScrollBar = updateScrollBar;

    this._animation.shouldCancel = true;
    this.trigger('force_start', this._movement);
    this.trigger('move_start', this._movement);
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
    this.trigger('force_update', this._movement);
  };

  FancyScroller.prototype.handleMoveEnd = function(pos) {
    this.el.className = this.initialClassName;
    document.addEventListener('scroll', this.onScroll.bind(this));
    this._movement.moving = false;


    this.trigger('force_end', this._movement);
    // Inertial animation
    var that = this;
    // var pV = (this._movement.velocity > 0) ? 1 : -1;
    this.trigger('inertia_start', this._movement);
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
      that._movement.velocity *= that.opts.friction;

      // Cannot go further
      if (that.scrollTop <= -that.opts.maxEndSpringLength ||
        that.scrollTop + window.innerHeight > that.totalHeight + that.opts.maxEndSpringLength * that.opts.overlapFactor) {
        that._movement.velocity = 0;
      }

      // Snap immediately if it can
      if (that._canSnap() && Math.abs(that._movement.velocity) < that.opts.maxSnapableVelocity) {
        that._movement.velocity = 0;
      }

      // Avoid changing sign
      // if (pV * that._movement.velocity < 0) {
      //   that._movement.velocity = 0;
      // }

      return that._movement.velocity;
    }, 0, that.onMovementComplete.bind(that));
  };

  FancyScroller.prototype.onSnapComplete = function() {
    this.indicator.activeAttr.value = false;
    this.trigger('snap_end');
    this.trigger('move_end');
    this._updateHash();
  };

  FancyScroller.prototype._getSnapPosition = function() {
    var snapToPos;

    if (this.scrollTop < 0) {
      snapToPos = 0;
    } else if (this.scrollTop + window.innerHeight > this.totalHeight) {
      snapToPos = this.totalHeight - window.innerHeight;
    } else if (this.opts.snapSectionTop &&
      this.visibleSectionBorderPos > 0 && this.visibleSectionBorderPos < window.innerHeight * 0.3) {
      snapToPos = this._accumulated[this.currentSectionIndex];
    } else if (this.opts.snapSectionBottom &&
      this.visibleSectionBorderPos > window.innerHeight * 0.7 && this.visibleSectionBorderPos < window.innerHeight) {
        snapToPos = this._accumulated[this.currentSectionIndex] - window.innerHeight;
    }
    return snapToPos;
  };

  FancyScroller.prototype._canSnap = function() {
    var snapToPos = this._getSnapPosition();
    // console.log(snapToPos);
    return snapToPos !== null && !isNaN(snapToPos);
  };

  FancyScroller.prototype.onMovementComplete = function() {
    this.trigger('inertia_end', this._movement);
    var snapToPos = this._getSnapPosition();

    this.snapTo(snapToPos, this._movement.updateScrollBar);
  };

  FancyScroller.prototype.snapTo = function(snapToPos, updateScrollBar) {
    var snapTime = this.opts.snapTime;
    this.trigger('snap_start', snapToPos);
    if (snapToPos !== null && !isNaN(snapToPos)) {
      var that = this,
        ti = 0,
        p0 = this.scrollTop,
        delta = snapToPos - p0;
      this.startAnimation(function (dt) {
        ti += dt;
        f = Math.min(1, ti / snapTime);
        var p = p0 + f * f * delta;
        that.scrollTo(p, updateScrollBar);
        return f;
      }, 1, this.onSnapComplete.bind(this));
    } else {
      this.onSnapComplete();
    }
  };

  FancyScroller.prototype.onTouchStart = function(e) {
    e.preventDefault();
    this.handleMoveStart(e.pageY || e.touches[0].pageY || e.targetTouches[0].pageY, false);
  };

  FancyScroller.prototype.onTouchMove = function(e) {
    this.handleMoveUpdate(e.pageY || e.touches[0].pageY || e.targetTouches[0].pageY, false);
  };

  FancyScroller.prototype.onTouchEnd = function(e) {
    this.handleMoveEnd(e.clientY);
  };

  FancyScroller.prototype.onMouseDown = function(e) {
    this.handleMoveStart(e.clientY, true);
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
    this._hashToIndex = {};
    this._hashes = [];
    var acc = 0;
    for (var i = 0; i < this.sections.length; i++) {
      var section = this.sections[i];
      var height = section.clientHeight || section.offsetHeight;
      var hash = section.getAttribute('name') || this.opts.hashPrefix + i;
      section.style.top = acc + 'px';
      this._hashToIndex[hash] = i;
      this._hashes.push(hash);
      this._heights.push(height);
      acc += height;
      this._accumulated.push(acc);
    }
    this.totalHeight = acc;
    this.strecher.style.height = acc + "px";
    this.indicator.style.height = window.innerHeight / this.totalHeight * window.innerHeight + 'px';
  };

  FancyScroller.prototype._updateHash = function () {
      var hash = '#' + this._hashes[this.currentSectionIndex];
      if (location.hash !== hash) {
        history.pushState(null, null, hash);
      }
      this.trigger('hash_update', hash);
  };

  FancyScroller.prototype.scrollTo = function(scrollTop, updateScrollBar) {
    function setTransform(el, value) {
      var style = el.style;
      style.transform = style['-webkit-transform'] = value;
    }

    this.topOvershoot = this.bottomOvershoot = false;

    if (scrollTop < -this.opts.maxEndSpringLength) {
      scrollTop = -this.opts.maxEndSpringLength;
      this.topOvershoot = true;
    } else if (scrollTop + window.innerHeight > this.totalHeight + this.opts.maxEndSpringLength) {
      scrollTop = this.totalHeight - window.innerHeight + this.opts.maxEndSpringLength;
      this.bottomOvershoot = true;
    }
    var i;
    for (i = 0; i < this.sections.length; i++) {
      if (scrollTop < this._accumulated[i]) break;
    }


    // TODO: rename to upperSectionVisibleHeight
    this.visibleSectionBorderPos = scrollTop < 0 ? -scrollTop : this._accumulated[i] - scrollTop;
    this.sectionRemaining = this.visibleSectionBorderPos / this._heights[i];

    if (this.opts.autoSetHash && this.currentSectionIndex != i && !this._animation.animating) {
      // Changed
      this._updateHash();

    }

    // Current secion is always the upper one
    if (i != this.currentSectionIndex) {
      this.trigger('section_changing', i);
      this.currentSectionIndex = i;
      this.trigger('section_changed', i);
    }

    var currentSection = this.sections[i],
      nextSection = this.sections[i + 1], currentTopElement = currentSection;

    var topElementCandidates = [currentSection];

    function pushChildren(el) {
      for (var _k = 0; _k < el.children.length; _k++) {
        topElementCandidates.push(el.children[_k]);
      }
    }
    pushChildren(currentSection);
    if (nextSection) {
      topElementCandidates.push(nextSection);
      pushChildren(nextSection);
    }
    // Find first visible children for perserving scroll top when resizing
    var k = 1, lastChildTop = currentTopElement.getBoundingClientRect().top;
    while (lastChildTop < 0 && k < topElementCandidates.length) {
      var child = topElementCandidates[k];
      childTop = child.getBoundingClientRect().top;
      currentTopElement = child;
      if (childTop >= 0) {
        break;
      }

      lastChildTop = childTop;
      k++;
    }

    this.currentTopElement = currentTopElement;

    setTransform(this.inner, "translateY(" + (-scrollTop) + "px)");
    if (scrollTop + window.innerHeight > this._accumulated[i]) {
      var delta = this._accumulated[i] - scrollTop;
      var f = delta / window.innerHeight;
      setTransform(currentSection, "translateY(" + (1- f) * this.opts.overlapFactor * window.innerHeight + "px)");
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

    this.indicator.style.top = scrollTop / this.totalHeight * window.innerHeight + 'px';
    this.scrollTop = scrollTop;


    if (updateScrollBar) {
      document.documentElement.scrollTop = document.body.scrollTop = scrollTop;
    }
    this.trigger('scrolled', {
      scrollTop: scrollTop,
      sectionRemaining: this.sectionRemaining
    });
  };

  FancyScroller.prototype.doScroll = function() {
    clearTimeout(this.idleTimer);
    if (this._animation.animating) return;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    this.scrollTo(scrollTop);

    var that = this;
    this.idleTimer = setTimeout(function () {
      var snapToPos = that._getSnapPosition();

      that.snapTo(snapToPos, true);
    }, this.opts.idleTimeout);
  };

  FancyScroller.prototype.onScroll = function (e) {
    this.doScroll();
  };

  ns.FancyScroller = FancyScroller;
})(window, document.querySelector.bind(document));
