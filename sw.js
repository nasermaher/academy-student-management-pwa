// Service Worker for Offline Support
const CACHE_NAME = 'academy-sys-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './js/app.js',
    './js/state.js',
    './js/ui.js',
    './js/i18n.js',
    './js/modules/dashboard.js',
    './js/modules/settings.js',
    './js/modules/students.js',
    './js/modules/teachers.js',
    './js/modules/attendance.js',
    './js/modules/finance.js',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
