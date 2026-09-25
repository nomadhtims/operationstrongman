const CACHE='operation-strongman-v2.6';
const ASSETS=["./","./index.html","./style.css","./app-core.js","./app-render.js","./app-events.js","./manifest.json","./default-plan-meta.json","./plan-template.json","./icons/icon.svg","./plan-handover.json","./plan-w1.json","./plan-w2.json","./plan-w3.json","./plan-w4.json","./plan-taper.json"];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const networkFirst = event.request.mode==='navigate' || /\.(?:js|json|html)$/.test(url.pathname);

  if(networkFirst){
    event.respondWith(
      fetch(event.request,{cache:'no-store'}).then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(c=>c.put(event.request,copy));
        }
        return response;
      }).catch(async()=>{
        const cached=await caches.match(event.request);
        if(cached) return cached;
        if(event.request.mode==='navigate') return caches.match('./index.html');
        throw new Error('Offline and asset not cached');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response && response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(c=>c.put(event.request,copy));
      }
      return response;
    }))
  );
});
