# Quantum Nexus

A responsive futuristic landing page and browser-based concept demo, built with HTML, CSS and vanilla JavaScript.

## Included
- Responsive navigation and layouts for mobile and desktop
- CSS-built cosmic hero artwork, cards and animated visual elements
- AI Studio chat UI with local demo responses and suggested prompts
- Quantum-inspired probability-field visual slider
- Curated link to NASA's universe guide
- Accessible form labels, status text, and reduced-motion support

## Current AI status — important
The AI Studio currently uses **local demo responses**. It is not connected to a real AI model by default. GitHub Pages only hosts static files and cannot execute a server API route. To enable live model responses:
1. Deploy a backend endpoint (for example, on a server host) at `POST /api/chat`.
2. Keep the model provider API key in the server's environment variables. Never put it in `script.js` or other public files.
3. Have the endpoint accept JSON `{"message":"..."}` and return JSON `{"reply":"..."}`.
4. Add a `<meta name="nexus-ai-endpoint" content="https://YOUR-SERVER/api/chat">` tag in `index.html`, using your real HTTPS endpoint.
5. Configure CORS, rate limiting, input size limits, and usage limits on the backend.

## Publish with GitHub Pages
Repository Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save. After the build completes, open the published URL and hard-refresh if the browser caches old CSS/JS.

## Testing checklist
- Open the published site on desktop and mobile.
- Test every navigation link and each AI Studio suggestion.
- Submit a custom prompt; demo responses should appear in the chat.
- Move the Quantum Lab slider and check its value/state updates.
- Check the browser console for errors.
- Live AI is not considered tested until a real secured backend endpoint has been configured.
