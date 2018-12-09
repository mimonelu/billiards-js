/**
 * @license billiards.js
 * Copyright (c) 2018 mimonelu
 * http://mimonelu.net/billiards-js/
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
**/

(((root, factory) => {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Billiards = factory();
  }
})(window, () => {

  const Util = {

    frandom (min, max) {
      return Math.random() * (max - min) + min;
    },

    irandom (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    lerp (a, b, t) {
      return (1.0 - t) * a + t * b;
    },

    normalize (vector) {
      const x = vector.x;
      const y = vector.y;
      vector.x = x / (Math.sqrt(x * x + y * y));
      vector.y = y / (Math.sqrt(x * x + y * y));
    }

  };

  class Billiards {

    constructor (_) {
      this._ = _;
      this.active = this._.active !== false;
      this.setupCanvas();
      this.setupSprites();
      this._.autoPlay !== false && this.tick();
    }

    setupCanvas () {
      this.canvas = this._.canvas != null ? this._.canvas : document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this._.width != null && this.canvas.setAttribute('width', this._.width);
      this._.height != null && this.canvas.setAttribute('height', this._.height);
      this.parent = this._.parent || document.body;
      if (this._.fitToParentW || this._.fitToParentH || this._.fitToWindow) {
        this.resize();
        window.addEventListener('resize', () => {
          this.resize();
          this.resizeSprite();
        });
      }
      this._.canvas == null && this.parent.appendChild(this.canvas);
    }

    setupSprites () {
      this.sprites = [];
      for (let i = 0; i < (this._.number != null ? this._.number : 3); i ++) {
        this.sprites[i] = {
          'index': i,
          'x': this.canvas.width * (this._.x != null ? Util.frandom(this._.x[0], this._.x[1]) : Math.random()),
          'y': this.canvas.height * (this._.y != null ? Util.frandom(this._.y[0], this._.y[1]) : Math.random()),
          'r': 0, // Later
          'color': this._.color != null ? `rgba(${Util.irandom(this._.color.r[0], this._.color.r[1])}, ${Util.irandom(this._.color.g[0], this._.color.g[1])}, ${Util.irandom(this._.color.b[0], this._.color.b[1])}, ${Util.frandom(this._.color.a[0], this._.color.a[1])})` : `rgba(${Util.irandom(0, 255)}, ${Util.irandom(0, 255)}, ${Util.irandom(0, 255)}, ${Util.frandom(0, 1.0)})`,
          'vector': {
            'x': Util.frandom(- 1.0, 1.0),
            'y': Util.frandom(- 1.0, 1.0)
          },
          'velocity': this._.velocity != null ? Util.frandom(this._.velocity[0], this._.velocity[1]) : Util.frandom(0.1, 1.0)
        };
        Util.normalize(this.sprites[i].vector);
      }
      this.resizeSprite();
    }

    resize () {
      if (this._.fitToParentW) {
        this.canvas.setAttribute('width', this.parent.clientWidth);
      } else if (this._.fitToWindow) {
        this.canvas.setAttribute('width', window.innerWidth);
      }
      if (this._.fitToParentH) {
        this.canvas.setAttribute('height', this.parent.clientHeight);
      } else if (this._.fitToWindow) {
        this.canvas.setAttribute('height', window.innerHeight);
      }
    }

    resizeSprite () {
      const side = (this.canvas.width + this.canvas.height) / 2;
      for (let i = 0; i < this.sprites.length; i ++) {
        this.sprites[i].r = side * (this._.r != null ? Util.frandom(this._.r[0], this._.r[1]) / 2 : Util.frandom(0.1, 0.4));
      }
    }

    tick () {
      requestAnimationFrame(() => {
        this.update();
        this.tick();
      });
    }

    update () {
      if (this.active) {
        this.updateBackground();
        this.updateSprites();
      }
    }

    updateBackground () {
      if (this._.fillStyle == null) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      } else {
        this.context.fillStyle = this._.fillStyle;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    updateSprites () {
      for (let i = 0; i < this.sprites.length; i ++) {
        this.translateSprite(this.sprites[i], 'x', 'width');
        this.translateSprite(this.sprites[i], 'y', 'height');
        this._.collide !== false && this.collideToOthers(this.sprites[i]);
        this.collideToBounds(this.sprites[i], 'x', 'width');
        this.collideToBounds(this.sprites[i], 'y', 'height');
        this.context.save();
        this._.render != null ? this._.render(this, this.sprites[i]) : this.renderSprite(this.sprites[i]);
        this.context.restore();
      }
    }

    translateSprite (sprite, axis, side) {
      sprite[axis] += sprite.vector[axis] * sprite.velocity;
    }

    collideToOthers (self) {
      for (let i = 0; i < this.sprites.length; i ++) {
        if (self.index !== i) {
          const other = this.sprites[i];
          const angle = Math.atan2(other.x - self.x, other.y - self.y);
          const distance = Math.sqrt((other.x - self.x) * (other.x - self.x) + (other.y - self.y) * (other.y - self.y));
          const diff = distance - (self.r + other.r + (this._.margin || 0))
          if (diff < 0) {
            const selfRatio = other.r / (self.r + other.r);
            const otherRatio = self.r / (self.r + other.r);
            const xAdding = Math.sin(angle) * diff / 2;
            const yAdding = Math.cos(angle) * diff / 2;
            self.x += xAdding * selfRatio;
            self.y += yAdding * selfRatio;
            other.x -= xAdding * otherRatio;
            other.y -= yAdding * otherRatio;
            if (this._.rebound !== false) {
              self.vector.x = Util.lerp(self.vector.x, - Math.sin(angle), selfRatio);
              self.vector.y = Util.lerp(self.vector.y, - Math.cos(angle), selfRatio);
              Util.normalize(self.vector);
              other.vector.x = Util.lerp(other.vector.x, Math.sin(angle), otherRatio);
              other.vector.y = Util.lerp(other.vector.y, Math.cos(angle), otherRatio);
              Util.normalize(other.vector);
            }
          }
        }
      }
    }

    collideToBounds (sprite, axis, side) {
      if (sprite[axis] < sprite.r) {
        sprite[axis] = sprite.r;
        sprite.vector[axis] *= - 1;
      } else if (sprite[axis] > this.canvas[side] - sprite.r) {
        sprite[axis] = this.canvas[side] - sprite.r;
        sprite.vector[axis] *= - 1;
      }
    }

    renderSprite (sprite) {
      this.context.fillStyle = sprite.color;
      this._.composite && (this.context.globalCompositeOperation = this._.composite);
      this.context.beginPath();
      this.context.arc(sprite.x, sprite.y, sprite.r, 0, Math.PI * 2);
      this.context.closePath();
      this.context.fill();
    }

    start () {
      this.active = true;
    }

    stop () {
      this.active = false;
    }

    reset () {
      this.setupSprites();
    }

  }

  return Billiards;

}));
