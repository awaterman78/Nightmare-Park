(() => {
  'use strict';

  const SAVE_KEY = 'nightmare_park_v8_progress';
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const shell = document.getElementById('shell');
  const overlay = document.getElementById('overlay');
  const overlayPanel = document.getElementById('overlayPanel');
  const toastEl = document.getElementById('toast');
  const battleNameEl = document.getElementById('battleName');
  const enemyCoreText = document.getElementById('enemyCoreText');
  const playerCoreText = document.getElementById('playerCoreText');
  const skullText = document.getElementById('skullText');
  const energyFill = document.getElementById('energyFill');
  const energyText = document.getElementById('energyText');
  const graveCard = document.getElementById('graveCard');
  const candleInfo = document.getElementById('candleInfo');
  const resetBtn = document.getElementById('resetBtn');

  let W = 390;
  let H = 780;
  let dpr = 1;
  let lastTime = performance.now();
  let toastTimer = 0;
  let pointer = { x: W / 2, y: H * 0.74, active: false };

  const lanes = ['left', 'centre', 'right'];
  const battleDefs = [
    {
      name: 'Grave Goblin Training',
      subtitle: 'Learn the rush. Break the shrine.',
      coreHp: 420,
      towerHp: 150,
      reward: 10,
      waves: [
        { t: 2.5, enemies: [['enemyGoblin', 'centre']] },
        { t: 9, enemies: [['enemyGoblin', 'left'], ['enemyGoblin', 'right']] },
        { t: 18, enemies: [['enemyGoblin', 'centre'], ['enemyGoblin', 'centre']] },
        { t: 30, enemies: [['enemyGoblin', 'left'], ['enemyGoblin', 'centre'], ['enemyGoblin', 'right']] },
        { t: 45, enemies: [['enemyGoblin', 'left'], ['enemyGoblin', 'right'], ['enemyGoblin', 'centre']] }
      ]
    },
    {
      name: 'Candle Trouble',
      subtitle: 'Imps throw fire from behind the line.',
      coreHp: 500,
      towerHp: 180,
      reward: 15,
      waves: [
        { t: 2, enemies: [['enemyGoblin', 'centre'], ['candleImp', 'right']] },
        { t: 10, enemies: [['candleImp', 'left'], ['enemyGoblin', 'centre']] },
        { t: 20, enemies: [['enemyGoblin', 'left'], ['enemyGoblin', 'right'], ['candleImp', 'centre']] },
        { t: 34, enemies: [['candleImp', 'left'], ['candleImp', 'right'], ['enemyGoblin', 'centre']] },
        { t: 50, enemies: [['enemyGoblin', 'left'], ['enemyGoblin', 'centre'], ['enemyGoblin', 'right'], ['candleImp', 'centre']] }
      ]
    },
    {
      name: 'Gate Cracker',
      subtitle: 'Harder waves. Your upgrades matter now.',
      coreHp: 600,
      towerHp: 210,
      reward: 22,
      waves: [
        { t: 2, enemies: [['enemyGoblin', 'left'], ['enemyGoblin', 'right']] },
        { t: 9, enemies: [['candleImp', 'left'], ['candleImp', 'right']] },
        { t: 18, enemies: [['bruteGoblin', 'centre'], ['candleImp', 'right']] },
        { t: 31, enemies: [['enemyGoblin', 'left'], ['bruteGoblin', 'centre'], ['enemyGoblin', 'right']] },
        { t: 47, enemies: [['bruteGoblin', 'left'], ['candleImp', 'centre'], ['bruteGoblin', 'right']] },
        { t: 64, enemies: [['bruteGoblin', 'centre'], ['enemyGoblin', 'left'], ['enemyGoblin', 'right'], ['candleImp', 'centre']] }
      ]
    }
  ];

  const defaultProgress = () => ({
    currentBattle: 0,
    wins: 0,
    skulls: 0,
    coins: 0,
    upgrades: { damage: 0, speed: 0, health: 0 },
    seenIntro: false
  });

  let progress = loadProgress();
  let state = makeEmptyState('menu');

  function loadProgress() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      return {
        ...defaultProgress(),
        ...parsed,
        upgrades: { ...defaultProgress().upgrades, ...(parsed.upgrades || {}) }
      };
    } catch (err) {
      return defaultProgress();
    }
  }

  function saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  }

  function makeEmptyState(mode) {
    return {
      mode,
      battle: null,
      difficulty: 1,
      time: 0,
      energy: 0,
      energyRate: 1,
      units: [],
      structures: [],
      particles: [],
      projectiles: [],
      slashes: [],
      spawnedWaves: new Set(),
      nextUnitId: 1,
      shake: 0,
      selectedCard: 'graveGoblin'
    };
  }

  function resize() {
    const rect = shell.getBoundingClientRect();
    W = Math.max(320, rect.width);
    H = Math.max(520, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state && state.structures) layoutStructures();
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function length(dx, dy) { return Math.hypot(dx, dy); }
  function nowish() { return performance.now() / 1000; }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function pickLaneX(lane) {
    if (lane === 'left') return W * 0.25;
    if (lane === 'right') return W * 0.75;
    return W * 0.5;
  }
  function bottomPlayLimit() { return H - (132 + safeBottomPad()); }
  function safeBottomPad() { return 16; }
  function riverTop() { return H * 0.445; }
  function riverBottom() { return H * 0.525; }

  function layoutStructures() {
    for (const s of state.structures) {
      const bottom = bottomPlayLimit();
      if (s.team === 'enemy' && s.kind === 'core') {
        s.x = W * 0.5; s.y = 118; s.r = 34; s.w = 88; s.h = 48;
      } else if (s.team === 'enemy') {
        s.x = pickLaneX(s.lane); s.y = 214; s.r = 25; s.w = 52; s.h = 58;
      } else if (s.team === 'player' && s.kind === 'core') {
        s.x = W * 0.5; s.y = bottom - 66; s.r = 38; s.w = 102; s.h = 56;
      } else if (s.team === 'player') {
        s.x = pickLaneX(s.lane); s.y = bottom - 184; s.r = 25; s.w = 52; s.h = 58;
      }
    }
  }

  function getBattleMeta() {
    const battle = battleDefs[progress.currentBattle % battleDefs.length];
    const loop = Math.floor(progress.wins / battleDefs.length);
    const difficulty = 1 + loop * 0.22;
    return { battle, difficulty, loop };
  }

  function createStructure(team, kind, lane, hp, attackDamage, attackRange) {
    return {
      team,
      kind,
      lane,
      hp,
      maxHp: hp,
      attackDamage,
      attackRange,
      cooldown: rand(0.1, 0.7),
      alive: true,
      x: 0,
      y: 0,
      r: 28,
      w: 60,
      h: 60
    };
  }

  function startBattle() {
    const { battle, difficulty } = getBattleMeta();
    state = makeEmptyState('battle');
    state.battle = battle;
    state.difficulty = difficulty;
    state.energy = 5;
    state.energyRate = 1.0 + Math.min(0.6, progress.upgrades.speed * 0.04);

    const enemyCoreHp = Math.round(battle.coreHp * difficulty);
    const enemyTowerHp = Math.round(battle.towerHp * difficulty);
    const playerCoreHp = Math.round(560 + progress.upgrades.health * 38);
    const playerTowerHp = Math.round(185 + progress.upgrades.health * 20);

    state.structures = [
      createStructure('enemy', 'core', 'centre', enemyCoreHp, 0, 0),
      createStructure('enemy', 'tower', 'left', enemyTowerHp, 11 * difficulty, 138),
      createStructure('enemy', 'tower', 'right', enemyTowerHp, 11 * difficulty, 138),
      createStructure('player', 'core', 'centre', playerCoreHp, 0, 0),
      createStructure('player', 'tower', 'left', playerTowerHp, 12 + progress.upgrades.damage * 0.6, 142),
      createStructure('player', 'tower', 'right', playerTowerHp, 12 + progress.upgrades.damage * 0.6, 142)
    ];
    layoutStructures();
    hideOverlay();
    showToast('Battle started. Tap the goblin card, then tap your half.');
    updateHud();
  }

  function unitStats(type, team) {
    if (type === 'graveGoblin') {
      return {
        label: 'Grave Goblin',
        hp: 86 * (1 + progress.upgrades.health * 0.16),
        damage: 14 * (1 + progress.upgrades.damage * 0.15),
        speed: 64 * (1 + progress.upgrades.speed * 0.115),
        range: 20,
        attackDelay: 0.48,
        radius: 13,
        ranged: false
      };
    }
    if (type === 'candleImp') {
      return {
        label: 'Candle Imp',
        hp: 54 * state.difficulty,
        damage: 7.5 * state.difficulty,
        speed: 38,
        range: 104,
        attackDelay: 1.1,
        radius: 12,
        ranged: true
      };
    }
    if (type === 'bruteGoblin') {
      return {
        label: 'Bone Brute',
        hp: 125 * state.difficulty,
        damage: 15 * state.difficulty,
        speed: 33,
        range: 22,
        attackDelay: 0.78,
        radius: 17,
        ranged: false
      };
    }
    return {
      label: 'Enemy Goblin',
      hp: 72 * state.difficulty,
      damage: 9 * state.difficulty,
      speed: 47,
      range: 20,
      attackDelay: 0.62,
      radius: 13,
      ranged: false
    };
  }

  function spawnUnit(team, type, x, y) {
    const stats = unitStats(type, team);
    const unit = {
      id: state.nextUnitId++,
      team,
      type,
      label: stats.label,
      x,
      y,
      vx: 0,
      vy: 0,
      hp: stats.hp,
      maxHp: stats.hp,
      damage: stats.damage,
      speed: stats.speed,
      range: stats.range,
      attackDelay: stats.attackDelay,
      radius: stats.radius,
      ranged: stats.ranged,
      cooldown: rand(0, 0.35),
      wobble: rand(0, Math.PI * 2),
      hitFlash: 0
    };
    state.units.push(unit);
    burst(x, y, team === 'player' ? '#84ff97' : '#ff716e', 10, 70);
    return unit;
  }

  function spawnEnemy(type, lane) {
    const x = pickLaneX(lane) + rand(-18, 18);
    const y = 150 + rand(-8, 14);
    spawnUnit('enemy', type, x, y);
  }

  function deployGraveGoblin(x, y) {
    const cost = 2;
    if (state.mode !== 'battle') return;
    if (!validDeploy(x, y)) {
      showToast('Deploy in your half, below the cursed river.');
      buzz(35);
      return;
    }
    if (state.energy < cost) {
      showToast('Not enough energy. Let it refill.');
      buzz(25);
      return;
    }
    state.energy -= cost;
    spawnUnit('player', 'graveGoblin', x, y);
    state.shake = Math.max(state.shake, 3);
    updateHud();
  }

  function validDeploy(x, y) {
    return x > 18 && x < W - 18 && y > riverBottom() + 12 && y < bottomPlayLimit() - 20;
  }

  function update(dt) {
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) toastEl.classList.remove('show');
    }
    if (state.mode !== 'battle') {
      updateEffects(dt);
      return;
    }
    state.time += dt;
    const suddenDeath = state.time > 58 ? 0.65 : 0;
    state.energy = clamp(state.energy + (state.energyRate + suddenDeath) * dt, 0, 10);

    spawnWaves();
    updateStructures(dt);
    updateUnits(dt);
    updateProjectiles(dt);
    updateEffects(dt);
    checkBattleEnd();
    updateHud();
  }

  function spawnWaves() {
    const waves = state.battle.waves;
    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i];
      if (state.time >= wave.t && !state.spawnedWaves.has(i)) {
        state.spawnedWaves.add(i);
        for (let e = 0; e < wave.enemies.length; e++) {
          const [type, lane] = wave.enemies[e];
          setTimeout(() => {
            if (state.mode === 'battle') spawnEnemy(type, lane);
          }, e * 240);
        }
        const waveNo = state.spawnedWaves.size;
        showToast(`Wave ${waveNo}: ${wave.enemies.length} enemy${wave.enemies.length > 1 ? 'ies' : 'y'} incoming`);
      }
    }
  }

  function updateStructures(dt) {
    for (const s of state.structures) {
      if (s.hp <= 0 || s.kind !== 'tower') continue;
      s.cooldown -= dt;
      if (s.cooldown > 0) continue;
      const target = nearestEnemyUnit(s.team, s.x, s.y, s.attackRange);
      if (target) {
        s.cooldown = 0.82;
        shootProjectile(s, target, s.attackDamage, s.team === 'player' ? '#b8ff74' : '#ff6f66', 'bolt');
      }
    }
  }

  function updateUnits(dt) {
    for (const u of state.units) {
      if (u.hp <= 0) continue;
      u.cooldown -= dt;
      u.hitFlash = Math.max(0, u.hitFlash - dt * 5);
      const target = findTarget(u);
      if (!target) continue;
      const dx = target.x - u.x;
      const dy = target.y - u.y;
      const d = Math.max(0.001, length(dx, dy));
      const reach = u.range + (target.radius || target.r || 16);
      if (d > reach) {
        const move = u.speed * dt;
        u.x += (dx / d) * move;
        u.y += (dy / d) * move;
        u.vx = dx / d;
        u.vy = dy / d;
      } else if (u.cooldown <= 0) {
        u.cooldown = u.attackDelay;
        if (u.ranged) {
          shootProjectile(u, target, u.damage, '#ff9c3f', 'flame');
        } else {
          dealDamage(target, u.damage, u);
          slash(u, target);
        }
      }
    }
    state.units = state.units.filter(u => {
      if (u.hp > 0) return true;
      deathPuff(u.x, u.y, u.team);
      return false;
    });
  }

  function updateProjectiles(dt) {
    for (const p of state.projectiles) {
      if (!p.target || p.target.hp <= 0) { p.dead = true; continue; }
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const d = Math.max(0.001, length(dx, dy));
      const step = p.speed * dt;
      if (d <= step + (p.target.radius || p.target.r || 14) * 0.55) {
        p.dead = true;
        dealDamage(p.target, p.damage, p);
        burst(p.target.x, p.target.y, p.color, p.type === 'flame' ? 8 : 5, p.type === 'flame' ? 58 : 35);
      } else {
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
      }
    }
    state.projectiles = state.projectiles.filter(p => !p.dead);
  }

  function updateEffects(dt) {
    for (const p of state.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 30 * dt;
      p.size *= (1 - 0.65 * dt);
    }
    state.particles = state.particles.filter(p => p.life > 0 && p.size > 0.2);
    for (const s of state.slashes) s.life -= dt;
    state.slashes = state.slashes.filter(s => s.life > 0);
    state.shake = Math.max(0, state.shake - dt * 11);
  }

  function findTarget(u) {
    const enemyUnits = state.units.filter(o => o.team !== u.team && o.hp > 0);
    let best = null;
    let bestScore = Infinity;
    for (const o of enemyUnits) {
      const d = length(o.x - u.x, o.y - u.y);
      if (d < bestScore) { bestScore = d; best = o; }
    }
    const enemyStructures = state.structures.filter(s => s.team !== u.team && s.hp > 0);
    for (const s of enemyStructures) {
      const d = length(s.x - u.x, s.y - u.y) + (s.kind === 'core' ? 26 : 0);
      if (!best || d < bestScore * 1.25) { bestScore = d; best = s; }
    }
    return best;
  }

  function nearestEnemyUnit(team, x, y, range) {
    let best = null;
    let bestD = range;
    for (const u of state.units) {
      if (u.team === team || u.hp <= 0) continue;
      const d = length(u.x - x, u.y - y);
      if (d < bestD) { bestD = d; best = u; }
    }
    return best;
  }

  function dealDamage(target, damage, source) {
    if (!target || target.hp <= 0) return;
    target.hp -= damage;
    target.hitFlash = 1;
    state.shake = Math.max(state.shake, target.kind === 'core' ? 4 : 2);
    floatingNumber(target.x, target.y - (target.r || target.radius || 14) - 8, Math.round(damage), source.team === 'player' ? '#d4ff82' : '#ff7474');
    if (target.hp <= 0) {
      target.hp = 0;
      if (target.kind) {
        burst(target.x, target.y, target.team === 'player' ? '#84ff97' : '#ff6868', 26, 125);
      }
    }
  }

  function shootProjectile(source, target, damage, color, type) {
    state.projectiles.push({
      x: source.x,
      y: source.y,
      target,
      damage,
      color,
      type,
      speed: type === 'flame' ? 220 : 310,
      team: source.team,
      radius: type === 'flame' ? 5 : 3
    });
  }

  function slash(u, target) {
    state.slashes.push({ x1: u.x, y1: u.y, x2: target.x, y2: target.y, life: 0.13, color: u.team === 'player' ? '#d7ff78' : '#ff7777' });
  }

  function burst(x, y, color, count, power) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(power * 0.25, power);
      state.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, size: rand(2, 5), life: rand(0.25, 0.75), color, text: null });
    }
  }

  function deathPuff(x, y, team) {
    burst(x, y, team === 'player' ? '#84ff97' : '#ff6868', 14, 80);
  }

  function floatingNumber(x, y, text, color) {
    state.particles.push({ x, y, vx: rand(-8, 8), vy: rand(-48, -30), size: 13, life: 0.7, color, text: String(text) });
  }

  function checkBattleEnd() {
    const enemyCore = state.structures.find(s => s.team === 'enemy' && s.kind === 'core');
    const playerCore = state.structures.find(s => s.team === 'player' && s.kind === 'core');
    if (enemyCore && enemyCore.hp <= 0) winBattle();
    if (playerCore && playerCore.hp <= 0) loseBattle();
  }

  function winBattle() {
    if (state.mode !== 'battle') return;
    state.mode = 'reward';
    const reward = Math.round(state.battle.reward * state.difficulty);
    progress.skulls += reward;
    progress.coins += reward;
    progress.wins += 1;
    saveProgress();
    showRewardOverlay(reward);
  }

  function loseBattle() {
    if (state.mode !== 'battle') return;
    state.mode = 'gameover';
    showLoseOverlay();
  }

  function showMenu() {
    const { battle, loop } = getBattleMeta();
    const goblinLevel = 1 + progress.upgrades.damage + progress.upgrades.speed + progress.upgrades.health;
    overlayPanel.innerHTML = `
      <h2>Monster Royale v8</h2>
      <p><b>Arena One:</b> Grave Goblin vs Candle Imps. This is now a proper battle loop: deploy, defend, break the shrine, earn skulls, upgrade, repeat.</p>
      <div class="bigStatGrid">
        <div><span>Next Battle</span><strong>${escapeHtml(battle.name)}</strong></div>
        <div><span>Goblin Level</span><strong>${goblinLevel}</strong></div>
        <div><span>Skulls</span><strong>${progress.skulls}</strong></div>
      </div>
      <p><b>Current buffs:</b> Bone damage +${progress.upgrades.damage * 15}%, Quick Scuttle +${progress.upgrades.speed * 12}%, Grave Grit +${progress.upgrades.health * 16}%.</p>
      ${loop > 0 ? `<p>The night has looped ${loop} time${loop === 1 ? '' : 's'}, so enemy health and damage are scaling.</p>` : ''}
      <button class="primaryButton" id="startBattleBtn">Start Battle</button>
      <button class="secondaryButton" id="howBtn">How to play</button>
      <p class="tiny">Mobile safe. No Unity loader. No cloud build. Just the playable lab.</p>
    `;
    document.getElementById('startBattleBtn').addEventListener('click', startBattle);
    document.getElementById('howBtn').addEventListener('click', showHowToPlay);
    overlay.classList.add('visible');
    updateHud();
  }

  function showHowToPlay() {
    overlayPanel.innerHTML = `
      <h2>How to play</h2>
      <p>Tap the <b>Grave Goblin</b> card, then tap anywhere in your half of the arena below the green cursed river.</p>
      <p>Your goblins run automatically. They fight enemies first, then towers, then the enemy core.</p>
      <p>Win battles to choose one of three permanent upgrades. The browser saves your progress locally on this phone.</p>
      <button class="primaryButton" id="backBtn">Back to battle</button>
    `;
    document.getElementById('backBtn').addEventListener('click', showMenu);
  }

  function showRewardOverlay(reward) {
    overlayPanel.innerHTML = `
      <h2>Shrine Broken</h2>
      <p>You earned <b>${reward} skulls</b>. Pick one permanent Grave Goblin upgrade.</p>
      <button class="choiceButton" data-upgrade="damage"><b>Sharper Bone</b><span>Bone Stab damage +15%. This makes tower pressure noticeably nastier.</span></button>
      <button class="choiceButton" data-upgrade="speed"><b>Quick Scuttle</b><span>Move speed +12%. Gets goblins into trouble faster, which is the point.</span></button>
      <button class="choiceButton" data-upgrade="health"><b>Grave Grit</b><span>Health +16%. Lets the little idiot survive tower shots longer.</span></button>
    `;
    for (const btn of overlayPanel.querySelectorAll('[data-upgrade]')) {
      btn.addEventListener('click', () => chooseUpgrade(btn.dataset.upgrade));
    }
    overlay.classList.add('visible');
  }

  function chooseUpgrade(key) {
    progress.upgrades[key] += 1;
    progress.currentBattle = (progress.currentBattle + 1) % battleDefs.length;
    saveProgress();
    state = makeEmptyState('menu');
    showToast('Upgrade saved. The goblin is getting horrible.');
    showMenu();
  }

  function showLoseOverlay() {
    overlayPanel.innerHTML = `
      <h2>Shrine Lost</h2>
      <p>The monsters broke your core. No drama, deploy earlier and stack Grave Goblins in a lane to punch through.</p>
      <button class="primaryButton" id="retryBtn">Retry Battle</button>
      <button class="secondaryButton" id="menuBtn">Back to menu</button>
    `;
    document.getElementById('retryBtn').addEventListener('click', startBattle);
    document.getElementById('menuBtn').addEventListener('click', () => { state = makeEmptyState('menu'); showMenu(); });
    overlay.classList.add('visible');
  }

  function hideOverlay() {
    overlay.classList.remove('visible');
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    toastTimer = 2.25;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function updateHud() {
    const { battle } = getBattleMeta();
    battleNameEl.textContent = state.battle ? state.battle.name : battle.name;
    const enemyCore = state.structures.find(s => s.team === 'enemy' && s.kind === 'core');
    const playerCore = state.structures.find(s => s.team === 'player' && s.kind === 'core');
    enemyCoreText.textContent = enemyCore ? `${Math.ceil(enemyCore.hp)}/${Math.ceil(enemyCore.maxHp)}` : 'Ready';
    playerCoreText.textContent = playerCore ? `${Math.ceil(playerCore.hp)}/${Math.ceil(playerCore.maxHp)}` : 'Ready';
    skullText.textContent = String(progress.skulls);
    energyFill.style.width = `${Math.round((state.energy || 0) * 10)}%`;
    energyText.textContent = `Energy ${(state.energy || 0).toFixed(1)} / 10`;
    graveCard.disabled = state.mode !== 'battle' || state.energy < 2;
  }

  function draw() {
    const shakeX = state.shake ? rand(-state.shake, state.shake) : 0;
    const shakeY = state.shake ? rand(-state.shake, state.shake) : 0;
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.translate(shakeX, shakeY);
    drawArena();
    drawStructures();
    drawUnits();
    drawProjectiles();
    drawSlashes();
    drawDeployGhost();
    drawParticles();
    ctx.restore();
  }

  function drawArena() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#080a16');
    g.addColorStop(0.42, '#111820');
    g.addColorStop(0.5, '#102520');
    g.addColorStop(1, '#0b1118');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    drawMoon();
    drawGroundTexture();

    const rt = riverTop();
    const rb = riverBottom();
    ctx.fillStyle = 'rgba(104,255,133,.83)';
    ctx.fillRect(0, rt, W, rb - rt);
    ctx.fillStyle = 'rgba(213,255,123,.18)';
    for (let i = 0; i < 18; i++) {
      const x = (i * 47 + state.time * 20) % (W + 60) - 30;
      ctx.beginPath();
      ctx.ellipse(x, lerp(rt, rb, (i % 5) / 4), 18 + (i % 3) * 5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawBridge(W * 0.33, rt, rb);
    drawBridge(W * 0.67, rt, rb);

    ctx.fillStyle = 'rgba(132,255,151,.06)';
    ctx.fillRect(0, rb, W, bottomPlayLimit() - rb);
    ctx.strokeStyle = 'rgba(132,255,151,.20)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(20, rb + 10);
    ctx.lineTo(W - 20, rb + 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255,255,255,.05)';
    ctx.fillRect(0, bottomPlayLimit(), W, H - bottomPlayLimit());
  }

  function drawMoon() {
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = '#d7deff';
    ctx.beginPath();
    ctx.arc(W - 56, 156, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#7ccfff';
    ctx.beginPath();
    ctx.arc(W - 62, 151, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGroundTexture() {
    const t = nowish();
    for (let i = 0; i < 38; i++) {
      const x = (i * 73 + 19) % W;
      const y = 150 + ((i * 97) % Math.max(200, bottomPlayLimit() - 160));
      if (y > riverTop() - 12 && y < riverBottom() + 12) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((i % 6) - 3) * 0.08);
      if (i % 4 === 0) {
        ctx.fillStyle = 'rgba(160,165,178,.22)';
        ctx.fillRect(-7, -10, 14, 18);
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        ctx.fillRect(-5, -3, 10, 2);
      } else if (i % 5 === 0) {
        ctx.strokeStyle = 'rgba(80,130,91,.38)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(0, -18 - Math.sin(t + i) * 3);
        ctx.stroke();
      } else {
        ctx.fillStyle = i % 2 ? 'rgba(99,114,126,.17)' : 'rgba(77,91,98,.17)';
        ctx.fillRect(-5, -5, 10 + (i % 3) * 4, 8 + (i % 2) * 5);
      }
      ctx.restore();
    }
  }

  function drawBridge(cx, rt, rb) {
    ctx.save();
    ctx.fillStyle = '#8b6030';
    ctx.strokeStyle = '#3f2914';
    ctx.lineWidth = 2;
    const width = 58;
    ctx.fillRect(cx - width / 2, rt - 15, width, rb - rt + 30);
    for (let i = 0; i < 5; i++) {
      const x = cx - width / 2 + i * (width / 4);
      ctx.fillStyle = i % 2 ? '#9b6b37' : '#70491f';
      ctx.fillRect(x - 5, rt - 17, 10, rb - rt + 34);
    }
    ctx.strokeRect(cx - width / 2, rt - 15, width, rb - rt + 30);
    ctx.restore();
  }

  function drawStructures() {
    for (const s of state.structures) {
      const dead = s.hp <= 0;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.globalAlpha = dead ? 0.45 : 1;
      const enemy = s.team === 'enemy';
      const baseColor = enemy ? '#6d3943' : '#4bbf72';
      const trim = enemy ? '#ff6b63' : '#d8ff89';
      if (s.kind === 'core') {
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.beginPath();
        ctx.ellipse(0, s.h * 0.46, s.w * 0.62, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = baseColor;
        roundRect(-s.w / 2, -s.h / 2, s.w, s.h, 11);
        ctx.fill();
        ctx.fillStyle = trim;
        roundRect(-s.w * 0.32, -s.h * 0.72, s.w * 0.64, 15, 5);
        ctx.fill();
        ctx.fillStyle = enemy ? '#2a1014' : '#173a27';
        ctx.beginPath();
        ctx.arc(0, -2, 14, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        ctx.beginPath();
        ctx.ellipse(0, s.h * 0.52, s.w * 0.58, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = baseColor;
        roundRect(-s.w / 2, -s.h / 2, s.w, s.h, 7);
        ctx.fill();
        ctx.fillStyle = trim;
        ctx.fillRect(-s.w / 2 - 4, -s.h / 2, s.w + 8, 11);
        ctx.fillStyle = enemy ? '#ffc15a' : '#fff099';
        ctx.beginPath();
        ctx.arc(0, -s.h * 0.18, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      drawHealthBar(s.x, s.y - s.h * 0.62 - 12, s.hp, s.maxHp, s.team === 'player');
    }
  }

  function drawUnits() {
    const sorted = [...state.units].sort((a, b) => a.y - b.y);
    for (const u of sorted) {
      ctx.save();
      ctx.translate(u.x, u.y);
      const bob = Math.sin(nowish() * 10 + u.wobble) * 2.2;
      const enemy = u.team === 'enemy';
      const isImp = u.type === 'candleImp';
      const isBrute = u.type === 'bruteGoblin';
      ctx.fillStyle = 'rgba(0,0,0,.30)';
      ctx.beginPath();
      ctx.ellipse(0, u.radius + 5, u.radius * 1.1, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(0, bob);
      if (isImp) drawCandleImp(u);
      else drawGoblin(u, enemy, isBrute);
      if (u.hitFlash > 0) {
        ctx.globalAlpha = u.hitFlash * 0.45;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, u.radius + 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      drawHealthBar(u.x, u.y - u.radius - 14, u.hp, u.maxHp, u.team === 'player', 30);
    }
  }

  function drawGoblin(u, enemy, brute) {
    const body = u.team === 'player' ? '#75f181' : (brute ? '#7d3540' : '#ce4d4d');
    const face = u.team === 'player' ? '#b8ff7f' : '#ff9b76';
    const r = u.radius;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 2, brute ? r * 1.18 : r, brute ? r * 1.23 : r * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.arc(0, -r * 0.42, brute ? r * 0.74 : r * 0.68, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = enemy ? '#3b080d' : '#112216';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.5, 2.2, 0, Math.PI * 2);
    ctx.arc(r * 0.24, -r * 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = u.team === 'player' ? '#ecffd2' : '#ffe1d2';
    ctx.lineWidth = brute ? 4 : 3;
    ctx.beginPath();
    ctx.moveTo(r * 0.55, -2);
    ctx.lineTo(r * 1.25, -10);
    ctx.stroke();
    ctx.fillStyle = '#f2f1d9';
    ctx.fillRect(r * 1.12, -13, 5, 9);
  }

  function drawCandleImp(u) {
    const r = u.radius;
    ctx.fillStyle = '#3b1c29';
    ctx.beginPath();
    ctx.ellipse(0, 5, r * 0.82, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6e2a3';
    roundRect(-r * 0.45, -r, r * 0.9, r * 1.8, 4);
    ctx.fill();
    ctx.fillStyle = '#ff7f36';
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.8);
    ctx.quadraticCurveTo(r * 0.58, -r * 1.12, 0, -r * 0.75);
    ctx.quadraticCurveTo(-r * 0.46, -r * 1.18, 0, -r * 1.8);
    ctx.fill();
    ctx.fillStyle = '#2a120e';
    ctx.fillRect(-r * 0.22, -r * 0.32, 2.8, 3.5);
    ctx.fillRect(r * 0.16, -r * 0.32, 2.8, 3.5);
  }

  function drawProjectiles() {
    for (const p of state.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.type === 'flame' ? 12 : 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawSlashes() {
    for (const s of state.slashes) {
      ctx.save();
      ctx.globalAlpha = clamp(s.life / 0.13, 0, 1);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(lerp(s.x1, s.x2, 0.68), lerp(s.y1, s.y2, 0.68));
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawDeployGhost() {
    if (state.mode !== 'battle' || !pointer.active) return;
    const ok = validDeploy(pointer.x, pointer.y) && state.energy >= 2;
    ctx.save();
    ctx.globalAlpha = ok ? 0.88 : 0.48;
    ctx.strokeStyle = ok ? '#84ff97' : '#ff5d5d';
    ctx.fillStyle = ok ? 'rgba(132,255,151,.10)' : 'rgba(255,93,93,.10)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 24 + Math.sin(nowish() * 8) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.save();
      ctx.globalAlpha = clamp(p.life / 0.7, 0, 1);
      ctx.fillStyle = p.color;
      if (p.text) {
        ctx.font = '900 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawHealthBar(x, y, hp, maxHp, player, width = 44) {
    if (maxHp <= 0) return;
    const pct = clamp(hp / maxHp, 0, 1);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.62)';
    roundRect(x - width / 2, y, width, 6, 3);
    ctx.fill();
    ctx.fillStyle = player ? '#84ff97' : '#ff5d5d';
    roundRect(x - width / 2, y, width * pct, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function buzz(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  canvas.addEventListener('pointerdown', event => {
    const p = pointerPos(event);
    pointer = { ...p, active: true };
    if (state.mode === 'battle') deployGraveGoblin(p.x, p.y);
  });
  canvas.addEventListener('pointermove', event => {
    const p = pointerPos(event);
    pointer = { ...p, active: true };
  });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; });
  canvas.addEventListener('pointerup', () => { setTimeout(() => { pointer.active = false; }, 90); });

  graveCard.addEventListener('click', () => {
    state.selectedCard = 'graveGoblin';
    graveCard.classList.add('selected');
    showToast('Grave Goblin selected. Tap your half to deploy.');
  });
  candleInfo.addEventListener('click', () => showToast('Candle Imp is enemy only in v8. Kill it quickly.'));
  resetBtn.addEventListener('click', () => {
    const ok = confirm('Reset Nightmare Park v8 save progress on this browser?');
    if (!ok) return;
    progress = defaultProgress();
    saveProgress();
    state = makeEmptyState('menu');
    showMenu();
    showToast('Save reset. Fresh grave, fresh goblin.');
  });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 150));

  function frame(t) {
    const dt = clamp((t - lastTime) / 1000, 0, 0.05);
    lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  resize();
  showMenu();
  requestAnimationFrame(frame);
})();
