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
  (function(){
  const script = [
    { t:"00:00.2", tag:"info", stage:0, status:"idle",   mitre:null,        html:"external port sweep observed from <b>203.0.113.44</b>" },
    { t:"00:01.8", tag:"warn", stage:1, status:"active", mitre:"T1566",     html:"inbound mail flagged — invoice_0417.docm attachment" },
    { t:"00:03.1", tag:"warn", stage:2, status:"active", mitre:"T1204.002", html:"user opened attachment, macro spawned <b>powershell.exe</b>" },
    { t:"00:04.6", tag:"alert", stage:3, status:"alert", mitre:"T1071",     html:"beacon to <b>185.220.101.7</b> matches known C2 IOC" },
    { t:"00:05.4", tag:"alert", stage:4, status:"alert", mitre:"T1059.001", html:"escalating — pulling proc tree + Sysmon EID 1/3/11" },
    { t:"00:07.0", tag:"info", stage:4, status:"active", mitre:null,        html:"parent-child chain confirms single-host compromise" },
    { t:"00:08.9", tag:"safe", stage:5, status:"safe",   mitre:"T1490",     html:"host isolated via EDR, IOC pushed to blocklist" },
    { t:"00:10.1", tag:"safe", stage:5, status:"safe",   mitre:null,        html:"<b>incident closed</b> — MTTR 9m 40s" },
  ];

  const consoleEl = document.getElementById('kcConsole');
  const statusEl = document.getElementById('kcStatus');
  const stageEls = Array.from(document.querySelectorAll('.kc-stage'));
  const mitreEl = document.getElementById('kcMitre');
  const replayBtn = document.getElementById('kcReplay');
  let timers = [];
  let mitreSeen = new Set();

  const statusMap = {
    idle:   { text:"STANDBY",       cls:"state-idle" },
    active: { text:"MONITORING",    cls:"state-active" },
    alert:  { text:"ALERT ACTIVE",  cls:"state-alert" },
    safe:   { text:"CONTAINED",     cls:"state-safe" },
  };

  function setStageState(idx){
    stageEls.forEach((el, i) => {
      el.classList.remove('done','current','critical');
      if (i < idx) el.classList.add('done');
    });
    const cur = stageEls[idx];
    if (!cur) return;
    const isAlert = script.find(s => s.stage === idx && s.tag === 'alert');
    cur.classList.add(isAlert ? 'critical' : 'current');
  }

  function setStatus(state){
    const s = statusMap[state];
    statusEl.textContent = s.text;
    statusEl.className = 'kc-status ' + s.cls;
  }

  function addMitre(id){
    if (!id || mitreSeen.has(id)) return;
    mitreSeen.add(id);
    const span = document.createElement('span');
    span.textContent = id;
    mitreEl.appendChild(span);
  }

  function reset(){
    timers.forEach(clearTimeout);
    timers = [];
    consoleEl.innerHTML = '';
    mitreEl.innerHTML = '';
    mitreSeen = new Set();
    stageEls.forEach(el => el.classList.remove('done','current','critical'));
    setStatus('idle');
  }

  function play(){
    reset();
    let delay = 300;
    script.forEach((line, i) => {
      delay += 650;
      timers.push(setTimeout(() => {
        setStageState(line.stage);
        setStatus(line.status);
        addMitre(line.mitre);

        const row = document.createElement('div');
        row.className = 'kc-log-line';
        row.innerHTML = `<span class="kc-log-time">${line.t}</span><span class="kc-log-tag tag-${line.tag}">${line.tag.toUpperCase()}</span><span class="kc-log-text">${line.html}</span>`;
        if (i === script.length - 1) {
          const cursor = document.createElement('span');
          cursor.className = 'kc-cursor';
          row.appendChild(cursor);
        }
        consoleEl.appendChild(row);
        consoleEl.scrollTop = consoleEl.scrollHeight;
      }, delay));
    });

    timers.push(setTimeout(play, delay + 3800));
  }

  replayBtn.addEventListener('click', play);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        play();
        io.disconnect();
      }
    });
  }, { threshold: 0.4 });
  const kcFrame = document.querySelector('.kc-frame');
  if (kcFrame) io.observe(kcFrame);
})();
}
(function(){
  const lines = [
    "Everything is ready. Just waiting for you to trust me.",
    "Threat hunting, log analysis, incident response — all set.",
    "One message away from securing your systems."
  ];
  const el = document.getElementById('twText');
  if (!el) return;

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick(){
    const current = lines[lineIndex];
    if (!deleting){
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length){
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0){
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
      }
    }
    setTimeout(tick, deleting ? 30 : 55);
  }
  tick();
})();
