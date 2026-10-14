// =====================================================
// scene.js — 3D-логотип ML_ из кубиков (библиотека Three.js)
//
// Идея: логотип собран из маленьких кубов, как из пикселей.
// При загрузке кубы слетаются в логотип, он следит за мышкой,
// а при прокрутке кубы разлетаются и плавают фоном.
// =====================================================

(function () {
  const canvas = document.getElementById('scene');
  const heroText = document.querySelector('.hero-text');

  // Если 3D не поддерживается — показываем обычный логотип (класс no-3d включает его в CSS)
  function fallback() {
    document.body.classList.add('no-3d');
  }

  if (!window.THREE || !canvas) return fallback();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (error) {
    return fallback();
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Не рисуем больше пикселей, чем нужно — чтобы не тормозило на слабых устройствах
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 24);

  // ---------- Свет ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(5, 8, 10);
  scene.add(sun);

  const greenLight = new THREE.PointLight(0xC6FF4A, 1.4, 40);
  greenLight.position.set(-8, -4, 8);
  scene.add(greenLight);

  // ---------- Буквы из «пикселей» ----------
  // X — здесь стоит куб, точка — пусто
  const LETTER_M = [
    'X...X',
    'XX.XX',
    'X.X.X',
    'X...X',
    'X...X',
    'X...X',
    'X...X'
  ];
  const LETTER_L = [
    'X...',
    'X...',
    'X...',
    'X...',
    'X...',
    'X...',
    'XXXX'
  ];
  const CURSOR = [
    '....',
    '....',
    '....',
    '....',
    '....',
    '....',
    'XXXX'
  ];

  const logo = new THREE.Group();
  scene.add(logo);

  const cubeGeo = new THREE.BoxGeometry(0.86, 0.86, 0.86);
  const edgeGeo = new THREE.EdgesGeometry(cubeGeo);

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF4F5F7, roughness: 0.35, metalness: 0.1 });
  const greenMat = new THREE.MeshStandardMaterial({
    color: 0xC6FF4A, emissive: 0xC6FF4A, emissiveIntensity: 0.7, roughness: 0.4, transparent: true
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x0D0E11 });

  const cubes = [];
  const TOTAL_WIDTH = 15; // M (5) + пробел + L (4) + пробел + курсор (4)

  function addLetter(rows, offsetX, material) {
    rows.forEach(function (row, y) {
      row.split('').forEach(function (cell, x) {
        if (cell !== 'X') return;

        const cube = new THREE.Mesh(cubeGeo, material);
        cube.add(new THREE.LineSegments(edgeGeo, edgeMat)); // тёмные рёбра — «пиксельный» вид

        // home — место куба в логотипе, away — куда он улетает при прокрутке
        cube.userData.home = new THREE.Vector3(offsetX + x - (TOTAL_WIDTH - 1) / 2, 3 - y, 0);
        cube.userData.away = new THREE.Vector3(
          (Math.random() - 0.5) * 34,
          (Math.random() - 0.5) * 22,
          -10 + Math.random() * 14
        );
        cube.userData.spin = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        );
        cube.userData.phase = Math.random() * Math.PI * 2;

        logo.add(cube);
        cubes.push(cube);
      });
    });
  }

  addLetter(LETTER_M, 0, whiteMat);
  addLetter(LETTER_L, 6, whiteMat);
  addLetter(CURSOR, 11, greenMat);

  // ---------- Звёздная пыль на фоне ----------
  const starCount = 320;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 70;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 44;
    starPos[i * 3 + 2] = -22 + Math.random() * 20;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0x9A9DA6, size: 0.09, transparent: true, opacity: 0.7
  }));
  scene.add(stars);

  // ---------- Состояние ----------
  const mouse = { x: 0, y: 0 };
  let scrollP = 0;                       // 0 — логотип собран, 1 — кубы разлетелись
  let intro = reduceMotion ? 0 : 1;      // при загрузке кубы слетаются из разных сторон
  let mobile = false;
  let logoY = 0;                         // высота логотипа без сдвига прокруткой

  function smooth(t) {
    return t * t * (3 - 2 * t); // плавное начало и конец движения
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    mobile = w < 700;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', function (event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  });

  // На телефоне вместо мышки — наклон устройства (если браузер разрешает)
  window.addEventListener('deviceorientation', function (event) {
    if (event.gamma === null || event.beta === null) return;
    mouse.x = Math.max(-1, Math.min(1, event.gamma / 30));
    mouse.y = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
  });

  function readScroll() {
    scrollP = Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.8)));
  }

  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  // ---------- Анимация ----------
  const clock = new THREE.Clock();
  let running = true;

  // Вкладка не видна — не тратим ресурсы
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      requestAnimationFrame(frame);
    }
  });

  function frame() {
    if (!running) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (intro > 0) intro = Math.max(0, intro - dt / 1.8);

    // Сколько «единиц сцены» помещается на экране по ширине и высоте (от центра до края)
    const halfH = Math.tan(camera.fov * Math.PI / 360) * camera.position.z;
    const halfW = halfH * camera.aspect;

    // На телефоне логотип стоит над текстом. Если разбирать его сразу, кубы летят прямо по буквам.
    // Поэтому сначала логотип уезжает вверх вместе с первым экраном, сцена гаснет,
    // и только потом кубы разлетаются — уже еле заметным фоном.
    const vh = window.innerHeight;
    const sy = window.scrollY;
    const clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
    const scatterP = mobile ? clamp01((sy - vh * 0.6) / (vh * 0.6)) : scrollP;
    const fadeP = mobile ? clamp01(sy / (vh * 0.6)) : scrollP;

    // p — насколько кубы «разобраны»: либо из-за заставки, либо из-за прокрутки
    const p = smooth(Math.max(scatterP, intro));

    // Сдвиг логотипа вверх вместе со страницей (в единицах сцены)
    const lift = mobile ? (Math.min(sy, vh * 1.2) / vh) * 2 * halfH * (1 - p) : 0;
    const depth = mobile ? 12 : 0; // на телефоне разлетевшиеся кубы уходят глубже — мельче и не мешают

    // Положение логотипа: на компьютере — в правой части экрана, на телефоне — сверху по центру.
    // Размер считаем от ширины экрана, чтобы логотип не наезжал на текст и не вылезал за край.
    // На телефоне ставим логотип ровно в свободное место между шапкой и текстом
    let baseY = 0.2;
    let baseScale = (halfW * 0.72) / TOTAL_WIDTH;
    if (mobile) {
      const pxPerUnit = vh / (2 * halfH);
      const textTop = heroText ? heroText.getBoundingClientRect().top + sy : vh * 0.5; // где начинается текст на странице
      const gapTop = 64;                        // низ шапки
      const gap = Math.max(80, textTop - gapTop);
      baseY = halfH - ((gapTop + textTop) / 2) / pxPerUnit;
      baseScale = Math.min((halfW * 1.7) / TOTAL_WIDTH, (gap * 0.78) / (7 * pxPerUnit));
    }
    const baseX = mobile ? 0 : halfW * 0.56;
    logo.position.x += (baseX * (1 - p) - logo.position.x) * 0.08;
    logoY += (baseY * (1 - p) - logoY) * 0.08;
    logo.position.y = logoY + lift; // сдвиг без сглаживания, чтобы логотип не отставал от текста
    const scale = baseScale + (1 - baseScale) * p;
    logo.scale.setScalar(logo.scale.x + (scale - logo.scale.x) * 0.08);

    // Логотип поворачивается за мышкой и слегка покачивается сам
    const targetY = mouse.x * 0.45 + Math.sin(t * 0.5) * 0.12 - 0.18 * (1 - p);
    const targetX = mouse.y * 0.3 + Math.cos(t * 0.4) * 0.06;
    logo.rotation.y += (targetY - logo.rotation.y) * 0.06;
    logo.rotation.x += (targetX - logo.rotation.x) * 0.06;

    cubes.forEach(function (cube) {
      const u = cube.userData;
      const float = Math.sin(t * 1.4 + u.phase) * (0.05 + 0.5 * p); // лёгкое парение

      cube.position.set(
        u.home.x + (u.away.x - u.home.x) * p,
        u.home.y + (u.away.y - u.home.y) * p + float,
        u.home.z + (u.away.z - depth - u.home.z) * p
      );
      cube.rotation.set(
        u.spin.x * p + t * 0.15 * p,
        u.spin.y * p + t * 0.2 * p,
        u.spin.z * p
      );
    });

    // Зелёный курсор мигает, пока логотип собран
    greenMat.opacity = p > 0.08 ? 1 : (Math.floor(t * 1.7) % 2 === 0 ? 1 : 0.12);

    stars.rotation.y = t * 0.012 + mouse.x * 0.04;
    stars.rotation.x = mouse.y * 0.03;

    // Когда читаем контент — сцена уходит на задний план, чтобы не мешать тексту
    canvas.style.opacity = String(1 - (mobile ? 0.88 : 0.72) * smooth(fadeP));

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
