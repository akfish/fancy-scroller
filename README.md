# Fancy Scroller

A fancy CSS smooth scroller with layered effect

## Features

* CSS smooth scroll
* Touch, mouse (drag & wheel) and keyboard interaction
* Inertia scrolling
* Spring-back on both ends
* Snap to section borders
* Scroll bar support (native on desktop, simulated indicator on mobile)
* Hash tag navigation

## Usage

- Clone this project

```bash
$ git clone https://github.com/akfish/fancy-scroller.git
```

- Include the script in your HTML

```html
<!DOCTYPE html>
<head>
  <!-- Recommanded: disable native scroll on mobile devices -->
  <meta name="viewport" content="width=device-width,user-scalable=no">
  <link rel="stylesheet" href="path/to/dist/style.min.css">
</head>
<body>
  <div id="#container">
    <!-- .section will be created as pages -->
    <div class="section">Page 1</div>
    <div class="section">Page 2</div>
    <div class="section">Page 3</div>
    <!-- ... -->
  </div>
  <script src="path/to/dist/fancy-scroll.min.js" />
</body>
```

- Style your container and make sure it has well-defined position and size

```css
#container {
  position: absolute;
  width: 100%;
  height: 100%;
}
```

- Create fancy scroller instance

```js
var opts = {
  hashPrefix: 'foo-',
  snapTime: 500
};
var contaienr = document.getElementById('container'),
  scroller = new FancyScroller(container, opts);
```

## Options

Field | Type | Description | Default
----- |------|-------------|---------
friction | float | Friction factor | `0.9`
maxEndSpringLength | float (in px) | Extra space on top (= value) and bottom (= value * overlapFactor) when scrolling with mouse/touch screen. Once released, it will snap back like a spring | `64`
overlapFactor | float | Specify the maximum overlapping ratio of adjacent sections when scrolling | `0.6`
snapTime | float (in ms) | The duration of snap animation | `300`
snapSectionTop | bool | If `true`, snap to current section's top when visible section border sits within the top 1/3 screen space. Only works when scrolled by touch or mouse. | `true`
snapSectionBottom | bool | If `true`, snap to current section's bottom when visible section border sits within the bottom 1/3 screen space. Only works when scrolled by touch or mouse. | `true`
showMobileScrollIndicator | bool | Wheter to show scroll indicator or not when running on mobile devices | `true`
hashPrefix | string | Prefix for section hashtags | `"section-"`
autoSetHash | bool | If `true`, url's hashtag will be changed to current section's when scrolled | `false`
debug | bool | Enable/disable debug mode (loads un-minified stylesheet) | `false`
animationEpsilon | float | A small number specifing the maximum margin of error when animating to a target state. Smaller number means more accurate animation (but longer convergence time) | `0.01`

## Events

### Event API

Function | Description
---- | ------------------
`on(name, handler)` | Attach event handler to an event
`off(name[, handler])` | Detach one or all handlers for an event

### Available Events

#### Lifecycle Events

Name | Description
----- | -----------
`init` | Triggered once constructor has finished execution

#### Movement Events

Name | Description
---- | ------------------
`force_start` | Fired when a touch or mouse drag begins
`move_start` | Fired immediately after `force_start`
`force_update` | Fired when touch or mouse drag position changes
`force_end` | Fired when the touch or mouse drag finishes
`inertia_start` | Fired immediately after `force_end`
`inertia_end` | Fired when inertia scrolling stops
`snap_start` | Fired immediately after `inertia_end`
`snap_end` | Fired when snap stops
`move_end` | Fired when all movement stops

Note that only mouse or touch events have force, hence only they can trigger movement events.

Current movement states will be passed to all movement event handlers.

#### Scroll Events

Name | Description
---- | ------------------
`scrolled` | Fired when scroll postions changes

#### Navigation Events

Name | Description
---- | ------------------
`section_changed` | Triggered when upper section has changed
`hash_update` | Triggered when url hash has been changed due to scroll

#### Animation Events

Name | Description
---- | ------------------
`animation_start` | Animation started
`animation_cancelled` | Animation ended
`animation_end` | Animation cancelled

## An Inside Look

When constructed, a scroller instance creates the following DOM inside the container:

```html
<div id="#container">
  <!-- remaining children -->
  <div class="strecher">
  </div>
  <div class="wrapper">
    <div class="inner">
      <!-- Children that matches .section selector -->  
    </div>
  </div>
  <div class="mobile-scroll-indicator">
  </div>
</div>
```

It moves all children matching `.section` selector into `#container>.wrapper>.inner`, calculates theirs height and positions them absolutely.

The `.strecher`'s height is then set to be children's total height, which will strech the container and create desired scroll bar behavior in desktop browsers.

When scrolled, `transform: translateY(offset)` will be caculated and updated for `.wrapper` (for over-all scrolling) and `.section`s (for relative motion).
Animations are done with `requesetAnimationFrame`.

By default, Fancy scroller uses [style.less](/less/style.less), which contains bare-minimum style configurations for it to work. You should include it in `<head>` tag.  
Normally you should not modify its content, nor overriding any position-related styles mentioned in that file.

## About
