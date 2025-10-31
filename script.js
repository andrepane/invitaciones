const form = document.getElementById('rsvp-form');
const confirmationMessage = document.getElementById('confirmation-message');
const attendanceInput = document.getElementById('attendance');
const resetButton = document.getElementById('reset-response');
const submitButtons = form ? Array.from(form.querySelectorAll('button[type="submit"]')) : [];
const formControls = form ? Array.from(form.querySelectorAll('input, button')) : [];
const RSVP_STORAGE_KEY = 'rsvp:andrea-boda';
const LANGUAGE_STORAGE_KEY = 'invite:language';

const database = window.DB;
const { ref, push } = window.firebaseRTDB || {};
const languageButtons = document.querySelectorAll('.lang-button[data-language]');

const envelopeOverlay = document.querySelector('[data-envelope-overlay]');
const prefersReducedMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

if (envelopeOverlay) {
  let envelopeOpened = false;

  const openEnvelope = () => {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelopeOverlay.classList.add('is-opening');
    document.body.classList.remove('envelope-locked');
    const dismissDelay = prefersReducedMotion ? 0 : 900;
    const removeDelay = prefersReducedMotion ? 0 : 1600;

    window.setTimeout(() => {
      envelopeOverlay.classList.add('is-dismissed');
      envelopeOverlay.setAttribute('aria-hidden', 'true');
    }, dismissDelay);

    window.setTimeout(() => {
      envelopeOverlay.remove();
    }, removeDelay);
  };

  envelopeOverlay.addEventListener('click', openEnvelope);
  envelopeOverlay.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEnvelope();
    }
  });

  window.setTimeout(() => {
    if (typeof envelopeOverlay.focus === 'function') {
      envelopeOverlay.focus({ preventScroll: true });
    }
  }, prefersReducedMotion ? 0 : 200);
}

