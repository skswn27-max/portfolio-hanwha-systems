'use strict';

const progress = document.querySelector('#progress');
const projects = [...document.querySelectorAll('.project')];
const indexLinks = [...document.querySelectorAll('.project-index nav a')];
let ticking = false;
function updateReadingState() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 0}%`;
  let active = '';
  for (const project of projects) {
    if (project.getBoundingClientRect().top <= window.innerHeight * .4) active = project.id;
  }
  if (projects.length && projects[projects.length - 1].getBoundingClientRect().bottom < 100) active = '';
  for (const link of indexLinks) {
    if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  ticking = false;
}
function scheduleReadingState() {
  if (!ticking) { ticking = true; requestAnimationFrame(updateReadingState); }
}
window.addEventListener('scroll', scheduleReadingState, { passive: true });
window.addEventListener('resize', scheduleReadingState);
window.addEventListener('load', scheduleReadingState);
updateReadingState();

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const caption = document.querySelector('#lightbox-caption');
const counter = document.querySelector('#lightbox-count');
const previous = document.querySelector('#lightbox-prev');
const next = document.querySelector('#lightbox-next');
let galleryLinks = [];
let imageIndex = 0;
let opener;
function renderImage() {
  const link = galleryLinks[imageIndex];
  const source = link.querySelector('img');
  lightboxImage.src = link.href;
  lightboxImage.alt = source.alt;
  const figureCaption = link.closest('figure').querySelector('figcaption');
  caption.textContent = figureCaption ? figureCaption.innerText.replace(/\s+/g, ' ').trim() : source.alt;
  counter.textContent = `${imageIndex + 1} / ${galleryLinks.length}`;
  previous.disabled = imageIndex === 0;
  next.disabled = imageIndex === galleryLinks.length - 1;
}
document.querySelectorAll('a.zoom').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof lightbox.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    galleryLinks = [...link.closest('[data-gallery]').querySelectorAll('a.zoom')];
    imageIndex = galleryLinks.indexOf(link);
    renderImage();
    lightbox.showModal();
    document.body.classList.add('lightbox-open');
    document.querySelector('#lightbox-close').focus();
  });
});
document.querySelector('#lightbox-close').addEventListener('click', () => lightbox.close());
previous.addEventListener('click', () => { if (imageIndex > 0) { imageIndex--; renderImage(); } });
next.addEventListener('click', () => { if (imageIndex < galleryLinks.length - 1) { imageIndex++; renderImage(); } });
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && imageIndex > 0) { event.preventDefault(); imageIndex--; renderImage(); }
  if (event.key === 'ArrowRight' && imageIndex < galleryLinks.length - 1) { event.preventDefault(); imageIndex++; renderImage(); }
});
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) {
    const bounds = lightbox.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
  }
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  if (opener) opener.focus({ preventScroll: true });
});
document.querySelector('#print-button').addEventListener('click', () => window.print());
