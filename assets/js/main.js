const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const header = document.querySelector('[data-header]');

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    document.body.classList.toggle('menu-open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const educationTabs = [...document.querySelectorAll('[data-education-tab]')];

if (educationTabs.length) {
  const activateEducationTab = (activeTab, moveFocus = false) => {
    educationTabs.forEach((tab) => {
      const isActive = tab === activeTab;
      const panel = document.getElementById(tab.dataset.educationTab);

      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;

      if (panel) {
        panel.hidden = !isActive;
        panel.classList.toggle('is-active', isActive);
      }
    });

    if (moveFocus) activeTab.focus();
  };

  educationTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateEducationTab(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;

      if (event.key === 'ArrowRight') nextIndex = (index + 1) % educationTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + educationTabs.length) % educationTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = educationTabs.length - 1;
      if (nextIndex === index) return;

      event.preventDefault();
      activateEducationTab(educationTabs[nextIndex], true);
    });
  });

  const activateEducationFromHash = () => {
    const targetPanel = window.location.hash === '#courses' ? 'courses' : 'education-main';
    const targetTab = educationTabs.find((tab) => tab.dataset.educationTab === targetPanel);
    if (targetTab) activateEducationTab(targetTab);
  };

  activateEducationFromHash();
  window.addEventListener('hashchange', activateEducationFromHash);
}

const crmSequence = document.querySelector('.crm-composition');

if (crmSequence && !prefersReducedMotion && 'IntersectionObserver' in window) {
  crmSequence.classList.add('has-sequence');

  const crmObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-animated');
        crmObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.28 });

  crmObserver.observe(crmSequence);
}

const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealElements.forEach((element) => observer.observe(element));
}
