// =====================================================
// main.js — часы, меню, 3D-карточки, появление блоков
// =====================================================

// ---------- Часы в шапке ----------
function tickClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('ru-RU');
  const offset = -now.getTimezoneOffset() / 60; // часовой пояс посетителя
  document.getElementById('gmt').textContent = 'gmt ' + (offset >= 0 ? '+' : '') + offset;
}

tickClock();
setInterval(tickClock, 1000);

// ---------- Строка терминала печатается по буквам ----------
const typed = document.getElementById('typed');
const typedText = typed.dataset.text;
let typedIndex = 0;

function typeNext() {
  typed.textContent = typedText.slice(0, typedIndex);
  if (typedIndex++ < typedText.length) setTimeout(typeNext, 45);
}

setTimeout(typeNext, 400);

// ---------- Меню на весь экран ----------
function closeMenu() {
  document.body.classList.remove('menu-open');
}

document.getElementById('menu-open').addEventListener('click', function () {
  document.body.classList.add('menu-open');
});

document.getElementById('menu-close').addEventListener('click', closeMenu);

document.querySelectorAll('.menu nav a').forEach(function (link) {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closeMenu();
});

// ---------- 3D-карточки: наклон за курсором и блик ----------
const canHover = window.matchMedia('(hover: hover)').matches;

if (canHover) {
  document.querySelectorAll('.tilt').forEach(function (card) {
    card.addEventListener('mousemove', function (event) {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;  // 0 слева … 1 справа
      const y = (event.clientY - rect.top) / rect.height;  // 0 сверху … 1 снизу

      card.classList.add('moving');
      card.style.setProperty('--ry', ((x - 0.5) * 16) + 'deg');
      card.style.setProperty('--rx', ((0.5 - y) * 12) + 'deg');
      card.style.setProperty('--gx', (x * 100) + '%');
      card.style.setProperty('--gy', (y * 100) + '%');
    });

    card.addEventListener('mouseleave', function () {
      card.classList.remove('moving');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  });
}

// ---------- Большая кнопка «магнитится» к курсору ----------
const bigBtn = document.querySelector('.big-btn');

if (canHover && bigBtn) {
  bigBtn.addEventListener('mousemove', function (event) {
    const rect = bigBtn.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    bigBtn.style.transform = 'translate(' + dx * 0.2 + 'px, ' + dy * 0.3 + 'px)';
  });

  bigBtn.addEventListener('mouseleave', function () {
    bigBtn.style.transform = '';
  });
}

// ---------- Появление блоков при прокрутке ----------
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = Array.from(el.parentElement.children).filter(function (c) {
      return c.classList.contains('reveal');
    });
    el.style.transitionDelay = Math.max(0, siblings.indexOf(el)) * 0.1 + 's';
    el.classList.add('visible');
    observer.unobserve(el);

    // После появления убираем задержку — иначе наклон карточек будет «тормозить»
    setTimeout(function () { el.style.transitionDelay = ''; }, 1400);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
