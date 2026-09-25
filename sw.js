const CACHE='operation-strongman-v2.1';
const ASSETS=["./","./index.html","./style.css","./app-core.js","./app-render.js","./app-events.js","./manifest.json","./default-plan-meta.json","./plan-template.json","./icons/icon.svg","./plan-handover.json","./plan-w1.json","./plan-w2.json","./plan-w3.json","./plan-w4.json","./plan-taper.json"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return response;}).catch(()=>caches.match('./index.html'))));});
