const USE_GSAP = false; // Cambia a true para activar la opción B con GSAP

function initEnvelope() {
  const envelope = document.getElementById('envelope');
  const hero = document.getElementById('hero');
  if (!envelope || !hero) return;

  const body = envelope.querySelector('.envelope__body');
  const flap = envelope.querySelector('.envelope__flap');
  const letter = envelope.querySelector('.envelope__letter');
  const enterBtn = document.getElementById('enterBtn');
  const status = document.getElementById('a11yStatus');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerFine = window.matchMedia('(pointer: fine)');

  let isAnimating = false;
  let parallaxFrame = null;
  let parallaxReady = false;
  let parallaxActive = false;
  let idleTimer = null;

  const setState = (state) => {
    if (state) {
      envelope.setAttribute('data-state', state);
    }
  };

  const announceOpen = () => {
    if (status) {
      status.textContent = 'Invitación abierta';
    }
  };

  const resetTilt = () => {
    if (!body) return;
    body.style.setProperty('--tilt-x', '0deg');
    body.style.setProperty('--tilt-y', '0deg');
  };

  const enableParallaxAfterIdle = () => {
    if (!pointerFine.matches || prefersReducedMotion.matches) return;
    if (idleTimer) window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      parallaxReady = true;
      if (envelope.dataset.state === 'open') {
        parallaxActive = true;
      }
    }, 600);
  };

  const disableParallax = () => {
    parallaxActive = false;
    parallaxReady = false;
    resetTilt();
    if (idleTimer) window.clearTimeout(idleTimer);
  };

  const handleParallax = (event) => {
    if (!body || !parallaxActive || !parallaxReady || isAnimating) return;
    const rect = envelope.getBoundingClientRect();
    const clamp = (value) => Math.max(0, Math.min(1, value));
    const relativeX = clamp((event.clientX - rect.left) / rect.width);
    const relativeY = clamp((event.clientY - rect.top) / rect.height);
    const maxTilt = 4;
    const tiltY = (relativeX - 0.5) * maxTilt * 2;
    const tiltX = (0.5 - relativeY) * maxTilt * 2;

    if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
    parallaxFrame = requestAnimationFrame(() => {
      body.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      body.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    });
  };

  const handlePointerLeave = () => {
    if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
    parallaxFrame = requestAnimationFrame(() => {
      resetTilt();
    });
  };

  const finalizeOpen = ({ announce = true } = {}) => {
    isAnimating = false;
    setState('open');
    if (enterBtn) {
      enterBtn.hidden = false;
      enterBtn.removeAttribute('hidden');
      enterBtn.setAttribute('aria-hidden', 'false');
      if (document.activeElement === envelope) {
        enterBtn.focus({ preventScroll: true });
      }
    }
    if (announce) announceOpen();
    enableParallaxAfterIdle();
  };

  const openWithWAAPI = () => {
    if (!flap || !letter) {
      finalizeOpen();
      return;
    }

    const flapAnimation = flap.animate(
      [
        { transform: 'rotateX(0deg)' },
        { transform: 'rotateX(-130deg)' }
      ],
      {
        duration: 820,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }
    );

    const letterAnimation = letter.animate(
      [
        { transform: 'translateY(18%)' },
        { transform: 'translateY(-4%)', offset: 0.78 },
        { transform: 'translateY(0%)' }
      ],
      {
        duration: 680,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }
    );

    Promise.all([flapAnimation.finished, letterAnimation.finished])
      .then(() => {
        flapAnimation.cancel();
        letterAnimation.cancel();
        flap.style.transform = 'rotateX(-128deg)';
        letter.style.transform = 'translateY(-2%)';
        finalizeOpen();
      })
      .catch(() => {
        flap.style.transform = 'rotateX(-128deg)';
        letter.style.transform = 'translateY(-2%)';
        finalizeOpen();
      });
  };

  const openWithGSAP = () => {
    if (!window.gsap || !flap || !letter) {
      openWithWAAPI();
      return;
    }

    const tl = window.gsap.timeline({
      defaults: { ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      onComplete: () => {
        window.gsap.set(flap, { rotateX: -128 });
        window.gsap.set(letter, { yPercent: -2 });
        finalizeOpen();
      }
    });

    tl.to(flap, {
      duration: 0.82,
      rotateX: -130,
      transformOrigin: 'top center'
    })
      .fromTo(
        letter,
        { yPercent: 18 },
        { yPercent: 0, duration: 0.62 },
        0.02
      )
      .to(letter, { yPercent: -3, duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.out' }, 0.62);
  };

  const openEnvelope = () => {
    const state = envelope.getAttribute('data-state');
    if (state !== 'closed' || isAnimating) return;

    if (prefersReducedMotion.matches) {
      finalizeOpen({ announce: true });
      return;
    }

    isAnimating = true;
    setState('opening');
    if (enterBtn) {
      enterBtn.setAttribute('aria-hidden', 'true');
    }
    disableParallax();

    if (USE_GSAP) {
      openWithGSAP();
    } else {
      openWithWAAPI();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEnvelope();
    }
  };

  const prepareReducedMotion = () => {
    setState('open');
    envelope.setAttribute('aria-disabled', 'false');
    if (!envelope.hasAttribute('tabindex')) {
      envelope.setAttribute('tabindex', '0');
    }
    if (enterBtn) {
      enterBtn.hidden = false;
      enterBtn.removeAttribute('hidden');
      enterBtn.setAttribute('aria-hidden', 'false');
      if (document.activeElement === envelope) {
        enterBtn.focus({ preventScroll: true });
      }
    }
    announceOpen();
    resetTilt();
  };

  const handleEnter = (event) => {
    event.stopPropagation();
    disableParallax();
    setState('disabled');
    envelope.setAttribute('aria-disabled', 'true');
    envelope.setAttribute('tabindex', '-1');
    if (enterBtn) {
      enterBtn.setAttribute('disabled', 'disabled');
    }
    const targetSection = document.getElementById('inicio');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.hash = '#inicio';
    }
  };

  const setup = () => {
    envelope.setAttribute('aria-disabled', 'false');

    if (prefersReducedMotion.matches) {
      prepareReducedMotion();
    }

    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keydown', handleKeyDown);

    if (enterBtn) {
      enterBtn.addEventListener('click', handleEnter);
    }

    if (pointerFine.matches && !prefersReducedMotion.matches) {
      hero.addEventListener('mousemove', handleParallax);
      hero.addEventListener('mouseleave', handlePointerLeave);
      hero.addEventListener('mouseenter', enableParallaxAfterIdle);
    }

    enableParallaxAfterIdle();
  };

  prefersReducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      prepareReducedMotion();
    } else if (envelope.getAttribute('data-state') === 'open') {
      envelope.setAttribute('aria-disabled', 'false');
      disableParallax();
      enableParallaxAfterIdle();
    }
  });

  setup();
}

document.addEventListener('DOMContentLoaded', initEnvelope);
