import { LANG_COLORS, REPOS } from './data.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;

const ThemeManager = (() => {
  const storageKey = 'portfolio-theme';
  let current = 'dark';

  function apply(theme, { persist = true } = {}) {
    document.body.classList.toggle('theme-catppuccin', theme === 'catppuccin');
    current = theme;

    if (persist) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // Ignore storage failures in private mode or locked-down browsers.
      }
    }
  }

  function init() {
    let savedTheme = 'dark';

    try {
      savedTheme = localStorage.getItem(storageKey) || 'dark';
    } catch {
      savedTheme = 'dark';
    }

    apply(savedTheme, { persist: false });
  }

  function toggle() {
    apply(current === 'catppuccin' ? 'dark' : 'catppuccin');
  }

  return { init, apply, toggle };
})();

const CursorSpotlight = (() => {
  function init() {
    const spotlight = document.getElementById('spotlight');
    if (!spotlight || !supportsFinePointer || prefersReducedMotion) return;

    let rafId = 0;
    let nextX = 50;
    let nextY = 20;

    const sync = () => {
      rafId = 0;
      spotlight.style.setProperty('--mx', `${nextX}%`);
      spotlight.style.setProperty('--my', `${nextY}%`);
    };

    window.addEventListener(
      'pointermove',
      (event) => {
        nextX = (event.clientX / window.innerWidth) * 100;
        nextY = (event.clientY / window.innerHeight) * 100;
        if (!rafId) {
          rafId = window.requestAnimationFrame(sync);
        }
      },
      { passive: true },
    );
  }

  return { init };
})();

const HeroTyping = (() => {
  const COMMAND = 'whoami --role=fullstack';
  const SPEED_MS = 38;

  function init() {
    const target = document.getElementById('typed-cmd');
    if (!target) return;

    if (prefersReducedMotion) {
      target.textContent = COMMAND;
      return;
    }

    let charIndex = 0;

    const typeNextChar = () => {
      target.textContent = COMMAND.slice(0, charIndex);
      if (charIndex >= COMMAND.length) return;
      charIndex += 1;
      window.setTimeout(typeNextChar, SPEED_MS);
    };

    typeNextChar();
  }

  return { init };
})();

const GlitchEffect = (() => {
  const MIN_DELAY_MS = 3200;
  const MAX_DELAY_MS = 6000;
  const FLICKER_MS = 350;
  const FIRST_DELAY_MS = 2800;

  function init() {
    const heroName = document.getElementById('hero-name');
    if (!heroName || prefersReducedMotion) return;

    const scheduleNext = () => {
      window.setTimeout(() => {
        heroName.classList.add('glitching');
        window.setTimeout(() => heroName.classList.remove('glitching'), FLICKER_MS);
        scheduleNext();
      }, MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
    };

    scheduleNext();
    window.setTimeout(() => heroName.classList.add('glitching'), FIRST_DELAY_MS);
    window.setTimeout(() => heroName.classList.remove('glitching'), FIRST_DELAY_MS + FLICKER_MS);
  }

  return { init };
})();

const ScrollReveal = (() => {
  function init(root = document) {
    const elements = root.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      elements.forEach((element) => element.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => entry.target.classList.add('in-view'), index * 80);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    elements.forEach((element) => observer.observe(element));
  }

  return { init };
})();

const ProjectCardGlow = (() => {
  function init() {
    if (prefersReducedMotion || !supportsFinePointer) return;

    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener(
        'pointermove',
        (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--cx', `${event.clientX - rect.left}px`);
          card.style.setProperty('--cy', `${event.clientY - rect.top}px`);
        },
        { passive: true },
      );
    });
  }

  return { init };
})();

const MagneticButtons = (() => {
  const PULL_X = 0.25;
  const PULL_Y = 0.4;

  function init() {
    if (prefersReducedMotion || !supportsFinePointer) return;

    document.querySelectorAll('.btn').forEach((button) => {
      button.addEventListener(
        'pointermove',
        (event) => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) * PULL_X;
          const y = (event.clientY - rect.top - rect.height / 2) * PULL_Y;
          button.style.transform = `translate(${x}px, ${y}px)`;
        },
        { passive: true },
      );

      button.addEventListener('pointerleave', () => {
        button.style.transform = '';
      });
    });
  }

  return { init };
})();

