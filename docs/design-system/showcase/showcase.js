/**
 * Showcase Navigation, Dark Mode, and Interactions
 */

/* ---- Sidebar Data ---- */
var NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { label: 'Home', href: 'index.html' }
    ]
  },
  {
    title: 'Tokens',
    items: [
      { label: 'Tokens', href: 'tokens.html' }
    ]
  },
  {
    title: 'Components',
    items: [
      { label: 'Score', href: 'comp-score.html' },
      { label: 'Cards', href: 'comp-cards.html' },
      { label: 'Navigation', href: 'comp-nav.html' },
      { label: 'Input', href: 'comp-input.html' },
      { label: 'Map', href: 'comp-map.html' },
      { label: 'Trust', href: 'comp-trust.html' },
      { label: 'Feedback', href: 'comp-feedback.html' },
      { label: 'Auxiliary', href: 'comp-auxiliary.html' }
    ]
  },
  {
    title: 'Pages',
    items: [
      { label: 'Landing', href: 'page-landing.html' },
      { label: 'Onboarding', href: 'page-onboarding.html' },
      { label: 'Results', href: 'page-results.html' },
      { label: 'MapDetail', href: 'page-map-detail.html' },
      { label: 'Detail', href: 'page-detail.html' },
      { label: 'Comparison', href: 'page-comparison.html' },
      { label: 'Board', href: 'page-board.html' },
      { label: 'MyPage', href: 'page-mypage.html' },
      { label: 'Guide', href: 'page-guide.html' },
      { label: 'Auth', href: 'page-auth.html' },
      { label: 'Legal', href: 'page-legal.html' },
      { label: 'Privacy', href: 'page-privacy.html' },
      { label: 'Location', href: 'page-location-terms.html' }
    ]
  },
  {
    title: 'States',
    items: [
      { label: 'Loading', href: 'page-loading.html' },
      { label: 'Error', href: 'page-error.html' },
      { label: 'Empty', href: 'page-empty.html' }
    ]
  }
];

var SECTION_LABELS = {
  'Overview': 'Overview',
  'Tokens': '\uD1A0\uD070',
  'Components': '\uCEF4\uD3EC\uB10C\uD2B8',
  'Pages': '\uD398\uC774\uC9C0',
  'States': '\uC0C1\uD0DC'
};

var ITEM_LABELS = {
  'Home': '\uAC1C\uC694',
  'Tokens': '\uCEEC\uB7EC \xB7 \uD0C0\uC774\uD3EC \xB7 \uAC04\uACA9 \xB7 \uADF8\uB9BC\uC790',
  'Score': '\uC2A4\uCF54\uC5B4 \uC2DC\uAC01\uD654',
  'Cards': '\uCE74\uB4DC',
  'Navigation': '\uB124\uBE44\uAC8C\uC774\uC158',
  'Input': '\uC785\uB825',
  'Map': '\uC9C0\uB3C4',
  'Trust': '\uC2E0\uB8B0 \xB7 \uCEF4\uD50C\uB77C\uC774\uC5B8\uC2A4',
  'Feedback': '\uD53C\uB4DC\uBC31',
  'Auxiliary': '\uBCF4\uC870 UI',
  'Landing': 'Landing (/)',
  'Onboarding': 'Onboarding (/search)',
  'Results': 'Results (/results)',
  'MapDetail': 'Map Detail (/results)',
  'Detail': 'Detail (/complex/[id])',
  'Comparison': 'Comparison (/compare)',
  'Board': 'Board (/board/[id])',
  'MyPage': 'MyPage (/mypage)',
  'Guide': 'Guide (/guide)',
  'Auth': 'Auth (/auth)',
  'Legal': 'Legal (/terms)',
  'Privacy': 'Privacy (/privacy)',
  'Location': 'Location (/location-terms)',
  'Loading': 'Loading',
  'Error': 'Error',
  'Empty': 'Empty States'
};

/* ---- Sidebar Rendering ---- */
function renderSidebar() {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  var currentPage = location.pathname.split('/').pop() || 'index.html';
  var html = '';

  for (var s = 0; s < NAV_SECTIONS.length; s++) {
    var section = NAV_SECTIONS[s];
    html += '<div class="sidebar-group-title">' + (SECTION_LABELS[section.title] || section.title) + '</div>';
    for (var i = 0; i < section.items.length; i++) {
      var item = section.items[i];
      var isActive = currentPage === item.href;
      var label = ITEM_LABELS[item.label] || item.label;
      html += '<a class="sidebar-link' + (isActive ? ' active' : '') + '" href="' + item.href + '">' + label + '</a>';
    }
  }

  sidebar.innerHTML = html;

  // Auto-close sidebar on mobile when a link is clicked
  var links = sidebar.querySelectorAll('.sidebar-link');
  for (var j = 0; j < links.length; j++) {
    links[j].addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  }
}

/* ---- Dark Mode ---- */
function initDarkMode() {
  var isDark = localStorage.getItem('showcase-dark') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
  updateThemeButton();
}

function toggleDark() {
  document.documentElement.classList.toggle('dark');
  var isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('showcase-dark', isDark);
  updateThemeButton();
}

function updateThemeButton() {
  var btn = document.getElementById('themeBtn');
  if (!btn) return;
  var isDark = document.documentElement.classList.contains('dark');
  btn.textContent = isDark ? '\u2600\uFE0F Light' : '\uD83C\uDF19 Dark';
}

/* ---- Fullscreen Toggle ---- */
function toggleFullscreen() {
  document.documentElement.classList.toggle('fullscreen-mode');
  var btn = document.getElementById('fullscreenBtn');
  if (!btn) return;
  var isFs = document.documentElement.classList.contains('fullscreen-mode');
  btn.textContent = isFs ? '\u2716 \uB2EB\uAE30' : '\u26F6 \uD480\uC2A4\uD06C\uB9B0';
}

/* ---- Mobile Sidebar Toggle ---- */
function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

/* ---- Toast ---- */
function showToast(message) {
  var toast = document.getElementById('liveToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'liveToast';
    toast.className = 'toast-sample toast-live';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('show');
  // Force reflow
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2200);
}

/* ---- Modal ---- */
function openModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('show');
}
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

/* ---- Bottom Sheet ---- */
function setBottomSheetState(state) {
  var sheet = document.getElementById('bottomsheet');
  if (sheet) sheet.setAttribute('data-state', state);
  // Update buttons
  document.querySelectorAll('.bs-btn').forEach(function(btn) {
    btn.classList.toggle('btn-primary', btn.dataset.state === state);
    btn.classList.toggle('btn-outline', btn.dataset.state !== state);
  });
}

/* ---- Tooltip ---- */
function toggleTooltip(id) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('show');
}

/* ---- Scroll Animation with IntersectionObserver ---- */
function initScrollAnimation() {
  var els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('animated');
          entries[i].target.dataset.animated = 'true';
          observer.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -50px 0px' });

    for (var i = 0; i < els.length; i++) {
      observer.observe(els[i]);
    }
  } else {
    // Fallback for older browsers
    animateOnScrollFallback();
    window.addEventListener('scroll', animateOnScrollFallback);
  }
}

function animateOnScrollFallback() {
  var els = document.querySelectorAll('[data-animate]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.dataset.animated) continue;
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      el.classList.add('animated');
      el.dataset.animated = 'true';
    }
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  renderSidebar();
  initScrollAnimation();

  // Close sidebar on overlay click
  var overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);
});
