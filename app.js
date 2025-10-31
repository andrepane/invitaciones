const envelopeButton = document.getElementById('envelopeButton');
const enterButton = document.getElementById('enterButton');
const envelopeScene = document.querySelector('.envelope-scene');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerFineQuery = window.matchMedia('(pointer: fine)');

let isOpen = false;

function addMediaQueryListener(query, handler) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler);
  } else if (typeof query.addListener === 'function') {
    query.addListener(handler);
  }
}

function openEnvelope({ instant = false } = {}) {
  if (isOpen) return;
  isOpen = true;

  if (instant) {
    envelopeButton.classList.add('no-transition');
  }

  envelopeButton.classList.add('is-open');
  envelopeButton.setAttribute('aria-expanded', 'true');
  enterButton.removeAttribute('aria-hidden');
  enterButton.removeAttribute('tabindex');

  if (instant) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        envelopeButton.classList.remove('no-transition');
      });
    });
  }
}

function handleEnvelopeInteraction() {
  openEnvelope();
}

envelopeButton.addEventListener('click', handleEnvelopeInteraction);

envelopeButton.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    openEnvelope();
  }
});

enterButton.addEventListener('click', (event) => {
  const targetId = enterButton.getAttribute('href');
  const target = document.querySelector(targetId);

  if (target) {
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

function resetParallax() {
  envelopeScene.style.setProperty('--tiltX', '0deg');
  envelopeScene.style.setProperty('--tiltY', '0deg');
  envelopeScene.style.setProperty('--shiftX', '0px');
  envelopeScene.style.setProperty('--shiftY', '0px');
}

function handleParallax(event) {
  const rect = envelopeScene.getBoundingClientRect();
  const offsetX = event.clientX - (rect.left + rect.width / 2);
  const offsetY = event.clientY - (rect.top + rect.height / 2);

  const tiltX = (offsetX / (rect.width / 2)) * 6;
  const tiltY = -(offsetY / (rect.height / 2)) * 5;
  const shiftX = (offsetX / (rect.width / 2)) * 10;
  const shiftY = (offsetY / (rect.height / 2)) * 6;

  envelopeScene.style.setProperty('--tiltX', `${tiltX.toFixed(2)}deg`);
  envelopeScene.style.setProperty('--tiltY', `${tiltY.toFixed(2)}deg`);
  envelopeScene.style.setProperty('--shiftX', `${shiftX.toFixed(2)}px`);
  envelopeScene.style.setProperty('--shiftY', `${shiftY.toFixed(2)}px`);
}

function handleReduceMotionChange(event) {
  if (event.matches) {
    openEnvelope({ instant: true });
    resetParallax();
    envelopeScene.removeEventListener('mousemove', handleParallax);
    envelopeScene.removeEventListener('mouseleave', resetParallax);
  } else if (pointerFineQuery.matches) {
    envelopeScene.addEventListener('mousemove', handleParallax);
    envelopeScene.addEventListener('mouseleave', resetParallax);
  }
}

if (pointerFineQuery.matches && !reduceMotionQuery.matches) {
  envelopeScene.addEventListener('mousemove', handleParallax);
  envelopeScene.addEventListener('mouseleave', resetParallax);
}

addMediaQueryListener(reduceMotionQuery, handleReduceMotionChange);

if (reduceMotionQuery.matches) {
  openEnvelope({ instant: true });
  resetParallax();
} else {
  resetParallax();
}

addMediaQueryListener(pointerFineQuery, (event) => {
  if (!reduceMotionQuery.matches) {
    if (event.matches) {
      envelopeScene.addEventListener('mousemove', handleParallax);
      envelopeScene.addEventListener('mouseleave', resetParallax);
    } else {
      envelopeScene.removeEventListener('mousemove', handleParallax);
      envelopeScene.removeEventListener('mouseleave', resetParallax);
      resetParallax();
    }
  }
});

