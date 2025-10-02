// Importa los módulos necesarios de Firebase v9
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// TODO: Reemplaza los valores de la configuración con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_PROYECTO.firebaseapp.com',
  databaseURL: 'https://TU_PROYECTO.firebaseio.com',
  projectId: 'TU_PROYECTO',
  storageBucket: 'TU_PROYECTO.appspot.com',
  messagingSenderId: 'NUMERO_EMISOR',
  appId: 'TU_APP_ID'
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const form = document.getElementById('rsvp-form');
const confirmationMessage = document.getElementById('confirmation-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = form.name.value.trim();
  const attendance = form.attendance.value;

  if (!name || !attendance) {
    confirmationMessage.textContent = 'Por favor, completa todos los campos.';
    confirmationMessage.classList.add('visible');
    confirmationMessage.style.color = '#c26565';
    return;
  }

  try {
    const rsvpListRef = ref(database, 'rsvps');
    await push(rsvpListRef, {
      name,
      attendance,
      timestamp: serverTimestamp()
    });

    confirmationMessage.textContent = '¡Gracias por confirmar, nos hace mucha ilusión!';
    confirmationMessage.classList.add('visible');
    confirmationMessage.style.color = 'var(--color-accent)';
    form.reset();
  } catch (error) {
    console.error(error);
    confirmationMessage.textContent = 'Hubo un error al registrar tu respuesta. Intenta nuevamente en unos instantes.';
    confirmationMessage.classList.add('visible');
    confirmationMessage.style.color = '#c26565';
  }
});

// Animaciones suaves al hacer scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1
});

reveals.forEach((element) => observer.observe(element));

// Contador regresivo
const targetDate = new Date('2026-09-05T17:00:00');

function updateCountdown() {
  const now = new Date();
  const difference = targetDate - now;

  if (difference <= 0) {
    document.getElementById('days').textContent = '0';
    document.getElementById('hours').textContent = '0';
    document.getElementById('minutes').textContent = '0';
    document.getElementById('seconds').textContent = '0';
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  document.getElementById('days').textContent = days.toString().padStart(2, '0');
  document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
  document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);