const translations = {
  es: {
    'head.title': 'Cintia & Andrea · sí, nos casamos.',
    'nav.ariaLabel': 'Secciones de la invitación',
    'nav.details': 'detalles',
    'nav.agenda': 'agenda',
    'nav.rsvp': 'formulario',
    'language.switchAria': 'Selecciona idioma',
    'hero.date': '5 · septiembre · 2026 · vera, almería',
    'hero.title': 'El anti-Bodorrio',
    'hero.subtitle': 'Cero artificios, todo lujo (y buena comida).',
    'details.title': 'detalles prácticos',
    'details.subtitle': 'todo lo necesario para llegar puntuales (un día antes).',
    'details.when.title': 'cuándo',
    'details.when.body': 'Del 4 al 6 de septiembre de 2026. La ceremonia es el sábado a partir de las 18:00.',
    'details.where.title': 'dónde',
    'details.where.body': 'Cortijo Media Legua · Vera, Almería.',
    'details.where.extra': 'Grandes habitaciones, piscina privada y hasta pista de pádel.',
    'details.what.title': 'qué llevar',
    'details.what.body': 'Bañador, ropa ligera para el día y algo más formal para la noche.',
    'map.ariaLabel': 'Mapa de la localización',
    'map.title': 'Mapa de Cortijo Media Legua',
    'agenda.title': 'agenda del fin de semana',
    'agenda.friday.title': 'viernes',
    'agenda.friday.body': 'Check-in desde las 15:00. Cena en compañía y sobremesa para ponernos al día.',
    'agenda.saturday.title': 'sábado',
    'agenda.saturday.body': 'Mañana entre piscina y preparativos. A las 18:00 pequeña ceremonia en familia. Después cena y música.',
    'agenda.sunday.title': 'domingo',
    'agenda.sunday.body': 'Desayuno tranquilo, despedidas y salida a las 11:00.',
    'form.title': 'asistencia',
    'form.description': '¿vienes? dilo aquí y te guardamos sitio.',
    'form.labels.name': 'nombre',
    'form.labels.guests': 'Número Personas',
    'form.buttons.confirm': 'confirmar asistencia',
    'form.buttons.decline': 'no puedo',
    'form.buttons.reset': 'editar respuesta',
    'footer.text': 'cintia & andrea · 2026 · nos vemos allí.',
    'messages.updateResponse': 'Actualiza tu respuesta y vuelve a enviarla.',
    'messages.nameRequired': 'Necesitamos tu nombre para confirmar.',
    'messages.guestsRequired': 'Indica cuántas personas venís (mínimo 1).',
    'messages.selectOption': 'Selecciona una opción para confirmar.',
    'messages.serviceUnavailable': 'No se pudo conectar con el servicio. Inténtalo más tarde.',
    'messages.saving': 'Guardando tu respuesta...',
    'messages.thankYouYes': '¡Gracias por confirmar!',
    'messages.thankYouNo': 'Una pena, te echaremos de menos.',
    'messages.saveError': 'No hemos podido guardar tu respuesta. Por favor, inténtalo de nuevo dentro de un momento.',
    'messages.responseExists': 'Ya tenemos tu respuesta registrada. ¡Gracias!',
    'messages.firebaseUnavailable': 'Firebase RTDB no está disponible.',
    'envelope.instruction': 'toca o haz clic para abrir',
    'envelope.ariaLabel': 'Abrir invitación',
    'envelope.letter': 'abre la invitación'
  },
  it: {
    'head.title': 'Cintia & Andrea · sì, ci sposiamo.',
    "nav.ariaLabel": "Sezioni dell'invito",
    'nav.details': 'dettagli',
    'nav.agenda': 'programma',
    'nav.rsvp': 'modulo',
    'language.switchAria': 'Seleziona lingua',
    'hero.date': '5 · settembre · 2026 · vera, almería',
    "hero.title": "L'anti-matrimonio",
    'hero.subtitle': 'Zero artifici, tutto lusso (e buon cibo).',
    'details.title': 'dettagli pratici',
    'details.subtitle': 'tutto il necessario per arrivare puntuali (un giorno prima).',
    'details.when.title': 'quando',
    'details.when.body': 'Dal 4 al 6 settembre 2026. La cerimonia sarà sabato dalle 18:00.',
    'details.where.title': 'dove',
    'details.where.body': 'Cortijo Media Legua · Vera, Almería.',
    'details.where.extra': 'Camere spaziose, piscina privata e persino campo da padel.',
    'details.what.title': 'cosa portare',
    'details.what.body': 'Costume da bagno, abiti leggeri per il giorno e qualcosa di più elegante per la sera.',
    'map.ariaLabel': 'Mappa della posizione',
    'map.title': 'Mappa del Cortijo Media Legua',
    'agenda.title': 'programma del fine settimana',
    "agenda.friday.title": "venerdì",
    'agenda.friday.body': 'Check-in dalle 15:00. Cena insieme e chiacchiere per aggiornarci.',
    'agenda.saturday.title': 'sabato',
    'agenda.saturday.body': 'Mattina tra piscina e preparativi. Alle 18:00 piccola cerimonia in famiglia. Poi cena e musica.',
    'agenda.sunday.title': 'domenica',
    'agenda.sunday.body': 'Colazione tranquilla, saluti e partenza alle 11:00.',
    'form.title': 'presenza',
    'form.description': 'Ci sarai? Diccelo qui e ti riserviamo un posto.',
    'form.labels.name': 'nome',
    'form.labels.guests': 'Numero persone',
    'form.buttons.confirm': 'conferma partecipazione',
    'form.buttons.decline': 'non posso',
    'form.buttons.reset': 'modifica risposta',
    'footer.text': 'cintia & andrea · 2026 · ci vediamo lì.',
    'messages.updateResponse': 'Aggiorna la tua risposta e inviala di nuovo.',
    'messages.nameRequired': 'Ci serve il tuo nome per confermare.',
    'messages.guestsRequired': 'Indica quante persone venite (minimo 1).',
    "messages.selectOption": "Scegli un'opzione per confermare.",
    'messages.serviceUnavailable': 'Impossibile connettersi al servizio. Riprova più tardi.',
    'messages.saving': 'Stiamo salvando la tua risposta...',
    'messages.thankYouYes': 'Grazie per la conferma!',
    'messages.thankYouNo': 'Che peccato, ci mancherai.',
    'messages.saveError': 'Non siamo riusciti a salvare la tua risposta. Riprova tra qualche istante.',
    'messages.responseExists': 'Abbiamo già registrato la tua risposta. Grazie!',
    'messages.firebaseUnavailable': 'Firebase RTDB non è disponibile.',
    'envelope.instruction': 'tocca o fai clic per aprire',
    'envelope.ariaLabel': "Apri l'invito",
    'envelope.letter': "apri l'invito"
  }
};

