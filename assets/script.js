// Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Navbar shadow / background on scroll
const nav = $('#mainNav');
const backToTop = $('#backToTop');

const onScroll = () => {
  const y = window.scrollY;
  if (y > 24) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
  if (y > 320) backToTop.classList.add('show'); else backToTop.classList.remove('show');
};
window.addEventListener('scroll', onScroll);
onScroll();

// Back to top behavior
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Smooth in-page anchor scrolling (offset for fixed navbar)
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.pushState(null, '', id);
      }
    }
  });
});

// Gallery filter
const filterButtons = $$('.btn-group [data-filter]');
const items = $$('.gallery-item');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    items.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});

// Contact form validation + fake success
(() => {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Simulate async submission
    const toastEl = $('#formToast');
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    form.reset();
    form.classList.remove('was-validated');
  }, false);
})();

// Footer year
$('#year').textContent = new Date().getFullYear();


// --- Google Sheets form submit ---
(() => {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  // Fill hidden UA field
  const ua = form.querySelector('input[name="ua"]');
  if (ua) ua.value = navigator.userAgent;

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtlBDSiJMsruAoYT5cWIJwTovSxwcFmXmSu_n4z-_gQOCyqjUNI9gSh8512_RJ1kgB/execYOUR_SCRIPT_URL_HERE'; // <-- paste your Web App URL

  const btn = document.querySelector('#submitBtn');
  const toastEl = document.querySelector('#formToast');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // block obvious bots
    if (form.querySelector('input[name="hp"]')?.value) return;

    // UI: disable button
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    try {
      // Send as FormData (works with Apps Script; no extra CORS headers needed)
      const fd = new FormData(form);
      await fetch(SCRIPT_URL, { method: 'POST', body: fd, mode: 'no-cors' });

      // Success UI
      if (toastEl) new bootstrap.Toast(toastEl).show();
      form.reset();
      form.classList.remove('was-validated');
    } catch (err) {
      alert('Sorry, there was an error sending your message. Please WhatsApp or call us.');
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send';
    }
  }, false);
})();
