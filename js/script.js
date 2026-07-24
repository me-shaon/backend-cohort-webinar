// =============================================
//  Presentation Controller
// =============================================

class Presentation {
  constructor() {
    this.deck     = document.querySelector('.deck');
    this.slides   = [...document.querySelectorAll('.slide')];
    this.fill     = document.querySelector('.progress-fill');
    this.counter  = document.querySelector('.counter');
    this.prevBtn  = document.querySelector('.nav-prev');
    this.nextBtn  = document.querySelector('.nav-next');
    this.current  = 0;
    this.total    = this.slides.length;
  }

  init() {
    this.show(0);
    this.fit();
    this.bind();
    window.addEventListener('resize', () => this.fit());
  }

  // Scale the 1280×720 canvas to fit any viewport
  fit() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    this.deck.style.transform = `scale(${s})`;
  }

  show(index) {
    if (index < 0 || index >= this.total) return;
    this.slides[this.current].classList.remove('is-active');
    this.current = index;
    this.slides[this.current].classList.add('is-active');
    this.updateUI();
  }

  next() { this.show(this.current + 1); }
  prev() { this.show(this.current - 1); }

  updateUI() {
    this.counter.textContent = `${this.current + 1} / ${this.total}`;
    this.fill.style.width = `${((this.current + 1) / this.total) * 100}%`;
    this.prevBtn.disabled = this.current === 0;
    this.nextBtn.disabled = this.current === this.total - 1;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  bind() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault(); this.next(); break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault(); this.prev(); break;
        case 'Home':  this.show(0); break;
        case 'End':   this.show(this.total - 1); break;
        case 'f':
        case 'F':     this.toggleFullscreen(); break;
      }
    });

    // Nav buttons
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());

    // Click deck halves to navigate (left third = prev, right two-thirds = next)
    this.deck.addEventListener('click', (e) => {
      if (e.target.closest('.deck-nav')) return;
      const x = e.offsetX;
      if (x < this.deck.offsetWidth * 0.35) this.prev();
      else this.next();
    });

    // Swipe support (trackpads / touch)
    let touchStartX = 0;
    this.deck.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.deck.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 60) (dx > 0 ? this.prev() : this.next());
    }, { passive: true });

    // Wheel navigation (debounced)
    let wheelLock = false;
    this.deck.addEventListener('wheel', (e) => {
      if (wheelLock) return;
      if (Math.abs(e.deltaY) < 30) return;
      wheelLock = true;
      (e.deltaY > 0 ? this.next() : this.prev());
      setTimeout(() => { wheelLock = false; }, 700);
    }, { passive: true });
  }
}

document.addEventListener('DOMContentLoaded', () => new Presentation().init());
