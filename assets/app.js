/* globals Hammer */
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn       = document.getElementById('saveUsername');
  const onboard       = document.getElementById('onboard');
  const tinder        = document.getElementById('tinder');
  const fishCard      = document.getElementById('fishCard');
  const fishImg       = document.getElementById('fishImage');
  const nameEl        = document.getElementById('fishName');
  const descPanel     = document.getElementById('descriptionPanel');
  const descEl        = document.getElementById('fishDescription');
  const btnLove       = document.getElementById('btnLove');
  const btnNope       = document.getElementById('btnNope');
  const settingsBtn   = document.getElementById('settingsBtn');
  const settingsView  = document.getElementById('settingsView');
  const closeSettings = document.getElementById('closeSettings');
  const downloadSite  = document.getElementById('downloadSite');

  let fishList = [], currentIndex = 0, username = 'You';

  saveBtn.addEventListener('click', async () => {
    username = document.getElementById('usernameInput').value.trim() || 'You';
    await idbSet('meta', { key: 'username', value: username });
    onboard.classList.add('hidden');

    try {
      fishList = await fetch('fish/index.json').then(r => r.json());
    } catch {
      alert('Could not load fish/index.json');
      fishList = [];
    }

    tinder.classList.add('loaded');
    showFish(0);
    attachSwipe();
  });

  function showFish(idx) {
    if (!fishList.length) return;
    currentIndex = idx % fishList.length;
    const id = fishList[currentIndex];
    fetch(`fish/${id}.json`)
      .then(r => r.json())
      .then(p => {
        fishImg.src = `fish/${id}.jpg`;
        nameEl.textContent = p.name;
        descEl.textContent = p.description;
      });
  }

  function nextFish(direction) {
    // direction = true for love, false for nope
    const id = fishList[currentIndex];
    idbSet('fish', { id, reacted: direction ? 'loved' : 'disliked' });
    // reset description panel
    descPanel.classList.remove('desc-visible');
    showFish(currentIndex + 1);
  }

  function attachSwipe() {
    const hammer = new Hammer(fishCard);
    hammer.on('pan', ev => {
      fishCard.classList.add('moving');
      tinder.classList.toggle('tinder_love', ev.deltaX > 0);
      tinder.classList.toggle('tinder_nope', ev.deltaX < 0);
      const rot = ev.deltaX * 0.03 * (ev.deltaY / 80);
      fishCard.style.transform = `translate(${ev.deltaX}px,${ev.deltaY}px) rotate(${rot}deg)`;
    });
    hammer.on('panend', ev => {
      fishCard.classList.remove('moving');
      tinder.classList.remove('tinder_love', 'tinder_nope');
      const keep = Math.abs(ev.deltaX) < 80 || Math.abs(ev.velocityX) < 0.5;
      if (keep) {
        fishCard.style.transform = '';
      } else {
        const moveX = ev.deltaX > 0 ? window.innerWidth : -window.innerWidth;
        fishCard.style.transform = `translate(${moveX}px,${ev.deltaY}px) rotate(${ev.deltaX>0?-30:30}deg)`;
        fishCard.addEventListener('transitionend', () => {
          fishCard.style.transform = '';
          nextFish(ev.deltaX > 0);
        }, { once: true });
      }
    });
  }

  // Buttons
  btnLove.addEventListener('click', () => nextFish(true));
  btnNope.addEventListener('click', () => nextFish(false));

  // Scroll reveals description
  document.getElementById('portraitFrame').addEventListener('wheel', e => {
    if (e.deltaY > 0) descPanel.classList.add('desc-visible');
  });

  // Settings panel
  settingsBtn.addEventListener('click', () => settingsView.classList.remove('hidden'));
  closeSettings.addEventListener('click', () => settingsView.classList.add('hidden'));
  downloadSite.addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'cache-all' });
      alert('Caching site for offline use...');
    }
  });
});
