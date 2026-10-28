// Mobile menu
const btn = document.getElementById('mobileMenuBtn');
const menu = document.getElementById('mobileMenu');
btn.addEventListener('click', () => menu.classList.toggle('hidden'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.add('hidden')));

// Header shadow on scroll
const header = document.getElementById('header');
addEventListener('scroll', () => header.classList.toggle('shadow-md', scrollY > 10), { passive: true });

// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
}), { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Sliders (cars / motorbikes / reviews)
document.querySelectorAll('[data-slider]').forEach(root => {
    const track = root.querySelector('.track');
    const slides = [...track.children];
    const section = root.parentElement;
    const prevs = [...section.querySelectorAll('[data-prev]')];
    const nexts = [...section.querySelectorAll('[data-next]')];
    const dotsBox = root.querySelector('[data-dots]');
    let pages = 1, autoplay = null;

    const step = () => slides[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 20);
    const perView = () => Math.max(1, Math.round((track.clientWidth + 1) / step()));
    const maxScroll = () => track.scrollWidth - track.clientWidth;

    function buildDots() {
        pages = Math.max(1, Math.ceil(slides.length - perView() + 1));
        dotsBox.innerHTML = '';
        for (let i = 0; i < pages; i++) {
            const d = document.createElement('button');
            d.className = 'dot';
            d.setAttribute('aria-label', 'สไลด์ ' + (i + 1));
            d.addEventListener('click', () => { track.scrollTo({ left: i * step() }); restart(); });
            dotsBox.appendChild(d);
        }
        update();
    }
    function update() {
        const i = Math.min(pages - 1, Math.round(track.scrollLeft / step()));
        [...dotsBox.children].forEach((d, k) => d.classList.toggle('active', k === i));
        prevs.forEach(b => b.disabled = track.scrollLeft <= 2);
        nexts.forEach(b => b.disabled = track.scrollLeft >= maxScroll() - 2);
    }
    const go = dir => track.scrollBy({ left: dir * step() * (perView() > 1 ? perView() - 0 : 1) });
    prevs.forEach(b => b.addEventListener('click', () => { go(-1); restart(); }));
    nexts.forEach(b => b.addEventListener('click', () => { go(1); restart(); }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', buildDots);

    // Mouse drag on desktop
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('mousedown', e => { down = true; moved = false; sx = e.pageX; sl = track.scrollLeft; });
    addEventListener('mouseup', () => {
        if (!down) return; down = false;
        track.classList.remove('dragging');
        if (moved) track.scrollTo({ left: Math.round(track.scrollLeft / step()) * step() });
    });
    addEventListener('mousemove', e => {
        if (!down) return;
        const dx = e.pageX - sx;
        if (Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); }
        track.scrollLeft = sl - dx;
    });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    // Optional autoplay
    const ms = parseInt(root.dataset.autoplay || '0', 10);
    function tick() { track.scrollLeft >= maxScroll() - 2 ? track.scrollTo({ left: 0 }) : track.scrollBy({ left: step() }); }
    function start() { if (ms) autoplay = setInterval(tick, ms); }
    function stop() { clearInterval(autoplay); }
    function restart() { stop(); start(); }
    if (ms) {
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        root.addEventListener('touchstart', stop, { passive: true });
        root.addEventListener('touchend', start, { passive: true });
        start();
    }
    buildDots();
});