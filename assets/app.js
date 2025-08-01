/* ---------- Globals & Elements ---------- */
let fishIndex = 0, fishList = [];
let username = '';
const onboard = document.getElementById('onboard');
const usernameInput = document.getElementById('usernameInput');
const saveUsername = document.getElementById('saveUsername');
const cardView = document.getElementById('cardView');
const fishImg = document.getElementById('fishImage');
const loveBtn = document.getElementById('loveBtn');
const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const chatBtn = document.getElementById('chatBtn');
const chatPanel = document.getElementById('chatPanel');
const closeChat = document.getElementById('closeChat');
const chatHistoryEl = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const sendChat = document.getElementById('sendChat');
// History & Settings
const historyView = document.getElementById('historyView');
const closeHistory = document.getElementById('closeHistory');
const historyCards = document.getElementById('historyCards');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const settingsView = document.getElementById('settingsView');
const closeSettings = document.getElementById('closeSettings');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');
const resetBtn = document.getElementById('resetBtn');

// Utility to fetch fish index file
async function loadFishIndex() {
  fishList = await fetch('fish/index.json').then(r => r.json());
}

// Onboard
saveUsername.onclick = async () => {
  username = usernameInput.value.trim() || 'You';
  await idbSet('meta', { key:'username', value:username });
  onboard.classList.add('hidden');
  await loadFishIndex();
  showNextFish();
};

// Show next fish
async function showNextFish() {
  if (fishIndex >= fishList.length) {
    fishIndex = 0; // loop or stop
  }
  const id = fishList[fishIndex++];
  const profile = await fetch(`fish/${id}.json`).then(r => r.json());
  const img = `fish/${id}.png`;
  fishImg.src = img;
  fishImg.onload = () => document.getElementById('fishCard').dataset.id = id;
}

// Handle reactions
async function react(type) {
  const id = document.getElementById('fishCard').dataset.id;
  // save in DB
  await idbSet('fish', { id, reacted: type, timestamp: Date.now() });
  showNextFish();
}
loveBtn.onclick    = () => react('loved');
likeBtn.onclick    = () => react('liked');
dislikeBtn.onclick = () => react('disliked');
chatBtn.onclick    = () => openChat();

// Chat panel
function openChat() {
  const id = document.getElementById('fishCard').dataset.id;
  chatPanel.classList.add('open');
  chatHistoryEl.innerHTML = '';
  idbGet('chats', id).then(rec => {
    (rec?.msgs||[]).forEach(m => appendChat(m.user, m.text));
  });
}
closeChat.onclick = () => chatPanel.classList.remove('open');

sendChat.onclick = async () => {
  const id = document.getElementById('fishCard').dataset.id;
  const userMsg = chatInput.value.trim();
