const toggle = document.querySelector('.menu');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  }));
}
document.querySelectorAll('[data-detail]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const notice = document.querySelector('#notice');
  if (notice) notice.textContent = link.dataset.detail;
  const target = document.querySelector('#lab-demo');
  if (target) target.scrollIntoView({behavior:'smooth'});
}));
document.querySelector('#year').textContent = new Date().getFullYear();

// AI Studio: safe local demo replies. Connect a server endpoint to enable real model responses.
const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-input');
const messages = document.querySelector('#chat-messages');
const status = document.querySelector('#connection-status');
const sendButton = form?.querySelector('button');
function addMessage(text, who='assistant', error=false) {
  const bubble = document.createElement('div');
  bubble.className = 'message ' + who + (error ? ' error' : '');
  if (who === 'assistant') {
    const label = document.createElement('span');
    label.className = 'message-label';
    label.textContent = 'NEXUS';
    bubble.append(label);
  }
  bubble.append(document.createTextNode(text));
  messages.append(bubble);
  messages.scrollTop = messages.scrollHeight;
}
function localReply(raw) {
  const q = raw.toLowerCase();
  if (/\b(hi|hello|hey|namaste|नमस्ते)\b/.test(q)) return 'Hello! Tell me what you want to create or solve. I can help with planning, writing, learning and website ideas.';
  if (q.includes('business') || q.includes('income') || q.includes('earn') || q.includes('paise')) return 'Start with a problem people already pay to solve.\n\n1. Pick one audience and one clear problem.\n2. Speak to 5 potential customers before building.\n3. Create a small paid offer or service.\n4. Test it with real users, track conversion, then improve.\n\nTell me your skills, budget and available time to make this specific.';
  if (q.includes('website') || q.includes('html') || q.includes('coding')) return 'A practical website build sequence:\n\n1. Define the one main user action.\n2. Build responsive HTML structure.\n3. Add CSS design and mobile layouts.\n4. Wire every button with JavaScript.\n5. Test links, keyboard access and mobile width.\n6. For AI or accounts, add a secure backend before launch.';
  if (q.includes('ai') || q.includes('artificial intelligence')) return 'Artificial intelligence is software designed to perform tasks that usually require human-like skills, such as language understanding, pattern recognition or generating content. AI can make mistakes, so verify important claims. What would you like to use AI for?';
  if (q.includes('plan') || q.includes('steps') || q.includes('project')) return 'Use this execution loop:\n\nDEFINE → BREAK INTO SMALL TASKS → BUILD THE SMALLEST WORKING VERSION → TEST WITH A REAL USER → FIX THE BIGGEST FAILURE → REPEAT.\n\nWrite the goal, deadline and constraints first. Then choose one measurable result for the first version.';
  if (q.includes('write') || q.includes('content') || q.includes('script')) return 'A useful content structure is: HOOK → SPECIFIC PROBLEM → PRACTICAL SOLUTION → EXAMPLE → ONE CLEAR CALL TO ACTION. Avoid unsupported claims and show a concrete example. Tell me the topic and audience for a tailored draft.';
  return 'I can help structure this, but this site is currently in local demo mode and is not connected to a live AI model. Try asking about AI, a website, a project plan, content writing or a business idea. For genuine model-generated answers, a secure server endpoint must be configured; API keys must never be placed in browser JavaScript.';
}
async function sendMessage(text) {
  const value = text.trim();
  if (!value || !messages) return;
  addMessage(value, 'user');
  input.value = '';
  input.style.height = 'auto';
  sendButton.disabled = true;
  try {
    // Configure a same-origin POST /api/chat endpoint on a server host to enable live AI.
    // GitHub Pages is static hosting and does not execute API routes.
    const endpoint = document.querySelector('meta[name="nexus-ai-endpoint"]')?.content;
    if (endpoint) {
      const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:value})});
      if (!response.ok) throw new Error('AI endpoint returned ' + response.status);
      const data = await response.json();
      if (typeof data.reply !== 'string') throw new Error('Unexpected AI response format');
      addMessage(data.reply);
      if (status) status.textContent = 'Connected · live AI endpoint';
    } else {
      await new Promise(resolve => setTimeout(resolve, 220));
      addMessage(localReply(value));
    }
  } catch (error) {
    addMessage('Live AI connection failed. The site is still available in demo mode. Check the server endpoint configuration.', 'assistant', true);
    if (status) status.textContent = 'Demo mode · live endpoint unavailable';
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
}
form?.addEventListener('submit', event => { event.preventDefault(); sendMessage(input.value); });
input?.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 110) + 'px'; });
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
const range = document.querySelector('#field-range');
const fieldValue = document.querySelector('#field-value');
const fieldState = document.querySelector('#field-state');
const visual = document.querySelector('#quantum-visual');
range?.addEventListener('input', () => {
  const value = Number(range.value);
  fieldValue.textContent = value + '%';
  visual.style.setProperty('--intensity', String(value / 100));
  fieldState.textContent = value < 35 ? 'LOW ENERGY' : value < 75 ? 'COHERENT' : 'HIGH ENERGY';
});
