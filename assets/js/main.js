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

  const activateEducationTabAndHash = (activeTab, moveFocus = false) => {
    activateEducationTab(activeTab, moveFocus);
    const nextHash = activeTab.dataset.educationTab === 'courses' ? '#courses' : '#education';
    window.history.replaceState(null, '', nextHash);
  };

  educationTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateEducationTabAndHash(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;

      if (event.key === 'ArrowRight') nextIndex = (index + 1) % educationTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + educationTabs.length) % educationTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = educationTabs.length - 1;
      if (nextIndex === index) return;

      event.preventDefault();
      activateEducationTabAndHash(educationTabs[nextIndex], true);
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

const projectDialog = document.querySelector('#project-dialog');
const projectDialogContent = projectDialog?.querySelector('[data-project-dialog-content]');
const projectDialogClose = projectDialog?.querySelector('[data-project-close]');
let projectDialogTrigger = null;
let projectScrollPosition = 0;

const startCrmSequence = (root) => {
  const sequence = root.querySelector('.crm-composition');
  if (!sequence || prefersReducedMotion) return;

  sequence.classList.add('has-sequence');
  requestAnimationFrame(() => requestAnimationFrame(() => sequence.classList.add('is-animated')));
};

const unlockProjectPage = () => {
  document.body.classList.remove('project-modal-open');
  document.body.style.top = '';
  window.scrollTo(0, projectScrollPosition);
};

const closeProjectDialog = () => {
  if (projectDialog?.open) projectDialog.close();
};

if (projectDialog && projectDialogContent && projectDialogClose) {
  projectDialogContent.addEventListener('click', (event) => {
    const button = event.target.closest('[data-video-src]');
    if (!button || !projectDialogContent.contains(button)) return;

    const player = button.closest('[data-video-player]');
    const frame = player?.querySelector('iframe');
    const originalLink = player?.querySelector('.video-original-link');
    if (!frame || !originalLink) return;

    player.querySelectorAll('[data-video-src]').forEach((option) => {
      option.setAttribute('aria-pressed', String(option === button));
    });
    frame.title = button.dataset.videoTitle;
    originalLink.href = button.dataset.videoHref;
    if (frame.src !== button.dataset.videoSrc) {
      player.classList.add('is-loading');
      frame.src = button.dataset.videoSrc;
    }
  });

  document.querySelectorAll('[data-project-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const source = document.querySelector(`[data-project-detail="${button.dataset.projectOpen}"]`);
      if (!source) return;

      const project = source.cloneNode(true);
      project.querySelectorAll('[data-video-player] iframe').forEach((frame) => {
        frame.addEventListener('load', () => frame.closest('[data-video-player]')?.classList.remove('is-loading'));
      });
      const title = project.querySelector('h3');
      if (title) title.id = 'project-dialog-title';
      project.classList.add('project-modal-case');
      projectDialogContent.replaceChildren(project);
      projectDialogContent.scrollTop = 0;

      projectDialogTrigger = button;
      projectScrollPosition = window.scrollY;
      document.body.style.top = `-${projectScrollPosition}px`;
      document.body.classList.add('project-modal-open');
      projectDialog.showModal();
      startCrmSequence(projectDialogContent);
      projectDialogClose.focus();
    });
  });

  projectDialogClose.addEventListener('click', closeProjectDialog);
  projectDialog.addEventListener('click', (event) => {
    if (event.target === projectDialog) closeProjectDialog();
  });
  projectDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeProjectDialog();
  });
  projectDialog.addEventListener('close', () => {
    unlockProjectPage();
    projectDialogContent.replaceChildren();
    requestAnimationFrame(() => projectDialogTrigger?.focus({ preventScroll: true }));
  });
}

const experienceDialog = document.querySelector('#experience-dialog');
const experienceDialogContent = experienceDialog?.querySelector('[data-experience-dialog-content]');
const experienceDialogClose = experienceDialog?.querySelector('[data-experience-close]');
let experienceDialogTrigger = null;
let experienceScrollPosition = 0;

const unlockExperiencePage = () => {
  document.body.classList.remove('project-modal-open');
  document.body.style.top = '';
  window.scrollTo(0, experienceScrollPosition);
};

const closeExperienceDialog = () => {
  if (experienceDialog?.open) experienceDialog.close();
};

if (experienceDialog && experienceDialogContent && experienceDialogClose) {
  document.querySelectorAll('[data-experience-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const source = document.querySelector(`[data-experience-detail="${button.dataset.experienceOpen}"]`);
      if (!source) return;

      const detail = source.cloneNode(true);
      const title = detail.querySelector('h3');
      if (title) title.id = 'experience-dialog-title';

      experienceDialogContent.replaceChildren(detail);
      experienceDialogContent.scrollTop = 0;
      experienceDialogTrigger = button;
      experienceScrollPosition = window.scrollY;
      document.body.style.top = `-${experienceScrollPosition}px`;
      document.body.classList.add('project-modal-open');
      experienceDialog.showModal();

      experienceDialogClose.focus();
    });
  });

  experienceDialogClose.addEventListener('click', closeExperienceDialog);
  experienceDialog.addEventListener('click', (event) => {
    if (event.target === experienceDialog) closeExperienceDialog();
  });
  experienceDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeExperienceDialog();
  });
  experienceDialog.addEventListener('close', () => {
    unlockExperiencePage();
    experienceDialogContent.replaceChildren();
    requestAnimationFrame(() => experienceDialogTrigger?.focus({ preventScroll: true }));
  });
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
