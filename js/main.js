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

// ---------- Кейсы: список слева, превью справа ----------
const CASES = [
  { url: 'oblaka-glamping', img: 'oblaka', title: 'Облака', desc: 'Огромный заголовок поверх гор, каталог домиков с галереями и калькулятор брони с допами.', chips: ['каталог домиков', 'калькулятор брони', 'параллакс'] },
  { url: 'zerno-coffee', img: 'zerno', title: 'Зерно', desc: '3D-стаканчики с брызгами кофе на Three.js, предзаказ с корзиной, квиз и карта лояльности.', chips: ['3D на Three.js', 'предзаказ', 'квиз'] },
  { url: 'grafit-tattoo', img: 'grafit', title: 'Графит', desc: 'Хромовые 3D-звёзды, калькулятор стоимости тату и фильтр работ по стилям.', chips: ['3D на Three.js', 'калькулятор цены', 'фильтр работ'] },
  { url: 'mindal-nails', img: 'mindal', title: 'Миндаль', desc: 'Онлайн-запись с выбором мастера и времени, промокод на скидку и галерея работ.', chips: ['онлайн-запись', 'галерея работ', 'промокод'] },
  { url: 'emal-dental', img: 'emal', title: 'Эмаль', desc: 'Имплант в 3D разбирается при прокрутке, наглядное отбеливание и запись на консультацию.', chips: ['3D на Three.js', 'анимация по прокрутке', 'запись'] },
  { url: 'forma-fitness', img: 'forma', title: 'FORMA', desc: 'Расписание тренировок, тарифы и запись на пробное занятие в тёмном минимализме.', chips: ['расписание', 'запись', 'тарифы'] }
];

const casesBox = document.getElementById('cases');
const caseView = document.getElementById('case-view');
const caseImg = document.getElementById('case-img');
const caseButtons = document.querySelectorAll('.case-item');
let caseIndex = 0;
let caseTimer;

// Заранее подгружаем картинки, чтобы переключение было мгновенным
CASES.forEach(function (c) { new Image().src = 'img/case-' + c.img + '.jpg'; });

function showCase(index) {
  caseIndex = index;
  const c = CASES[index];
  caseButtons.forEach(function (b, i) {
    b.classList.toggle('active', i === index);
    b.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });

  caseView.classList.add('switching');
  setTimeout(function () {
    caseImg.src = 'img/case-' + c.img + '.jpg';
    caseImg.alt = 'Сайт «' + c.title + '»';
    caseView.href = 'https://matthewlestermun.github.io/' + c.url + '/';
    document.getElementById('case-url').textContent = c.url;
    document.getElementById('case-title').textContent = c.title;
    document.getElementById('case-desc').textContent = c.desc;
    document.getElementById('case-chips').innerHTML = c.chips.map(function (t) { return '<span>' + t + '</span>'; }).join('');
    caseView.classList.remove('switching');
  }, 200);

  // перезапуск полоски автопрокрутки
  caseView.classList.remove('ticking');
  void caseView.offsetWidth;
  caseView.classList.add('ticking');
}

function startCases() {
  clearInterval(caseTimer);
  caseTimer = setInterval(function () { showCase((caseIndex + 1) % CASES.length); }, 6000);
  caseView.classList.add('ticking');
}

function stopCases() {
  clearInterval(caseTimer);
  caseView.classList.remove('ticking');
}

caseButtons.forEach(function (button, i) {
  button.addEventListener('click', function () {
    showCase(i);
    stopCases(); // человек выбрал сам — автопрокрутку больше не включаем
    casesBox.dataset.manual = '1';
    if (!canHover) button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  if (canHover) button.addEventListener('mouseenter', function () { if (i !== caseIndex) showCase(i); });
});

casesBox.addEventListener('mouseenter', stopCases);
casesBox.addEventListener('mouseleave', function () { if (!casesBox.dataset.manual) startCases(); });

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startCases();

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

// ---------- Кастомный курсор: точка + кольцо, которое догоняет ----------
if (canHover && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  ring.innerHTML = '<span>открыть</span>';
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    document.documentElement.classList.add('has-cursor');
  });
  document.addEventListener('mouseleave', function () { document.documentElement.classList.remove('has-cursor'); });
  document.addEventListener('mousedown', function () { ring.classList.add('down'); });
  document.addEventListener('mouseup', function () { ring.classList.remove('down'); });

  // Кольцо плавно тянется за точкой
  (function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)' + (ring.classList.contains('down') ? ' scale(.85)' : '');
    requestAnimationFrame(follow);
  })();

  // Над превью кейса — большое кольцо «открыть», над ссылками и кнопками — увеличенное
  document.addEventListener('mouseover', function (e) {
    const view = e.target.closest('.case-view');
    const link = e.target.closest('a, button');
    ring.classList.toggle('view', !!view);
    ring.classList.toggle('hover', !view && !!link);
  });
}
