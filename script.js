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
  document.querySelector('#lab-demo')?.scrollIntoView({behavior:'smooth'});
}));
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const form = document.querySelector('#chat-form');
const input = document.querySelector('#chat-input');
const messages = document.querySelector('#chat-messages');
const status = document.querySelector('#connection-status');
const sendButton = form?.querySelector('button');
const configuredEndpoint = document.querySelector('meta[name="nexus-ai-endpoint"]')?.content;
const isVercelHost = location.hostname.endsWith('.vercel.app') || location.hostname === 'vercel.app';
const apiEndpoint = isVercelHost ? (configuredEndpoint || '/api/chat') : null;

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
  messages?.append(bubble);
  if (messages) messages.scrollTop = messages.scrollHeight;
}
function localReply(raw) {
  const q = raw.toLowerCase();
  if (/\b(hi|hello|hey|namaste|नमस्ते)\b/.test(q)) return 'Hello! Tell me what you want to create or solve. I can help with planning, writing, learning and website ideas.';
  if (q.includes('business') || q.includes('income') || q.includes('earn') || q.includes('paise')) return 'Demo guidance: choose one audience, validate one problem with 5 potential customers, create a small offer, and test whether people will pay before scaling. This is a local demo response, not a live model answer.';
  if (q.includes('website') || q.includes('html') || q.includes('coding')) return 'Website build sequence: define the main action, build responsive structure, wire interactions, add secure server endpoints, and test mobile layouts, accessibility and errors. This is a local demo response.';
  if (q.includes('plan') || q.includes('steps') || q.includes('project')) return 'Execution loop: DEFINE → BREAK INTO TASKS → BUILD THE SMALLEST VERSION → TEST → FIX THE BIGGEST FAILURE → REPEAT. This is a local demo response.';
  return 'This GitHub Pages version is in demo mode. Open the Vercel deployment for live AI, once its backend and model access are configured.';
}
async function requestAI(message, mode='chat') {
  if (!apiEndpoint) return {reply: localReply(message), demo: true};
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({message, mode})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'AI request failed (' + response.status + ')');
  if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('AI endpoint returned an invalid response');
  return {reply:data.reply, demo:false};
}
async function sendMessage(text, mode='chat') {
  const value = String(text || '').trim();
  if (!value || !messages || sendButton?.disabled) return;
  addMessage(value, 'user');
  if (input) { input.value = ''; input.style.height = 'auto'; }
  if (sendButton) sendButton.disabled = true;
  if (status) status.textContent = apiEndpoint ? 'Connecting to live AI…' : 'Demo mode · open Vercel deployment for live AI';
  try {
    const result = await requestAI(value, mode);
    addMessage(result.reply);
    if (status) status.textContent = result.demo ? 'Demo mode · local responses' : 'Connected · live AI';
  } catch (error) {
    addMessage('AI request failed: ' + error.message + '. Check backend deployment and AI Gateway access.', 'assistant', true);
    if (status) status.textContent = 'AI connection error';
  } finally {
    if (sendButton) sendButton.disabled = false;
    input?.focus();
  }
}
form?.addEventListener('submit', event => { event.preventDefault(); sendMessage(input.value); });
input?.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 110) + 'px'; });
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
document.querySelectorAll('[data-tool-prompt]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#studio')?.scrollIntoView({behavior:'smooth'});
  sendMessage(button.dataset.toolPrompt, 'tool');
}));
const automationInput = document.querySelector('#automation-input');
const automationButton = document.querySelector('#automation-run');
const automationStatus = document.querySelector('#automation-status');
automationButton?.addEventListener('click', async () => {
  const task = automationInput?.value.trim();
  if (!task) {
    if (automationStatus) automationStatus.textContent = 'Pehle workflow ka goal likho.';
    automationInput?.focus();
    return;
  }
  automationButton.disabled = true;
  automationButton.textContent = 'DESIGNING…';
  if (automationStatus) automationStatus.textContent = 'Creating workflow plan…';
  try {
    const result = await requestAI('Design a safe, practical automation workflow for this goal: ' + task + '. Return: objective, trigger, numbered steps, tools/integrations needed, approval points, failure handling, privacy risks, and a simple test plan. Do not claim to execute external actions.', 'automation');
    document.querySelector('#studio')?.scrollIntoView({behavior:'smooth'});
    addMessage('WORKFLOW DESIGN REQUEST: ' + task, 'user');
    addMessage(result.reply);
    if (status) status.textContent = result.demo ? 'Demo mode · local responses' : 'Connected · live AI';
    if (automationStatus) automationStatus.textContent = result.demo ? 'Demo response only · not an executed automation' : 'Workflow plan generated · no external action executed';
  } catch (error) {
    if (automationStatus) automationStatus.textContent = 'Could not create plan: ' + error.message;
  } finally {
    automationButton.disabled = false;
    automationButton.innerHTML = 'DESIGN WORKFLOW <b>→</b>';
  }
});
const range = document.querySelector('#field-range');
const fieldValue = document.querySelector('#field-value');
const fieldState = document.querySelector('#field-state');
const visual = document.querySelector('#quantum-visual');
range?.addEventListener('input', () => {
  const value = Number(range.value);
  if (fieldValue) fieldValue.textContent = value + '%';
  visual?.style.setProperty('--intensity', String(value / 100));
  if (fieldState) fieldState.textContent = value < 35 ? 'LOW ENERGY' : value < 75 ? 'COHERENT' : 'HIGH ENERGY';
});
