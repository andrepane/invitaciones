import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getDatabase, ref, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

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
const attendanceInput = document.getElementById('attendance');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  const response = submitter?.dataset.response || '';
  const name = form.name.value.trim();
  const guests = form.guests.value.trim();

  attendanceInput.value = response;

  if (!name || !guests || !response) {
    confirmationMessage.textContent = 'Completa el formulario antes de enviarlo.';
    confirmationMessage.classList.add('visible');
    confirmationMessage.style.color = '#c25555';
    return;
  }

  try {
    const rsvpListRef = ref(database, 'rsvps');
    await push(rsvpListRef, {
      name,
      attendance: response,
      guests: Number(guests),
      timestamp: serverTimestamp()
    });

    if (response === 'Sí') {
      confirmationMessage.textContent = 'Anotado. Te esperamos.';
      confirmationMessage.style.color = 'var(--color-accent)';
    } else {
      confirmationMessage.textContent = 'Gracias por avisar. Tomamos nota.';
      confirmationMessage.style.color = 'var(--color-accent-alt)';
    }

    confirmationMessage.classList.add('visible');
    form.reset();
    attendanceInput.value = '';
  } catch (error) {
    console.error(error);
    confirmationMessage.textContent = 'No se pudo guardar tu respuesta. Intenta de nuevo en un momento.';
    confirmationMessage.classList.add('visible');
    confirmationMessage.style.color = '#c25555';
  }
});
