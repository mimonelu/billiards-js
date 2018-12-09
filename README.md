# Billiards.js

Pure JavaScript library to play animation like a billiards with canvas.  
Demo is [here](https://mimonelu.github.io/billiards-js/).

## Usage

* Simplest case

```
<script src="./billiards.min.js"></script>
<script>
new Billiards({});
</script>
```

* Specify canvas node

```
<canvas class="canvas"></canvas>
<script>
new Billiards({
  'canvas': document.querySelector('.canvas')
});
</script>
```

* Specify parent node (and canvas node will be automatically created)

```
<div class="canvas-container"></div>
<script>
new Billiards({
  'parent': document.querySelector('.canvas-container')
});
</script>
```

* Specify canvas size and `fillStyle`

```
new Billiards({
  'width': '640',
  'height': '480',
  'fillStyle': 'rgba(0, 0, 0, 0.25)'
});
```

* Specify to automatically resize canvas size to window size

```
new Billiards({
  'fitToWindow': true
});
```

* Specify settings of sprites

```
new Billiards({
  'number': 8,
  'r': [ 0.1, 0.2 ],
  'color': {
    'r': [ 192, 255 ],
    'g': [ 128, 255 ],
    'b': [ 0, 255 ],
    'a': [ 1.0, 1.0 ]
  },
  'composite': 'lighter',
  'velocity': [ 1.0, 2.0 ]
});
```

* Specify that sprites don't rebounds from other sprites

```
new Billiards({
  'rebound': false
});
```

* Specify that sprites don't collides from other sprites

```
new Billiards({
  'collide': false
});
```

* Manually update animation

```
const billiards = new Billiards({
  'autoPlay': false
});
const update = () => {
  requestAnimationFrame(() => {
    billiards.update();
    update();
  });
};
```

* Manually render sprite

```
new Billiards({
  'render': (billiards, sprite) => {
    billiards.context.fillStyle = sprite.color;
    billiards._.composite && (billiards.context.globalCompositeOperation = billiards._.composite);
    billiards.context.beginPath();
    billiards.context.arc(sprite.x, sprite.y, sprite.r, 0, Math.PI * 2);
    billiards.context.closePath();
    billiards.context.fill();
  }
});
```

## Option description

```
const billiards = new Billiards({
  'active': Boolean,        // Animation activation. Use stop() and start().
  'autoPlay': Boolean,      // billiards.js will use own requestAnimationFrame().
  'canvas': HTMLElement,    // Canvas node.
  'parent': HTMLElement,    // Parent node.
  'width': String,          // Canvas width.
  'height': String,         // Canvas height.
  'fitToParentW': Boolean,  // Canvas width will be automatically resize to parent node width.
  'fitToParentH': Boolean,  // Canvas height will be automatically resize to parent node height.
  'fitToWindow': Boolean,   // Canvas will be automatically resize to window size.
  'fillStyle': String,      // fillStyle property value of canvas.
  'number': Number,         // Sprites number.
  'x': Array,               // Min/Max x coordinate of sprite. This is ratio to canvas width.
  'y': Array,               // Min/Max y coordinate of sprite. This is ratio to canvas height.
  'r': Array,               // Min/Max sprite radius. This is ratio to canvas (width + height) / 2.
  'color': Object {         // fillStyle property value of sprite.
    'r': Array,             // Min/Max red color.
    'g': Array,             // Min/Max Green color.
    'b': Array,             // Min/Max blue color.
    'a': Array              // Min/Max alpha.
  },
  'composite': String,      // globalCompositeOperation property value of sprite.
  'velocity': Array,        // Min/Max speed of sprite.
  'collide': Boolean,       // Whether sprite will be collide from others.
  'rebound': Boolean,       // Whether sprite will be rebound from others.
  'margin': Number,         // Sprite margin.
  'render': Function        // Custom render function.
});
```

## Default option values

```
const billiards = new Billiards({
  'active': true,
  'autoPlay': true,         // Billiards.update() will be automatically called in requestAnimationFrame().
  'canvas': null,           // Canvas node will be automatically created.
  'parent': document.body,
  'width': null,            // setAttribute() is not called.
  'height': null,           // setAttribute() is not called.
  'fitToWindow': false,
  'fillStyle': null,        // clearRect() will be automatically called.
  'number': 3,
  'x': [ 0, 1.0 ],
  'y': [ 0, 1.0 ],
  'r': [ 0.1, 0.4 ],
  'color': {
    'r': [ 0, 255 ],
    'g': [ 0, 255 ],
    'b': [ 0, 255 ],
    'a': [ 0, 1.0 ]
  },
  'composite': null,
  'velocity': [ 0.1, 1.0 ],
  'collide': true,
  'rebound': true,
  'margin': 0,
  'render': null            // Billiards.render() will be automatically called.
});
```

## Instance methods

* `stop()` Stop animation.
* `start()` Start animation.
* `reset()` Reset values of sprites.
