/**
 * Showcase Navigation, Dark Mode, Interactions, and Page Navigation
 */

/* ============================================================
 * SVG Icon System (Lucide-style, stroke-based)
 * ============================================================ */
var ICONS = {
  // Navigation (20x20)
  home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  map: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  barChart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  arrowLeft: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>',

  // Score category icons (14x14)
  wallet: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>',
  train: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></svg>',
  building: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  bookOpen: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',

  // Trust & utility icons (14x14)
  lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  externalLink: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  trophy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  chevronRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',

  // Larger icons (24-28px)
  homeL: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  fileText: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>',
  creditCard: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
  baby: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>',
  helpCircle: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  ban: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>',

  // Data/feature icons (20-24px)
  walletL: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>',
  trainL: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/></svg>',
  buildingL: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  shieldL: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  barChartL: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  mapL: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  bell: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  scale: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
  link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  bookmark: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
  history: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  share: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
  sparkles: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',

  // Error/status icons
  alertTriangle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  wifiOff: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/></svg>',
  heart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  userRound: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
};

/* ---- Helper: get icon by name ---- */
function icon(name, size) {
  var svg = ICONS[name] || '';
  if (size && svg) {
    svg = svg.replace(/width="\d+"/, 'width="' + size + '"').replace(/height="\d+"/, 'height="' + size + '"');
  }
  return svg;
}

/* ---- Status Bar SVG ---- */
var STATUS_BAR_SIGNAL = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" opacity="0.7"><rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="7" rx="0.5"/><rect x="9" y="2" width="3" height="10" rx="0.5"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3"/></svg>';
var STATUS_BAR_BATTERY = '<svg width="22" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"><rect x="1" y="1" width="18" height="10" rx="2"/><rect x="4" y="3" width="10" height="6" rx="1" fill="currentColor" opacity="0.7"/><path d="M20.5 4v4" stroke-width="2" stroke-linecap="round"/></svg>';

/* ---- Auto-render Phone Status Bar ---- */
function renderStatusBarHTML(color) {
  var style = color ? ' style="color:' + color + ';position:relative;z-index:2;"' : '';
  return '<div class="phone-status-bar"' + style + '>' +
    '<span>9:41</span>' +
    '<span style="display:flex;gap:4px;align-items:center;">' + STATUS_BAR_SIGNAL + STATUS_BAR_BATTERY + '</span>' +
    '</div>';
}

/* ---- Auto-render Bottom Nav ---- */
function renderBottomNavHTML(activeKey) {
  var items = [
    { label: '\uD648', icon: 'home', href: 'page-landing.html', key: 'landing' },
    { label: '\uAC80\uC0C9', icon: 'search', href: 'page-onboarding.html', key: 'onboarding' },
    { label: '\uC9C0\uB3C4', icon: 'map', href: 'page-results.html', key: 'results' },
    { label: '\uBE44\uAD50', icon: 'barChart', href: 'page-comparison.html', key: 'comparison' },
    { label: 'MY', icon: 'user', href: 'page-mypage.html', key: 'mypage' }
  ];
  var html = '<div class="phone-bottom-nav">';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var cls = 'nav-item' + (item.key === activeKey ? ' active' : '');
    html += '<a class="' + cls + '" href="' + item.href + '">';
    html += '<span class="nav-icon">' + ICONS[item.icon] + '</span>';
    html += item.label;
    html += '</a>';
  }
  html += '</div>';
  return html;
}

/* ---- Auto-init: Replace [data-bottom-nav] and [data-status-bar] ---- */
function initAutoRender() {
  // Auto-render bottom navs
  var navEls = document.querySelectorAll('[data-bottom-nav]');
  for (var i = 0; i < navEls.length; i++) {
    var activeKey = navEls[i].getAttribute('data-bottom-nav');
    navEls[i].outerHTML = renderBottomNavHTML(activeKey);
  }
  // Auto-render status bars
  var barEls = document.querySelectorAll('[data-status-bar]');
  for (var j = 0; j < barEls.length; j++) {
    var color = barEls[j].getAttribute('data-status-bar-color') || '';
    barEls[j].outerHTML = renderStatusBarHTML(color);
  }
}

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
    title: 'Patterns',
    items: [
      { label: 'Patterns', href: 'patterns.html' }
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
  'Patterns': '\uD328\uD134',
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
  'Empty': 'Empty States',
  'Patterns': '\uB3D9\uC758 \xB7 \uBA74\uCC45 \xB7 \uC124\uACC4 \uADFC\uAC70'
};

/* ---- BottomNav Link Mapping ---- */
var BOTTOM_NAV_MAP = {
  '\uD648': 'page-landing.html',
  '\uAC80\uC0C9': 'page-onboarding.html',
  '\uC9C0\uB3C4': 'page-results.html',
  '\uBE44\uAD50': 'page-comparison.html',
  'MY': 'page-mypage.html'
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
  btn.innerHTML = isDark
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> Light'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> Dark';
}

