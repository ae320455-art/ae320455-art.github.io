// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Signature element: simulated live SOC log feed
const logLines = [
  { lvl: 'info', text: 'Sysmon EventID 1 — process create: powershell.exe' },
  { lvl: 'warn', text: 'Splunk alert — unusual outbound traffic (port 4444)' },
  { lvl: 'info', text: 'Wazuh — Sigma rule matched: suspicious LOLBIN usage' },
  { lvl: 'crit', text: 'IDS/Snort — signature hit: possible C2 beacon' },
  { lvl: 'info', text: 'Volatility — scanning memory image for injected code' },
  { lvl: 'warn', text: 'Windows Event 4625 — multiple failed logon attempts' },
  { lvl: 'info', text: 'IOC extracted — hash matched known malware family' },
  { lvl: 'crit', text: 'Lateral movement detected — mapped to MITRE T1021' },
  { lvl: 'info', text: 'Case closed — incident timeline documented' },
];

const consoleBody = document.getElementById('consoleBody');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function timestamp() {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function renderStatic() {
  if (!consoleBody) return;
  consoleBody.innerHTML = logLines
    .map(line => {
      const lvlClass = `lvl-${line.lvl}`;
      return `<div class="console-line" style="opacity:1"><span class="ts">[${timestamp()}]</span> <span class="${lvlClass}">${line.lvl.toUpperCase()}</span> ${line.text}</div>`;
    })
    .join('');
}

function typeLogFeed() {
  if (!consoleBody) return;
  let i = 0;

  function addLine() {
    if (i >= logLines.length) {
      // loop: clear and restart after a pause
      setTimeout(() => {
        consoleBody.innerHTML = '';
        i = 0;
        addLine();
      }, 4000);
      return;
    }
    const line = logLines[i];
    const div = document.createElement('div');
    div.className = 'console-line';
    div.innerHTML = `<span class="ts">[${timestamp()}]</span> <span class="lvl-${line.lvl}">${line.lvl.toUpperCase()}</span> ${line.text}`;
    consoleBody.appendChild(div);

    // keep only the last 8 lines visible
    while (consoleBody.children.length > 8) {
      consoleBody.removeChild(consoleBody.firstChild);
    }

    i++;
    setTimeout(addLine, 1100);
  }
  addLine();
}

if (consoleBody) {
  if (reduceMotion) {
    renderStatic();
  } else {
    typeLogFeed();
  }
}
