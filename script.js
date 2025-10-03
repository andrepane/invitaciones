const form = document.getElementById('rsvp-form');
const confirmationMessage = document.getElementById('confirmation-message');
const attendanceInput = document.getElementById('attendance');
const submitButtons = form ? Array.from(form.querySelectorAll('button[type="submit"]')) : [];
const formControls = form ? Array.from(form.querySelectorAll('input, button')) : [];
const RSVP_STORAGE_KEY = 'rsvp:andrea-boda';

const database = window.DB;
const { ref, push } = window.firebaseRTDB || {};

let formLocked = false;

function toggleControlsDisabled(disabled) {
  if (!form) return;
  formControls.forEach((control) => {
    if (control.type === 'hidden') return;
    control.disabled = disabled;
  });
  form.classList.toggle('is-disabled', disabled);
}

function setSubmittingState(isSubmitting) {
  if (!form) return;
  submitButtons.forEach((button) => {
    button.disabled = isSubmitting || formLocked;
    button.classList.toggle('is-loading', isSubmitting);
  });
  form.querySelectorAll('input').forEach((input) => {
    if (input.type === 'hidden') return;
    input.disabled = isSubmitting || formLocked;
  });
}

function showMessage(message) {
  if (!confirmationMessage) return;
  confirmationMessage.textContent = message;
}

function lockFormWithMessage(message) {
  formLocked = true;
  toggleControlsDisabled(true);
  if (message) {
    showMessage(message);
  }
}

function validateForm(name, guestsValue) {
  if (!name) {
    return 'Necesitamos tu nombre para confirmar.';
  }

  const guestsNumber = Number(guestsValue);
  if (!Number.isFinite(guestsNumber) || guestsNumber < 1) {
    return 'Indica cuántas personas venís (mínimo 1).';
  }

  return null;
}

if (form) {
  if (!database || !ref || !push) {
    console.error('Firebase RTDB no está disponible.');
  }

  const storedResponse = window.localStorage.getItem(RSVP_STORAGE_KEY);
  if (storedResponse) {
    lockFormWithMessage('Ya tenemos tu respuesta registrada. ¡Gracias!');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (formLocked) {
      return;
    }

    const submitter = event.submitter;
    const response = submitter?.dataset.response || '';
    if (!response) {
      showMessage('Selecciona una opción para confirmar.');
      return;
    }
    const attending = response === 'Sí';
    const name = form.name.value.trim();
    const guestsValue = form.guests.value.trim();

    if (attendanceInput) {
      attendanceInput.value = response;
    }

    const validationError = validateForm(name, guestsValue);
    if (validationError) {
      showMessage(validationError);
      return;
    }

    if (!database || !ref || !push) {
      showMessage('No se pudo conectar con el servicio. Inténtalo más tarde.');
      return;
    }

    setSubmittingState(true);
    showMessage('Guardando tu respuesta...');

    const guestsNumber = Number(guestsValue);

    try {
      await push(ref(database, '/rooms/andrea-boda/rsvp_submissions'), {
        name,
        guests: guestsNumber,
        attending,
        message: '',
        createdAt: Date.now(),
        source: 'invite'
      });

      const thankYouMessage = attending
        ? '¡Gracias por confirmar!'
        : 'Una pena, te echaremos de menos.';

      lockFormWithMessage(thankYouMessage);
      window.localStorage.setItem(RSVP_STORAGE_KEY, 'done');
    } catch (error) {
      console.error(error);
      setSubmittingState(false);
      showMessage('No hemos podido guardar tu respuesta. Por favor, inténtalo de nuevo dentro de un momento.');
    }
  });
}

/*
{
  "rules": {
    "rooms": {
      "$room": {
        "rsvp_submissions": { ".read": false, ".write": true }
      }
    }
  }
}
*/