/* ---- Fullscreen Toggle ---- */
function toggleFullscreen() {
  document.documentElement.classList.toggle('fullscreen-mode');
  var btn = document.getElementById('fullscreenBtn');
  if (!btn) return;
  var isFs = document.documentElement.classList.contains('fullscreen-mode');
  btn.innerHTML = isFs
    ? icon('x', 14) + ' \uB2EB\uAE30'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> \uD480\uC2A4\uD06C\uB9B0';
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

/* ---- Factor Accordion ---- */
function toggleFactorAccordion(id) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

/* ---- Scroll Animation with IntersectionObserver ---- */
function initScrollAnimation() {
  // Handle [data-animate] elements (gauges, bars)
  var animEls = document.querySelectorAll('[data-animate]');
  // Handle .fade-in-on-scroll elements
  var fadeEls = document.querySelectorAll('.fade-in-on-scroll');

  if ('IntersectionObserver' in window) {
    var animObserver = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('animated');
          entries[i].target.dataset.animated = 'true';
          animObserver.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -50px 0px' });

    for (var i = 0; i < animEls.length; i++) {
      animObserver.observe(animEls[i]);
    }

    // Fade-in observer with stagger
    var fadeObserver = new IntersectionObserver(function(entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('visible');
          fadeObserver.unobserve(entries[j].target);
        }
      }
    }, { rootMargin: '0px 0px -30px 0px' });

    for (var k = 0; k < fadeEls.length; k++) {
      // Stagger delay
      fadeEls[k].style.transitionDelay = (k * 60) + 'ms';
      fadeObserver.observe(fadeEls[k]);
    }
  } else {
    // Fallback
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
  // Also handle fade-in
  var fadeEls = document.querySelectorAll('.fade-in-on-scroll:not(.visible)');
  for (var j = 0; j < fadeEls.length; j++) {
    var rect2 = fadeEls[j].getBoundingClientRect();
    if (rect2.top < window.innerHeight - 30) {
      fadeEls[j].classList.add('visible');
    }
  }
}

/* ---- Sort Chip Interaction (Results page) ---- */
function initSortChips() {
  var container = document.getElementById('sortChips');
  if (!container) return;

  var chips = container.querySelectorAll('.sort-chip-btn');
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function() {
      // Toggle active state
      for (var j = 0; j < chips.length; j++) {
        chips[j].classList.remove('active');
      }
      this.classList.add('active');

      var sortKey = this.getAttribute('data-sort');
      sortResultCards(sortKey);
      showToast(this.textContent.trim() + '\uC73C\uB85C \uC815\uB82C\uB428');
    });
  }
}

function sortResultCards(key) {
  var container = document.getElementById('resultCards');
  if (!container) return;

  var cards = Array.prototype.slice.call(container.querySelectorAll('.property-card'));
  if (cards.length === 0) return;

  cards.sort(function(a, b) {
    var valA = parseInt(a.getAttribute('data-' + key) || '0', 10);
    var valB = parseInt(b.getAttribute('data-' + key) || '0', 10);
    if (key === 'commute') return valA - valB; // Lower commute is better
    return valB - valA; // Higher score is better
  });

  // Re-order DOM and update rank badges + colors
  for (var i = 0; i < cards.length; i++) {
    container.appendChild(cards[i]);
    var badge = cards[i].querySelector('.rank-badge');
    if (badge) {
      badge.textContent = (i + 1);
      // Top 3 use accent, rest use neutral
      if (i < 3) {
        badge.classList.remove('rank-badge-neutral');
        badge.classList.add('rank-badge-accent');
      } else {
        badge.classList.remove('rank-badge-accent');
        badge.classList.add('rank-badge-neutral');
      }
    }
  }
}

/* ---- Auto-link BottomNav (legacy — kept for backward compat) ---- */
function initBottomNavLinks() {
  var navItems = document.querySelectorAll('.phone-bottom-nav .nav-item');
  for (var i = 0; i < navItems.length; i++) {
    var item = navItems[i];
    // Only set href if not already set
    if (item.getAttribute('href')) continue;
    // Extract text excluding .nav-icon children
    var label = '';
    for (var c = 0; c < item.childNodes.length; c++) {
      var node = item.childNodes[c];
      if (node.nodeType === 3) label += node.textContent;
    }
    label = label.trim();
    var href = BOTTOM_NAV_MAP[label];
    if (href) {
      item.setAttribute('href', href);
    }
  }
}

/* ---- Gauge CountUp Animation ---- */
function initCountUp() {
  var els = document.querySelectorAll('[data-countup]');
  if (!els.length) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          animateCountUp(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -50px 0px' });

    for (var i = 0; i < els.length; i++) {
      observer.observe(els[i]);
    }
  }
}

function animateCountUp(el) {
  var target = parseInt(el.getAttribute('data-countup'), 10);
  var duration = 800;
  var start = 0;
  var startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    var current = Math.round(start + (target - start) * eased);
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', function() {
  initDarkMode();
  initAutoRender();
  renderSidebar();
  initScrollAnimation();
  initSortChips();
  initBottomNavLinks();
  initCountUp();

  // Close sidebar on overlay click
  var overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);
});