const TabNav = (() => {
  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  function init() {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const sections = tabs
      .map((tab) => document.getElementById(tab.dataset.target || ''))
      .filter(Boolean);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => scrollToSection(tab.dataset.target));
    });

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const activeIndex = sections.indexOf(entry.target);
        tabs.forEach((tab, index) => {
          const isActive = index === activeIndex;
          tab.classList.toggle('active', isActive);
          const dot = tab.querySelector('.dot');
          if (dot) dot.textContent = isActive ? '●' : '○';
        });
      });
    }, { threshold: 0.4 });

    sections.forEach((section) => observer.observe(section));
  }

  return { init, scrollToSection };
})();

const RepoExplorer = (() => {
  let listEl;
  let countEl;

  function buildRow(repo) {
    const row = document.createElement('div');
    row.className = 'repo-row reveal';
    row.dataset.lang = repo.lang;

    const statusClass = repo.status === 'archived' ? 'is-archived' : 'is-active';
    const statusLabel = repo.status === 'archived' ? 'archived' : 'active';
    const topicsHtml = repo.topics.map((topic) => `<span>${topic}</span>`).join('');

    row.innerHTML = `
      <div class="repo-row-top">
        <span class="lang-dot" style="background:${LANG_COLORS[repo.lang] || '#888'}"></span>
        <span class="repo-name">
          <a href="${repo.url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
        </span>
        <span class="repo-status ${statusClass}">${statusLabel}</span>
        <span class="expand-caret">▸</span>
      </div>
      <div class="repo-detail">
        <div class="readme-line">// cat README.md</div>
        <p>${repo.desc}</p>
        <div class="topic-chips">${topicsHtml}</div>
      </div>`;

    row.querySelector('.repo-name a')?.addEventListener('click', (event) => event.stopPropagation());
    row.addEventListener('click', () => row.classList.toggle('expanded'));

    return row;
  }

  function updateCount() {
    const visible = listEl.querySelectorAll('.repo-row:not(.hidden)').length;
    countEl.textContent = `${visible} ${visible === 1 ? 'repo' : 'repos'}`;
  }

  function applyFilter(lang) {
    listEl.querySelectorAll('.repo-row').forEach((row) => {
      row.classList.toggle('hidden', lang !== 'all' && row.dataset.lang !== lang);
    });
    updateCount();
  }

  function initFilterChips() {
    document.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach((otherChip) => otherChip.classList.remove('active'));
        chip.classList.add('active');
        applyFilter(chip.dataset.lang || 'all');
      });
    });
  }

  function init() {
    listEl = document.getElementById('repo-list');
    countEl = document.getElementById('repo-count');
    if (!listEl || !countEl) return;

    const fragment = document.createDocumentFragment();
    REPOS.forEach((repo) => fragment.appendChild(buildRow(repo)));

    listEl.replaceChildren(fragment);
    updateCount();
    initFilterChips();
    ScrollReveal.init(listEl);
  }

  return { init };
})();

