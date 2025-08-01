/* globals Hammer */
(async function(){
  // Elements
  const tinder    = document.getElementById('tinder');
  const cards     = () => document.querySelectorAll('.tinder--card:not(.removed)');
  const status    = document.querySelector('.tinder--status');
  const saveBtn   = document.getElementById('saveUsername');
  const onboard   = document.getElementById('onboard');
  const fishImg   = document.getElementById('fishImage');
  const nameEl    = document.getElementById('fishName');
  const descEl    = document.getElementById('fishDescription');
  const descPanel = document.getElementById('descriptionPanel');
  const loveBtn   = document.getElementById('btnLove');
  const nopeBtn   = document.getElementById('btnNope');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsView = document.getElementById('settingsView');
  const closeSettings = document.getElementById('closeSettings');
  const downloadSite = document.getElementById('downloadSite');
  const exportBtn  = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');
  const resetBtn   = document.getElementById('resetBtn');
  const chatPanel  = document.getElementById('chatPanel');

  let fishList = [], currentId, profile, username;

  // Onboard
  saveBtn.onclick = async ()=>{
    username = document.getElementById('usernameInput').value.trim()||'You';
    await idbSet('meta',{key:'username',value:username});
    onboard.classList.add('hidden');
    await initFish();
    initCards();
  };

  // Load fish list
  async function initFish(){
    fishList = await fetch('fish/index.json').then(r=>r.json());
    showNext();
  }

  // Show next fish
  function showNext(){
    profile = getNextProfile();
    currentId = profile.id;
    fishImg.src = `fish/${currentId}.png`;
    nameEl.textContent = profile.name;
    descEl.textContent = profile.description;
  }
  function getNextProfile(){
    const id = fishList.shift();
    fishList.push(id);
    // fetch JSON synchronously (small)
    return JSON.parse(localStorage.getItem(`profile-${id}`) ||
      JSON.stringify(fetch(`fish/${id}.json`).then(r=>r.json())));
  }

  // Initialize Tinder cards z-index/position
  function initCards(){
    Array.from(cards()).forEach((card, idx)=>{
      card.style.zIndex = cards().length - idx;
      card.style.transform = `scale(${(20-idx)/20}) translateY(-${30*idx}px)`;
      card.style.opacity = (10-idx)/10;
    });
    tinder.classList.add('loaded');
  }

  // Hammer gesture
  cards().forEach(card => {
    const hammertime = new Hammer(card);
    hammertime.on('pan', e=>{
      card.classList.add('moving');
      tinder.classList.toggle('tinder_love', e.deltaX>0);
      tinder.classList.toggle('tinder_nope', e.deltaX<0);
      const rotate = e.deltaX*0.03* (e.deltaY/80);
      card.style.transform = `translate(${e.deltaX}px,${e.deltaY}px) rotate(${rotate}deg)`;
    });
    hammertime.on('panend', e=>{
      card.classList.remove('moving');
      tinder.classList.remove('tinder_love','tinder_nope');
      const moveOut = document.body.clientWidth;
      const keep = Math.abs(e.deltaX)<80 || Math.abs(e.velocityX)<0.5;
      card.classList.toggle('removed', !keep);
      if(!keep){
        card.style.transform = `translate(${e.deltaX>0?moveOut:-moveOut}px,${e.deltaY}px) rotate(${e.deltaX>0?-30:30}deg)`;
        idbSet('fish',{id:currentId,reacted:e.deltaX>0?'loved':'disliked',timestamp:Date.now()});
        // next fish
        card.addEventListener('transitionend', ()=>{
          card.classList.remove('removed');
          showNext();
          initCards();
        },{once:true});
      } else {
        card.style.transform = '';
      }
    });
  });

  // Buttons
  loveBtn.onclick = ()=>simulateSwipe(true);
  nopeBtn.onclick = ()=>simulateSwipe(false);

  function simulateSwipe(isLove){
    const card = cards()[0];
    if(!card) return;
    const moveOut = document.body.clientWidth*1.5;
    card.classList.add('removed');
    card.style.transform = `translate(${isLove?moveOut:-moveOut}px,-100px) rotate(${isLove?-30:30}deg)`;
    idbSet('fish',{id:currentId,reacted:isLove?'loved':'disliked',timestamp:Date.now()});
    card.addEventListener('transitionend', ()=>{
      showNext(); initCards();
    },{once:true});
  }

  // Reveal description on scroll
  document.getElementById('portraitFrame').addEventListener('wheel', e=>{
    if(e.deltaY>0) descPanel.classList.add('desc-visible');
  });

  // Settings toggle
  settingsBtn.onclick = ()=> settingsView.classList.remove('hidden');
  closeSettings.onclick = ()=> settingsView.classList.add('hidden');

  // Download site: just reload SW to cache all
  downloadSite.onclick = ()=>{
    if(navigator.serviceWorker.controller){
      navigator.serviceWorker.controller.postMessage({action:'cache-all'});
      alert('Site assets are being cached for offline use.');
    }
  };

  // Export/import/reset as before…
  exportBtn.onclick = async ()=>{/*…*/};
  importInput.onchange = async ()=>{/*…*/};
  resetBtn.onclick = ()=>{/*…*/};

})();
