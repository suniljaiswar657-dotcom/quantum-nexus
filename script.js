const toggle = document.querySelector('.menu');
const nav = document.querySelector('.nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('[data-detail]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('#notice').textContent = link.dataset.detail;
    document.querySelector('#about').scrollIntoView({behavior: 'smooth'});
  });
});
document.querySelector('#start').addEventListener('click', () => {
  document.querySelector('#notice').textContent = 'You’re in the Nexus. Choose one of the three systems above to explore its concept.';
});
document.querySelector('#year').textContent = new Date().getFullYear();