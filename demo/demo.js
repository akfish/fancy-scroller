(function (ns, $) {

  function defaults() {
    var o = {};
    for (var i = 0; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        o[key] = arguments[i][key];
      }
    }
    return o;
  }

  var OPTS = {
    nav_min_opacity: 0.1,
    nav_max_opacity: 0.7,
    nav_hover_opacity: 0.9
  };

  function D(opts) {
    this.opts = defaults(OPTS, opts);
    this.scroller = new FancyScroller(document.body, this.opts);
    this.nav = $('nav');

    this.scroller.on('scrolled', this.onScroll.bind(this));

    this.nav.addEventListener('mouseover', this.onNavMouseOver.bind(this));
    this.nav.addEventListener('mouseout', this.onNavMouseOut.bind(this));
  }

  D.prototype._getNavOpacity = function () {
    var min_opacity = this.opts.nav_min_opacity,
      max_opacity = this.opts.nav_max_opacity;
    var o = - Math.cos(this.scroller.sectionRemaining * 2 * Math.PI) / 2 + 0.5;
    o *= max_opacity - min_opacity;
    o += min_opacity;
    return o;
  };

  D.prototype.onScroll = function (m) {
    if (!this.nav.hovering) {
      this.nav.style.opacity = this._getNavOpacity();
    }
  };

  D.prototype.onNavMouseOver = function (e) {
    this.nav.hovering = true;
    this.nav.style.opacity = this.opts.nav_hover_opacity;
  };

  D.prototype.onNavMouseOut = function (e) {
    this.nav.hovering = false;
    this.nav.style.opacity = this._getNavOpacity();
  };
  ns.app = new D(ns.opts);
})(window.Demo = window.Demo || {}, document.querySelector.bind(document));
