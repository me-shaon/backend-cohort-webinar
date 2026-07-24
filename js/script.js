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
    this.dots     = document.querySelector('.step-dots');
    this.current  = 0;
    this.total    = this.slides.length;
    this.steps    = [];   // groups of elements, revealed one group per advance
    this.step     = 0;    // how many groups are currently revealed
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

  // Collect .step elements of a slide into ordered groups.
  // Elements sharing a data-step value form one group and reveal together.
  collectSteps(slide) {
    const groups = new Map();
    [...slide.querySelectorAll('.step')].forEach((el, i) => {
      const key = el.dataset.step || `auto-${i}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });
    return [...groups.values()];
  }

  applySteps() {
    this.steps.forEach((group, g) => {
      const on = g < this.step;
      group.forEach((el, i) => {
        el.style.transitionDelay = on ? `${i * 70}ms` : '0ms';
        el.classList.toggle('is-in', on);
      });
    });
  }

  // revealAll: entering a slide backwards shows everything already "spoken"
  show(index, revealAll = false) {
    if (index < 0 || index >= this.total) return;
    this.slides[this.current].classList.remove('is-active');
    this.current = index;
    const slide = this.slides[index];
    this.steps = this.collectSteps(slide);
    this.step = revealAll ? this.steps.length : 0;
    this.applySteps();
    slide.classList.add('is-active');
    this.updateUI();
  }

  next() {
    if (this.step < this.steps.length) {
      this.step++;
      this.applySteps();
      this.updateUI();
      return;
    }
    this.show(this.current + 1);
  }

  prev() {
    if (this.step > 0) {
      this.step--;
      this.applySteps();
      this.updateUI();
      return;
    }
    this.show(this.current - 1, true);
  }

  // Skip the remaining steps and jump straight to the next/previous slide
  nextSlide() { this.show(this.current + 1); }
  prevSlide() { this.show(this.current - 1, true); }

  updateUI() {
    const count = this.steps.length;
    const frac  = count ? this.step / count : 1;

    this.counter.textContent = `${this.current + 1} / ${this.total}`;
    this.fill.style.width = `${((this.current + frac) / this.total) * 100}%`;
    this.prevBtn.disabled = this.current === 0 && this.step === 0;
    this.nextBtn.disabled = this.current === this.total - 1 && this.step === count;

    this.dots.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = i < this.step ? 'step-dot is-in' : 'step-dot';
      this.dots.appendChild(dot);
    }
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
        // Up/Down jump whole slides, ignoring any remaining steps
        case 'ArrowDown':
          e.preventDefault(); this.nextSlide(); break;
        case 'ArrowUp':
          e.preventDefault(); this.prevSlide(); break;
        case 'Home':  this.show(0); break;
        case 'End':   this.show(this.total - 1, true); break;
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
