'use strict';

const projects = [...document.querySelectorAll('.project')];
const filters = [...document.querySelectorAll('[data-filter]')];
const groups = [...document.querySelectorAll('[data-group]')];
let activeFilter = 'all';
const indexLinks = [...document.querySelectorAll('.project-index [data-case-link]')];

function setFilter(category) {
  activeFilter = category;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  projects.forEach(project => { project.hidden = category !== 'all' && project.dataset.category !== category; });
  groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.project')].some(project => !project.hidden); });
  indexLinks.forEach(link => {
    link.hidden = document.getElementById(link.dataset.caseLink).hidden;
    link.removeAttribute('aria-current');
  });
  requestAnimationFrame(updateProgress);
}
filters.forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));

function openCase(id, scroll = true) {
  const target = document.getElementById(id);
  const project = target?.closest('.project');
  if (!project) return;
  if (project.hidden) setFilter('all');
  indexLinks.forEach(link => {
    if (link.dataset.caseLink === project.id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  if (scroll) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
document.querySelectorAll('[data-case-link]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const id = link.dataset.caseLink;
  const target = link.dataset.scrollTarget || id;
  history.pushState(null, '', '#' + target);
  openCase(target);
}));
window.addEventListener('hashchange', () => openCase(location.hash.slice(1)));
if (location.hash) requestAnimationFrame(() => openCase(location.hash.slice(1)));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const active = entries.filter(entry => entry.isIntersecting && !entry.target.hidden);
    if (!active.length) return;
    const id = active[0].target.id;
    indexLinks.forEach(link => {
      if (link.dataset.caseLink === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  projects.forEach(project => observer.observe(project));
}

const dialog = document.querySelector('.lightbox');
const dialogImage = document.getElementById('lightbox-image');
const dialogCaption = document.getElementById('lightbox-caption');
let previousFocus;
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  previousFocus = button;
  dialogImage.src = button.dataset.image;
  dialogImage.alt = button.querySelector('img')?.alt || button.dataset.caption;
  dialogCaption.textContent = button.dataset.caption;
  if (typeof dialog.showModal === 'function') {
    document.body.classList.add('modal-open');
    dialog.showModal();
  } else {
    window.open(button.dataset.image, '_blank', 'noopener,noreferrer');
  }
}));
document.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); previousFocus?.focus({ preventScroll: true }); });

let printState;
window.addEventListener('beforeprint', () => {
  if (printState) return;
  printState = { filter: activeFilter };
  setFilter('all');
});
window.addEventListener('afterprint', () => {
  if (!printState) return;
  setFilter(printState.filter);
  printState = null;
});
document.querySelector('.print-button').addEventListener('click', () => window.print());

const progress = document.querySelector('.reading-progress');
let scheduled = false;
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0) + '%';
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, { passive: true });
window.addEventListener('resize', updateProgress);
window.addEventListener('load', updateProgress);
updateProgress();