const CommandPalette = (() => {
  let overlay;
  let input;
  let listEl;
  let filtered = [];
  let activeIndex = 0;

  const COMMANDS = [
    { icon: '#', label: 'Gå till Home', hint: 'sektion', action: () => TabNav.scrollToSection('home') },
    { icon: '#', label: 'Gå till Om mig', hint: 'sektion', action: () => TabNav.scrollToSection('about') },
    { icon: '#', label: 'Gå till Projekt', hint: 'sektion', action: () => TabNav.scrollToSection('projects') },
    { icon: '#', label: 'Gå till GitHub-repos', hint: 'sektion', action: () => TabNav.scrollToSection('repos') },
    { icon: '#', label: 'Gå till Kontakt', hint: 'sektion', action: () => TabNav.scrollToSection('contact') },
    { icon: '◐', label: 'Växla tema: Catppuccin', hint: 'theme', action: () => ThemeManager.apply('catppuccin') },
    { icon: '◐', label: 'Växla tema: Mörkt (standard)', hint: 'theme', action: () => ThemeManager.apply('dark') },
    { icon: '↗', label: 'Öppna GitHub-profil', hint: 'länk', action: () => window.open('https://github.com/W3ndig0u0', '_blank', 'noopener,noreferrer') },
    { icon: '↗', label: 'Öppna CashDash live demo', hint: 'projekt', action: () => window.open('https://cashdash-5r6.pages.dev/', '_blank', 'noopener,noreferrer') },
    { icon: '↗', label: 'Öppna Game Tracker live demo', hint: 'projekt', action: () => window.open('https://gamebacklog-tracker.pages.dev/', '_blank', 'noopener,noreferrer') },
    { icon: '✉', label: 'Kontakta via e-post', hint: 'kontakt', action: () => { window.location.href = 'mailto:din.mail@exempel.com'; } },
  ];

  function highlightActive() {
    listEl.querySelectorAll('.cmdk-item').forEach((item, index) => {
      item.classList.toggle('active', index === activeIndex);
    });
  }

  function renderList() {
    listEl.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      empty.textContent = 'Inga träffar — testa ett annat sökord.';
      listEl.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach((command, index) => {
      const item = document.createElement('div');
      item.className = `cmdk-item${index === activeIndex ? ' active' : ''}`;
      item.innerHTML = `
        <span class="cmdk-icon">${command.icon}</span>
        <span>${command.label}</span>
        <span class="cmdk-hint">${command.hint}</span>`;
      item.addEventListener('mouseenter', () => {
        activeIndex = index;
        highlightActive();
      });
      item.addEventListener('click', () => runCommand(command));
      fragment.appendChild(item);
    });

    listEl.appendChild(fragment);
  }

  function runCommand(command) {
    command.action();
    close();
  }

  function open() {
    overlay.classList.add('open');
    input.value = '';
    filtered = COMMANDS.slice();
    activeIndex = 0;
    renderList();
    window.setTimeout(() => input.focus(), 30);
  }

  function close() {
    overlay.classList.remove('open');
  }

  function isOpen() {
    return overlay.classList.contains('open');
  }

  function handleInput() {
    const query = input.value.toLowerCase().trim();
    filtered = COMMANDS.filter((command) =>
      command.label.toLowerCase().includes(query) || command.hint.toLowerCase().includes(query),
    );
    activeIndex = 0;
    renderList();
  }

  function handleKeydown(event) {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const commandKeyHeld = isMac ? event.metaKey : event.ctrlKey;

    if (commandKeyHeld && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      isOpen() ? close() : open();
      return;
    }

    if (!isOpen()) return;

    switch (event.key) {
      case 'Escape':
        close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
        highlightActive();
        break;
      case 'ArrowUp':
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        highlightActive();
        break;
      case 'Enter':
        event.preventDefault();
        if (filtered[activeIndex]) runCommand(filtered[activeIndex]);
        break;
      default:
        break;
    }
  }

  function init() {
    overlay = document.getElementById('cmdk-overlay');
    input = document.getElementById('cmdk-input');
    listEl = document.getElementById('cmdk-list');
    const trigger = document.getElementById('cmdk-trigger');

    if (!overlay || !input || !listEl || !trigger) return;

    trigger.addEventListener('click', open);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    input.addEventListener('input', handleInput);
    document.addEventListener('keydown', handleKeydown);
  }

  return { init };
})();

function boot() {
  ThemeManager.init();
  CursorSpotlight.init();
  HeroTyping.init();
  GlitchEffect.init();
  ProjectCardGlow.init();
  MagneticButtons.init();
  TabNav.init();
  RepoExplorer.init();
  CommandPalette.init();
  ScrollReveal.init();
}

if (typeof document !== 'undefined') {
  boot();
}