let currentLanguage = 'es';
let currentMessageKey = null;

function t(key) {
  return translations[currentLanguage]?.[key] ?? translations.es[key] ?? key;
}

function translateElement(element) {
  const textKey = element.dataset.i18n;
  if (textKey) {
    const translation = t(textKey);
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  }

  const attrMap = element.dataset.i18nAttr;
  if (attrMap) {
    attrMap.split(';').forEach((mapping) => {
      const [attribute, attributeKey] = mapping.split(':').map((part) => part.trim());
      if (!attribute || !attributeKey) return;
      const translation = t(attributeKey);
      element.setAttribute(attribute, translation);
    });
  }
}

function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n], [data-i18n-attr]');
  elements.forEach((element) => translateElement(element));
}

function updateLanguageButtons() {
  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === currentLanguage;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function showMessage(messageKey) {
  if (!confirmationMessage) return;
  currentMessageKey = messageKey;
  const messageText = messageKey ? t(messageKey) : '';
  confirmationMessage.textContent = messageText;
  confirmationMessage.classList.toggle('visible', Boolean(messageText));
}

function setLanguage(language, { persist = true } = {}) {
  if (!translations[language]) return;
  const previousMessageKey = currentMessageKey;
  currentLanguage = language;
  if (persist) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
  document.documentElement.lang = language;
  document.title = t('head.title');
  applyTranslations();
  updateLanguageButtons();
  if (previousMessageKey) {
    showMessage(previousMessageKey);
  } else {
    showMessage(null);
  }
}

function initLanguage() {
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage && translations[storedLanguage]) {
    setLanguage(storedLanguage, { persist: false });
  } else {
    setLanguage(currentLanguage, { persist: false });
  }

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const { language } = button.dataset;
      if (!language || language === currentLanguage) return;
      setLanguage(language);
    });
  });
}

initLanguage();

let formLocked = false;

function toggleControlsDisabled(disabled) {
  if (!form) return;
  formControls.forEach((control) => {
    if (control.type === 'hidden') return;
    if (control.dataset?.skipDisable === 'true') return;
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

function showResetButton() {
  if (!resetButton) return;
  resetButton.hidden = false;
}

function hideResetButton() {
  if (!resetButton) return;
  resetButton.hidden = true;
}

function lockFormWithMessage(messageKey, { allowReset = true } = {}) {
  formLocked = true;
  toggleControlsDisabled(true);
  showMessage(messageKey || null);
  if (allowReset) {
    showResetButton();
  }
}

function unlockForm() {
  formLocked = false;
  toggleControlsDisabled(false);
  setSubmittingState(false);
  form?.reset();
  showMessage('messages.updateResponse');
  hideResetButton();
  const firstInput = form?.querySelector('input:not([type="hidden"])');
  firstInput?.focus();
}

function validateForm(name, guestsValue) {
  if (!name) {
    return 'messages.nameRequired';
  }

  const guestsNumber = Number(guestsValue);
  if (!Number.isFinite(guestsNumber) || guestsNumber < 1) {
    return 'messages.guestsRequired';
  }

  return null;
}

if (form) {
  if (!database || !ref || !push) {
    console.error(t('messages.firebaseUnavailable'));
  }

  hideResetButton();

  const storedResponse = window.localStorage.getItem(RSVP_STORAGE_KEY);
  if (storedResponse) {
    lockFormWithMessage('messages.responseExists');
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      window.localStorage.removeItem(RSVP_STORAGE_KEY);
      unlockForm();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (formLocked) {
      return;
    }

    const submitter = event.submitter;
    const response = submitter?.dataset.response || '';
    if (!response) {
      showMessage('messages.selectOption');
      return;
    }
    const attending = response === 'yes';
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
      showMessage('messages.serviceUnavailable');
      return;
    }

    setSubmittingState(true);
    showMessage('messages.saving');

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

      const thankYouMessageKey = attending
        ? 'messages.thankYouYes'
        : 'messages.thankYouNo';

      lockFormWithMessage(thankYouMessageKey);
      window.localStorage.setItem(RSVP_STORAGE_KEY, 'done');
    } catch (error) {
      console.error(error);
      setSubmittingState(false);
      showMessage('messages.saveError');
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
