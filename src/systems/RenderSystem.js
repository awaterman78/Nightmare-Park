import { FIELD, TEAM, VIEW } from '../core/constants.js';
import { clamp } from '../core/math.js';
import { MAP_IMAGE_DATA_URI } from '../data/mapImage.js';
import { CARD_LIBRARY } from '../data/cards.js';
import { ATMOSPHERE } from '../data/atmosphere.js';
import { DEFENSE_LIBRARY } from '../data/defenses.js';
import { CHARACTER_LIBRARY, characterProfile } from '../data/characters.js';

export class RenderSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.dpr = 1;
    this.scale = 1;
    this.offX = 0;
    this.offY = 0;
    this.mapImage = new Image();
    this.mapImageLoaded = false;
    this.mapImageFailed = false;
    this.mapImageAttempt = 0;
    this.mapImageCandidates = [
      './assets/maps/nightmare_park_arena_v14_4k.jpg',
      'assets/maps/nightmare_park_arena_v14_4k.jpg',
      './nightmare_park_arena_v14_4k.jpg',
      'nightmare_park_arena_v14_4k.jpg',
      `${window.location.pathname.replace(/[^/]*$/, '')}assets/maps/nightmare_park_arena_v14_4k.jpg`,
      MAP_IMAGE_DATA_URI
    ];
    this.mapImage.onload = () => {
      this.mapImageLoaded = true;
      this.mapImageFailed = false;
    };
    this.mapImage.onerror = () => {
      this.mapImageAttempt += 1;
      if (this.mapImageAttempt < this.mapImageCandidates.length) {
        this.mapImage.src = this.mapImageCandidates[this.mapImageAttempt];
      } else {
        this.mapImageFailed = true;
        console.warn('Nightmare Park map asset path failed; embedded backup also failed unexpectedly.');
      }
    };
    this.mapImage.src = this.mapImageCandidates[0];

    this.characterImages = new Map();
    this.loadCharacterImages();
  }

  loadCharacterImages() {
    for (const [id, profile] of Object.entries(CHARACTER_LIBRARY)) {
      const art = profile.art;
      if (!art) continue;
      const frames = {};
      const sources = art.frames || { idle: art.sprite, walk: art.sprite, attack: art.sprite, special: art.sprite };
      for (const [state, src] of Object.entries(sources)) {
        if (!src) continue;
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = src;
        frames[state] = img;
      }
      if (art.sprite && !frames.sprite) {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = art.sprite;
        frames.sprite = img;
      }
      this.characterImages.set(id, frames);
    }
  }

  isImageReady(img) {
    return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  }

  resize() {
    this.dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.scale = Math.min(width / VIEW.width, height / VIEW.height);
    this.offX = (width - VIEW.width * this.scale) / 2;
    this.offY = (height - VIEW.height * this.scale) / 2;
  }

  screenToWorld(clientX, clientY) {
    return {
      x: (clientX - this.offX) / this.scale,
      y: (clientY - this.offY) / this.scale
    };
  }

  render(game) {
    const ctx = this.ctx;
    this.clearScreen(ctx);
    ctx.save();
    ctx.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, this.dpr * this.offX, this.dpr * this.offY);

    this.drawBackdrop(ctx, game);
    this.drawArena(ctx, game);
    this.drawDeploymentOverlay(ctx, game);
    this.drawEnemyBrainPanel(ctx, game);

    const actors = [
      ...game.state.towers,
      ...game.state.buildings,
      ...game.state.units
    ].sort((a, b) => (a.y || 0) - (b.y || 0));

    for (const actor of actors) {
      if (actor.type === 'tower') this.drawTower(ctx, actor, game);
      if (actor.type === 'building') this.drawBuilding(ctx, actor, game);
      if (actor.type === 'unit') this.drawUnit(ctx, actor, game);
    }
    for (const projectile of game.state.projectiles) this.drawProjectile(ctx, projectile);
    for (const effect of game.effects) this.drawEffect(ctx, effect);

    if (game.state.over) this.drawEndState(ctx, game);
    ctx.restore();
  }

  clearScreen(ctx) {
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#050208');
    gradient.addColorStop(0.48, '#130820');
    gradient.addColorStop(1, '#050309');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  drawBackdrop(ctx, game) {
    ctx.fillStyle = '#08040e';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);

    const bg = ctx.createRadialGradient(195, 345, 40, 195, 345, 390);
    bg.addColorStop(0, '#1a1030');
    bg.addColorStop(0.6, '#0d0717');
    bg.addColorStop(1, '#050308');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);

    for (let i = 0; i < 34; i++) {
      const x = (i * 73) % VIEW.width;
      const y = ((i * 131) % 720) + 40;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(125,255,102,.06)' : 'rgba(136,239,255,.045)';
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawArena(ctx, game) {
    const field = game.map.field;
    ctx.save();
    this.roundRect(ctx, field.x, field.y, field.width, field.height, 24);
    ctx.fillStyle = '#160e20';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,216,111,.22)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.clip();

    this.drawMapBackground(ctx, game);
    this.drawAmbientMapLighting(ctx, game);
    this.drawSubtleRouteHints(ctx, game);
    this.drawLivingMist(ctx, game);
    this.drawMapParticles(ctx, game);
    this.drawV16LivingArena(ctx, game);
    ctx.restore();
  }

  drawMapBackground(ctx, game) {
    const field = game.map.field;
    if (this.mapImageLoaded) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this.mapImage, field.x, field.y, field.width, field.height);
      ctx.restore();
    } else {
      // Safe fallback while the 4K map is loading, or if the asset path was not uploaded.
      this.drawGroundTexture(ctx);
      this.drawDecor(ctx, game);
      this.drawRiver(ctx, game.map.river);
      this.drawBridges(ctx, game.map.bridgeBands);
      this.drawPaths(ctx, game);
      this.drawMapLoadingNotice(ctx);
    }

    // Darken edges so cards/HUD remain readable and the map feels deeper.
    const edge = ctx.createRadialGradient(195, 368, 80, 195, 368, 350);
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(0.58, 'rgba(0,0,0,.04)');
    edge.addColorStop(1, 'rgba(0,0,0,.34)');
    ctx.fillStyle = edge;
    ctx.fillRect(field.x, field.y, field.width, field.height);
  }

  drawMapLoadingNotice(ctx) {
    if (this.mapImageLoaded) return;
    ctx.save();
    ctx.fillStyle = 'rgba(6,3,12,.72)';
    this.roundRect(ctx, FIELD.x + 18, FIELD.y + 20, FIELD.width - 36, 42, 12);
    ctx.fill();
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.mapImageFailed ? '#ff8fac' : '#a7ffca';
    ctx.fillText(
      this.mapImageFailed ? 'MAP ASSET PATH MISSING — USING EMBEDDED 4K BACKUP' : 'LOADING 4K MAP...',
      FIELD.x + FIELD.width / 2,
      FIELD.y + 46
    );
    ctx.restore();
  }

  drawAmbientMapLighting(ctx, game) {
    const time = game.state?.elapsed || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const light of game.map.ambientLights || []) {
      const pulse = 0.76 + Math.sin(time * 2.1 + light.phase) * 0.18;
      const r = light.r * pulse;
      const gradient = ctx.createRadialGradient(light.x, light.y, 1, light.x, light.y, r);
      gradient.addColorStop(0, light.colour);
      gradient.addColorStop(0.55, light.colour.replace(/\.\d+\)/, '.10)'));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(light.x, light.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawSubtleRouteHints(ctx, game) {
    ctx.save();
    // The route logic is real, but deliberately subtle so the map stays organic.
    for (const lane of game.map.lanes) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(125,255,102,.018)';
      ctx.lineWidth = Math.max(12, (lane.width || 34) * 0.58);
      this.strokeSmoothPath(ctx, lane.points);
      ctx.strokeStyle = 'rgba(255,216,111,.035)';
      ctx.lineWidth = 2;
      this.strokeSmoothPath(ctx, lane.points);
    }
    ctx.restore();
  }

  drawLivingMist(ctx, game) {
    const time = game.state?.elapsed || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Cursed river breathe.
    for (let i = 0; i < 8; i++) {
      const alpha = 0.035 + (i % 3) * 0.012;
      const y = 350 + i * 8 + Math.sin(time * 1.3 + i) * 4;
      ctx.strokeStyle = `rgba(55,255,126,${alpha})`;
      ctx.lineWidth = 8 + (i % 3) * 2;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.bezierCurveTo(90, 321 + i * 8, 172, 398 - i * 3, 238, 355 + i * 7);
      ctx.bezierCurveTo(291, 329 + i * 3, 329, 384 + i * 2, 372, y + 2);
      ctx.stroke();
    }

    for (let i = 0; i < 10; i++) {
      const x = 44 + i * 35 + Math.sin(time * 0.45 + i) * 12;
      const y = 120 + ((i * 67) % 500) + Math.cos(time * 0.38 + i) * 9;
      ctx.fillStyle = `rgba(136,239,255,${0.025 + (i % 4) * .008})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 54, 13, Math.sin(i + time * .2) * .45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawMapParticles(ctx, game) {
    const time = game.state?.elapsed || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const particle of game.map.ambientParticles || []) {
      const drift = (time * particle.speed * 26 + particle.phase * 19) % 36;
      const x = particle.x + Math.sin(time * .7 + particle.phase) * 6;
      const y = particle.y - drift;
      ctx.fillStyle = particle.phase % 2 > 1 ? 'rgba(255,216,111,.18)' : 'rgba(125,255,102,.14)';
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    // Occasional tiny bat silhouettes near the top, giving the map life without affecting gameplay.
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,.38)';
    for (let i = 0; i < 4; i++) {
      const x = 80 + ((time * 18 + i * 76) % 250);
      const y = 116 + Math.sin(time * 1.4 + i) * 16;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x - 7, y - 5, x - 13, y + 1);
      ctx.quadraticCurveTo(x - 4, y - 2, x, y + 3);
      ctx.quadraticCurveTo(x + 4, y - 2, x + 13, y + 1);
      ctx.quadraticCurveTo(x + 7, y - 5, x, y);
      ctx.fill();
    }
    ctx.restore();
  }


  drawV16LivingArena(ctx, game) {
    const atmosphere = game.atmosphere?.state || { time: game.state?.elapsed || 0, danger: 0, lightning: 0, fogSurge: 0.5, wind: 0 };
    this.drawV16PuddleReflections(ctx, atmosphere);
    this.drawV16CursedRiverPulse(ctx, atmosphere);
    this.drawV16TorchFlicker(ctx, atmosphere);
    this.drawV16Runes(ctx, atmosphere);
    this.drawV16CarnivalSilhouettes(ctx, atmosphere);
    this.drawV16FogBands(ctx, atmosphere);
    this.drawV16Bats(ctx, atmosphere);
    this.drawV16Embers(ctx, atmosphere);
    this.drawV16DangerTint(ctx, atmosphere, game);
    this.drawV16MoonFlash(ctx, atmosphere);
  }

  drawV16PuddleReflections(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const puddle of ATMOSPHERE.puddles) {
      const shimmer = 0.35 + Math.sin(time * 2.2 + puddle.phase) * 0.22;
      const g = ctx.createRadialGradient(puddle.x, puddle.y, 1, puddle.x, puddle.y, puddle.w);
      g.addColorStop(0, `rgba(136,239,255,${0.08 + shimmer * 0.07})`);
      g.addColorStop(0.6, `rgba(125,255,102,${0.035 + shimmer * 0.04})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(puddle.x, puddle.y, puddle.w, puddle.h, Math.sin(puddle.phase) * .18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${0.025 + shimmer * .04})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(puddle.x + Math.sin(time + puddle.phase) * 2, puddle.y, puddle.w * .68, puddle.h * .42, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawV16CursedRiverPulse(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    const danger = atmosphere.danger || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < 10; i++) {
      const offset = Math.sin(time * 1.7 + i * 0.74) * (6 + danger * 8);
      const alpha = 0.04 + i * 0.006 + danger * 0.035;
      ctx.strokeStyle = `rgba(40,255,106,${alpha})`;
      ctx.lineWidth = 3 + (i % 4) * 2;
      ctx.beginPath();
      ctx.moveTo(20, 354 + offset * .25 + i * 5);
      ctx.bezierCurveTo(82, 323 + offset, 126, 395 - offset * .35, 187, 360 + i * 4);
      ctx.bezierCurveTo(244, 324 - offset * .2, 300, 402 + offset * .35, 370, 360 + i * 5);
      ctx.stroke();
    }

    // Ghostly face/energy pulse in the cursed central channel.
    const pulse = 0.5 + Math.sin(time * 1.4) * 0.5;
    const g = ctx.createRadialGradient(195, 371, 8, 195, 371, 80 + pulse * 18);
    g.addColorStop(0, `rgba(125,255,102,${0.18 + danger * .14})`);
    g.addColorStop(.45, `rgba(40,255,106,${0.06 + danger * .08})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(195, 371, 94 + pulse * 8, 34 + pulse * 5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawV16TorchFlicker(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    const danger = atmosphere.danger || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const torch of ATMOSPHERE.torchClusters) {
      const flicker = 0.72 + Math.sin(time * 6.1 + torch.phase) * 0.18 + Math.sin(time * 13.7 + torch.phase * 2) * 0.08;
      const radius = torch.r * (0.88 + flicker * 0.28 + danger * .18);
      const glow = ctx.createRadialGradient(torch.x, torch.y, 1, torch.x, torch.y, radius);
      glow.addColorStop(0, this.withAlpha(torch.colour, 0.22 + danger * .07));
      glow.addColorStop(0.34, this.withAlpha(torch.colour, 0.11 + danger * .05));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(torch.x, torch.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.withAlpha(torch.colour, 0.55 + danger * .2);
      ctx.beginPath();
      ctx.moveTo(torch.x, torch.y - 8 - flicker * 3);
      ctx.quadraticCurveTo(torch.x - 5, torch.y, torch.x, torch.y + 8);
      ctx.quadraticCurveTo(torch.x + 6, torch.y, torch.x, torch.y - 8 - flicker * 3);
      ctx.fill();
    }
    ctx.restore();
  }

  drawV16Runes(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    const danger = atmosphere.danger || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const rune of ATMOSPHERE.runeStones) {
      const pulse = 0.5 + Math.sin(time * 2.6 + rune.phase) * 0.5;
      ctx.strokeStyle = this.withAlpha(rune.colour, 0.16 + pulse * .22 + danger * .12);
      ctx.lineWidth = 1.5 + pulse * 1.5;
      ctx.beginPath();
      ctx.arc(rune.x, rune.y, rune.r + pulse * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = this.withAlpha(rune.colour, 0.24 + pulse * .2);
      ctx.beginPath();
      ctx.moveTo(rune.x, rune.y - rune.r);
      ctx.lineTo(rune.x + rune.r * .82, rune.y + rune.r * .5);
      ctx.lineTo(rune.x - rune.r * .82, rune.y + rune.r * .5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawV16CarnivalSilhouettes(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const item of ATMOSPHERE.carnivalSilhouettes) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(Math.sin(time * 0.12 + item.phase) * 0.045);
      ctx.globalAlpha = 0.12 + Math.sin(time * .7 + item.phase) * 0.035;
      if (item.id === 'wheel') {
        ctx.strokeStyle = '#88efff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, item.r, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4 + time * 0.05;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * item.r, Math.sin(a) * item.r);
          ctx.stroke();
        }
      } else if (item.id === 'carousel') {
        ctx.strokeStyle = '#ffd86f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, item.r, item.r * .38, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-item.r * .75, 0);
        ctx.lineTo(0, -item.r * .72);
        ctx.lineTo(item.r * .75, 0);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#d58cff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-item.r, item.r * .2);
        ctx.bezierCurveTo(-item.r * .35, -item.r, item.r * .15, item.r, item.r, -item.r * .2);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawV16FogBands(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    const wind = atmosphere.wind || 0;
    const surge = atmosphere.fogSurge || 0.5;
    const danger = atmosphere.danger || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const fog of ATMOSPHERE.fogBands) {
      const drift = ((time * fog.speed + wind * 30 + fog.phase * 40) % 90) - 45;
      const alpha = fog.alpha * (0.72 + surge * 0.7 + danger * 0.55);
      ctx.fillStyle = `${fog.colour}${alpha})`;
      ctx.beginPath();
      ctx.ellipse(fog.x + fog.w / 2 + drift, fog.y + Math.sin(time * .4 + fog.phase) * 7, fog.w / 2, fog.h, Math.sin(fog.phase) * .18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(fog.x + fog.w / 2 - 85 + drift * .7, fog.y + 9, fog.w * .32, fog.h * .7, -.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawV16Bats(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.52)';
    for (const bat of ATMOSPHERE.bats) {
      const width = FIELD.width + 80;
      let x = FIELD.x - 40 + ((bat.phase + time * bat.speed) % width);
      if (bat.speed < 0) x = FIELD.x + FIELD.width + 40 - ((bat.phase + time * Math.abs(bat.speed)) % width);
      const y = bat.y + Math.sin(time * 2.2 + bat.phase) * 10;
      const flap = Math.sin(time * 12 + bat.phase) * 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(bat.scale, bat.scale);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-9, -5 - flap, -17, 2);
      ctx.quadraticCurveTo(-6, 0, 0, 5);
      ctx.quadraticCurveTo(6, 0, 17, 2);
      ctx.quadraticCurveTo(9, -5 - flap, 0, 0);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawV16Embers(ctx, atmosphere) {
    const time = atmosphere.time || 0;
    const wind = atmosphere.wind || 0;
    const danger = atmosphere.danger || 0;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ember of ATMOSPHERE.embers) {
      const travel = (time * ember.speed + ember.phase * 13) % 92;
      const x = ember.x + wind * 18 + Math.sin(time * .8 + ember.phase) * 5;
      const y = ember.y - travel;
      const alpha = ember.type === 'spark' ? 0.12 + danger * .16 : 0.045 + danger * .04;
      ctx.fillStyle = ember.type === 'spark' ? `rgba(255,216,111,${alpha})` : `rgba(190,210,220,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y < FIELD.y ? y + FIELD.height : y, ember.size * (1 + danger * .5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawV16DangerTint(ctx, atmosphere, game) {
    const danger = atmosphere.danger || 0;
    if (danger <= 0.04) return;
    ctx.save();
    const field = game.map.field;
    const g = ctx.createRadialGradient(195, 368, 60, 195, 368, 330);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(.72, `rgba(255,80,216,${danger * .025})`);
    g.addColorStop(1, `rgba(255,91,110,${danger * .11})`);
    ctx.fillStyle = g;
    ctx.fillRect(field.x, field.y, field.width, field.height);
    if (game.state?.suddenDeath) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,216,111,${0.10 + danger * .18})`;
      ctx.lineWidth = 2;
      this.roundRect(ctx, field.x + 3, field.y + 3, field.width - 6, field.height - 6, 22);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawV16MoonFlash(ctx, atmosphere) {
    const lightning = atmosphere.lightning || 0;
    if (lightning <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(190,220,255,${lightning * 0.34})`;
    ctx.fillRect(FIELD.x, FIELD.y, FIELD.width, FIELD.height);
    ctx.strokeStyle = `rgba(255,255,255,${lightning * .55})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(330, 76);
    ctx.lineTo(306, 126);
    ctx.lineTo(318, 124);
    ctx.lineTo(292, 184);
    ctx.lineTo(305, 178);
    ctx.lineTo(286, 232);
    ctx.stroke();
    ctx.restore();
  }


  hexToRgba(hex, alpha = 1) {
    if (!hex || !hex.startsWith('#')) return hex || `rgba(255,255,255,${alpha})`;
    const value = hex.replace('#', '');
    const bigint = parseInt(value.length === 3 ? value.split('').map(ch => ch + ch).join('') : value, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  normaliseEffectColour(colour, alpha = 0.2) {
    if (!colour) return `rgba(255,255,255,${alpha})`;
    if (colour.startsWith('rgba(')) return colour.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/, `rgba($1,$2,$3,${alpha})`);
    if (colour.startsWith('rgb(')) return colour.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
    if (colour.startsWith('#')) return this.hexToRgba(colour, alpha);
    return colour;
  }

  withAlpha(rgba, alpha) {
    const match = /rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/.exec(rgba);
    if (!match) return rgba;
    return `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
  }

  drawGroundTexture(ctx) {
    ctx.fillStyle = '#120b18';
    ctx.fillRect(FIELD.x, FIELD.y, FIELD.width, FIELD.height);
    for (let i = 0; i < 42; i++) {
      const x = FIELD.x + ((i * 47) % FIELD.width);
      const y = FIELD.y + ((i * 83) % FIELD.height);
      ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.13)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 18 + (i % 5) * 6, y + 5 - (i % 3) * 7);
      ctx.stroke();
    }
  }

  drawDecor(ctx, game) {
    const decorItems = Array.isArray(game.map.decor) ? game.map.decor : [];
    for (const decor of decorItems) {
      ctx.save();
      ctx.translate(decor.x, decor.y);
      ctx.globalAlpha = 0.42;
      if (decor.type === 'wheel') this.drawBrokenWheel(ctx, decor.r);
      if (decor.type === 'tent') this.drawTent(ctx, decor.r);
      if (decor.type === 'tree') this.drawDeadTree(ctx, decor.r);
      if (decor.type === 'booth') this.drawBooth(ctx, decor.r);
      if (decor.type === 'carousel') this.drawCarousel(ctx, decor.r);
      if (decor.type === 'coaster') this.drawCoaster(ctx, decor.r);
      ctx.restore();
    }
  }

  drawBrokenWheel(ctx, r) {
    ctx.strokeStyle = 'rgba(136,239,255,.18)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0.2, Math.PI * 1.7);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.8, 0);
      ctx.stroke();
    }
  }

  drawTent(ctx, r) {
    ctx.fillStyle = 'rgba(255,80,216,.16)';
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.45);
    ctx.lineTo(0, -r);
    ctx.lineTo(r, r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,216,111,.18)';
    ctx.stroke();
  }

  drawDeadTree(ctx, r) {
    ctx.strokeStyle = 'rgba(125,255,102,.14)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(0, -r * .7);
    ctx.lineTo(-r * .55, -r * .2);
    ctx.moveTo(0, -r * .45);
    ctx.lineTo(r * .55, -r * .9);
    ctx.stroke();
  }

  drawBooth(ctx, r) {
    ctx.fillStyle = 'rgba(255,216,111,.12)';
    ctx.fillRect(-r * .8, -r * .45, r * 1.6, r * .9);
    ctx.fillStyle = 'rgba(255,80,216,.12)';
    ctx.beginPath();
    ctx.moveTo(-r, -r * .45);
    ctx.lineTo(0, -r);
    ctx.lineTo(r, -r * .45);
    ctx.closePath();
    ctx.fill();
  }

  drawCarousel(ctx, r) {
    ctx.strokeStyle = 'rgba(255,216,111,.13)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * .46, -0.2, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * .32, -r * .42);
      ctx.lineTo(i * r * .32, r * .36);
      ctx.stroke();
    }
  }

  drawCoaster(ctx, r) {
    ctx.strokeStyle = 'rgba(136,239,255,.13)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-r, r * .35);
    ctx.bezierCurveTo(-r * .5, -r, r * .2, r * .8, r, -r * .2);
    ctx.stroke();
  }

  drawRiver(ctx, points) {
    ctx.save();
    ctx.fillStyle = 'rgba(40, 255, 92, .18)';
    ctx.strokeStyle = 'rgba(125,255,102,.26)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.44;
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = `rgba(125,255,102,${0.07 + i * .015})`;
      ctx.beginPath();
      ctx.moveTo(24, 352 + i * 5);
      ctx.bezierCurveTo(100, 334 + i * 5, 170, 388 - i * 2, 236, 358 + i * 6);
      ctx.bezierCurveTo(286, 336 + i * 3, 330, 374 + i * 3, 368, 356 + i * 5);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBridges(ctx, bridges) {
    for (const bridge of bridges) {
      ctx.save();
      ctx.translate(bridge.x + bridge.w / 2, bridge.y + bridge.h / 2);
      ctx.rotate(bridge.rot);
      ctx.fillStyle = '#473421';
      ctx.strokeStyle = 'rgba(255,216,111,.22)';
      ctx.lineWidth = 2;
      this.roundRect(ctx, -bridge.w / 2, -bridge.h / 2, bridge.w, bridge.h, 9);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.22)';
      for (let y = -bridge.h / 2 + 9; y < bridge.h / 2; y += 11) {
        ctx.beginPath();
        ctx.moveTo(-bridge.w / 2 + 5, y);
        ctx.lineTo(bridge.w / 2 - 5, y + 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawPaths(ctx, game) {
    for (const lane of game.map.lanes) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,.42)';
      ctx.lineWidth = 34;
      this.strokeSmoothPath(ctx, lane.points);
      ctx.strokeStyle = '#33251d';
      ctx.lineWidth = 27;
      this.strokeSmoothPath(ctx, lane.points);
      ctx.strokeStyle = 'rgba(255,216,111,.08)';
      ctx.lineWidth = 19;
      this.strokeSmoothPath(ctx, lane.points);
      ctx.strokeStyle = 'rgba(255,255,255,.045)';
      ctx.lineWidth = 2;
      this.strokeSmoothPath(ctx, lane.points);
    }
  }

  drawMist(ctx) {
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = `rgba(136,239,255,${0.03 + (i % 3) * .012})`;
      ctx.beginPath();
      ctx.ellipse(60 + i * 38, 250 + Math.sin(i) * 170, 52, 14, Math.sin(i) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawDeploymentOverlay(ctx, game) {
    if (!game.state.selectedCard && !game.state.draggingCard) return;
    ctx.save();

    // Show the player's legal half, then real walkable path centres and blocked terrain.
    ctx.fillStyle = 'rgba(125,255,102,.06)';
    ctx.fillRect(FIELD.x, FIELD.mid + 6, FIELD.width, FIELD.bottom - FIELD.mid - 6);

    for (const zone of game.map.blockedZones || []) {
      if (zone.kind === 'hazard' || zone.kind === 'obstacle') {
        ctx.fillStyle = zone.kind === 'hazard' ? 'rgba(255,80,216,.13)' : 'rgba(255,91,110,.10)';
        ctx.strokeStyle = zone.kind === 'hazard' ? 'rgba(255,80,216,.28)' : 'rgba(255,91,110,.22)';
        ctx.lineWidth = 1.5;
        this.drawShape(ctx, zone);
        ctx.fill();
        ctx.stroke();
      }
    }

    for (const lane of game.map.lanes) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(125,255,102,.20)';
      ctx.lineWidth = lane.deployWidth || 46;
      this.strokeSmoothPath(ctx, lane.points.slice(0, 6));
      ctx.strokeStyle = 'rgba(255,216,111,.62)';
      ctx.lineWidth = 5;
      this.strokeSmoothPath(ctx, lane.points.slice(0, 6));
    }

    ctx.strokeStyle = 'rgba(125,255,102,.42)';
    ctx.setLineDash([8, 9]);
    ctx.beginPath();
    ctx.moveTo(FIELD.x + 8, FIELD.mid + 6);
    ctx.lineTo(FIELD.x + FIELD.width - 8, FIELD.mid + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawShape(ctx, shape) {
    ctx.beginPath();
    if (shape.polygon) {
      const first = shape.polygon[0];
      ctx.moveTo(first.x, first.y);
      for (const p of shape.polygon.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      return;
    }
    if (shape.circle) {
      ctx.arc(shape.circle.x, shape.circle.y, shape.circle.r, 0, Math.PI * 2);
      return;
    }
    if (shape.rect) {
      ctx.rect(shape.rect.x, shape.rect.y, shape.rect.w, shape.rect.h);
    }
  }

  drawEnemyBrainPanel(ctx, game) {
    if (!game.state || game.state.over) return;
    ctx.save();
    const x = FIELD.x + 10;
    const y = FIELD.y + 12;
    const w = FIELD.width - 20;
    const h = 34;
    this.roundRect(ctx, x, y, w, h, 12);
    ctx.fillStyle = 'rgba(8,4,13,.58)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,91,110,.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ff8fac';
    ctx.font = '900 9px Inter, system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`ENEMY BRAIN: ${game.state.enemyIntent || 'thinking'}`, x + 10, y + 13);
    ctx.fillStyle = 'rgba(255,255,255,.76)';
    ctx.font = '800 8px Inter, system-ui';
    const next = CARD_LIBRARY[game.state.enemyNextCard];
    const last = game.state.enemyLastPlay || 'none';
    ctx.fillText(`energy ${game.state.enemyEnergy.toFixed(1)}/10 • last ${last}${next ? ` • next ?` : ''}`, x + 10, y + 27);
    ctx.restore();
  }

  drawTower(ctx, tower, game) {
    const defense = tower.defense || DEFENSE_LIBRARY[tower.defenseId] || DEFENSE_LIBRARY.soulLanternTurret;
    const palette = defense.palette;
    const time = game.state?.elapsed || 0;
    const damage = 1 - clamp(tower.hp / tower.maxHp, 0, 1);
    const pulse = 0.55 + Math.sin(time * 3.1 + tower.x * 0.03) * 0.22 + (tower.attackPulse || 0) * 1.8;

    ctx.save();
    ctx.translate(tower.x, tower.y);

    // Proper in-world defence footprint, replacing the old debug-square lane markers.
    ctx.globalAlpha = tower.alive ? 1 : 0.52;
    const floorGlow = ctx.createRadialGradient(0, 8, 4, 0, 8, tower.kind === 'core' ? 54 : 42);
    floorGlow.addColorStop(0, this.hexToRgba(palette.glow, 0.18 + pulse * 0.08));
    floorGlow.addColorStop(0.6, this.hexToRgba(palette.accent, 0.04));
    floorGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = floorGlow;
    ctx.beginPath();
    ctx.ellipse(0, 11, tower.kind === 'core' ? 50 : 38, tower.kind === 'core' ? 24 : 17, 0, 0, Math.PI * 2);
    ctx.fill();

    if (tower.kind === 'core') {
      this.drawCoreDefence(ctx, tower, defense, pulse, damage);
    } else if (defense.id === 'cursedSkullTurret') {
      this.drawSkullTurret(ctx, tower, defense, pulse, damage);
    } else {
      this.drawSoulLanternTurret(ctx, tower, defense, pulse, damage);
    }

    if (tower.customisable && tower.alive) this.drawCustomiseSocket(ctx, tower, defense, pulse);
    if (!tower.alive) this.drawDestroyedOverlay(ctx, tower);
    this.healthBar(ctx, tower, -tower.radius - 9, -tower.radius - 22, tower.radius * 2 + 18, 5, palette.glow);
    ctx.restore();
  }

  drawCoreDefence(ctx, tower, defense, pulse, damage) {
    const p = defense.palette;
    const hurtShake = tower.hitFlash > 0 ? Math.sin(tower.hitFlash * 70) * 2 : 0;
    ctx.save();
    ctx.translate(hurtShake, 0);
    ctx.shadowColor = p.glow;
    ctx.shadowBlur = 14 + pulse * 10;

    // Stone base and haunted gate body.
    ctx.fillStyle = tower.hitFlash > 0 ? '#fff' : p.stone;
    this.roundRect(ctx, -31, -15, 62, 42, 11);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.hexToRgba(p.metal, 0.36);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = p.stone2;
    this.roundRect(ctx, -24, -38, 48, 40, 12);
    ctx.fill();
    ctx.strokeStyle = this.hexToRgba(p.glow, 0.45);
    ctx.stroke();

    ctx.fillStyle = p.roof;
    ctx.beginPath();
    ctx.moveTo(-31, -32);
    ctx.lineTo(0, -63);
    ctx.lineTo(31, -32);
    ctx.lineTo(22, -36);
    ctx.lineTo(0, -49);
    ctx.lineTo(-22, -36);
    ctx.closePath();
    ctx.fill();

    // Portal/gate core.
    const portal = ctx.createRadialGradient(0, -12, 1, 0, -12, 23 + pulse * 4);
    portal.addColorStop(0, this.hexToRgba(p.glow, 0.9));
    portal.addColorStop(0.42, this.hexToRgba(p.glow, 0.28));
    portal.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = portal;
    ctx.beginPath();
    ctx.ellipse(0, -12, 18 + pulse * 2, 24 + pulse * 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = p.metal;
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 9, -31);
      ctx.lineTo(i * 5, 10);
      ctx.stroke();
    }

    this.drawMiniSpire(ctx, -32, -8, p, 0.95, pulse);
    this.drawMiniSpire(ctx, 32, -8, p, 0.95, pulse + 0.3);
    this.drawMiniSpire(ctx, -18, -36, p, 0.72, pulse + 0.7);
    this.drawMiniSpire(ctx, 18, -36, p, 0.72, pulse + 1.1);

    if (damage > 0.18) this.drawDamageCracks(ctx, damage, p.glow, 32);
    ctx.restore();
  }

  drawSoulLanternTurret(ctx, tower, defense, pulse, damage) {
    const p = defense.palette;
    const hit = tower.hitFlash > 0;
    ctx.save();
    ctx.shadowColor = p.glow;
    ctx.shadowBlur = 12 + pulse * 8;
    ctx.fillStyle = hit ? '#fff' : p.stone;
    this.roundRect(ctx, -22, -8, 44, 33, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.hexToRgba(p.metal, 0.42);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = p.stone2;
    this.roundRect(ctx, -17, -31, 34, 31, 8);
    ctx.fill();
    ctx.fillStyle = p.roof;
    ctx.beginPath();
    ctx.moveTo(-21, -27);
    ctx.lineTo(0, -49);
    ctx.lineTo(21, -27);
    ctx.closePath();
    ctx.fill();

    // Animated lantern lens.
    const lens = ctx.createRadialGradient(0, -16, 1, 0, -16, 20 + pulse * 5);
    lens.addColorStop(0, this.hexToRgba(p.glow, 0.95));
    lens.addColorStop(0.35, this.hexToRgba(p.glow, 0.32));
    lens.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lens;
    ctx.beginPath();
    ctx.arc(0, -16, 18 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.glow;
    ctx.beginPath();
    ctx.arc(0, -16, 7 + pulse * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.hexToRgba(p.accent, 0.5 + pulse * 0.12);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -16, 13 + pulse * 2, 0.2, Math.PI * 1.8);
    ctx.stroke();

    this.drawMiniSpire(ctx, -24, -6, p, 0.58, pulse + 1);
    this.drawMiniSpire(ctx, 24, -6, p, 0.58, pulse + 1.5);
    if (damage > 0.16) this.drawDamageCracks(ctx, damage, p.glow, 24);
    ctx.restore();
  }

  drawSkullTurret(ctx, tower, defense, pulse, damage) {
    const p = defense.palette;
    const hit = tower.hitFlash > 0;
    ctx.save();
    ctx.shadowColor = p.glow;
    ctx.shadowBlur = 12 + pulse * 9;
    ctx.fillStyle = hit ? '#fff' : p.stone;
    this.roundRect(ctx, -22, -7, 44, 32, 9);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.hexToRgba(p.glow, 0.42);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = p.stone2;
    ctx.beginPath();
    ctx.moveTo(-20, -30);
    ctx.lineTo(0, -46);
    ctx.lineTo(20, -30);
    ctx.lineTo(16, -1);
    ctx.lineTo(-16, -1);
    ctx.closePath();
    ctx.fill();

    const skullGlow = ctx.createRadialGradient(0, -18, 1, 0, -18, 23 + pulse * 4);
    skullGlow.addColorStop(0, this.hexToRgba(p.glow, 0.88));
    skullGlow.addColorStop(0.55, this.hexToRgba(p.glow, 0.18));
    skullGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = skullGlow;
    ctx.beginPath();
    ctx.arc(0, -18, 21 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.glow;
    ctx.beginPath();
    ctx.arc(0, -17, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#130510';
    ctx.beginPath();
    ctx.arc(-5, -19, 3, 0, Math.PI * 2);
    ctx.arc(5, -19, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-4, -11, 8, 2);

    ctx.strokeStyle = this.hexToRgba(p.accent, 0.44 + pulse * 0.16);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-21, -24);
    ctx.lineTo(-31, -35);
    ctx.moveTo(21, -24);
    ctx.lineTo(31, -35);
    ctx.stroke();

    if (damage > 0.16) this.drawDamageCracks(ctx, damage, p.glow, 24);
    ctx.restore();
  }

  drawMiniSpire(ctx, x, y, palette, scale = 1, phase = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = palette.stone2;
    this.roundRect(ctx, -6, -11, 12, 22, 4);
    ctx.fill();
    ctx.fillStyle = palette.roof;
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(0, -26);
    ctx.lineTo(8, -10);
    ctx.closePath();
    ctx.fill();
    const r = 5 + Math.sin(phase * 3) * 1.2;
    ctx.fillStyle = palette.glow;
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, -4, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCustomiseSocket(ctx, tower, defense, pulse) {
    const p = defense.palette;
    ctx.save();
    ctx.translate(tower.radius + 11, tower.kind === 'core' ? -43 : -32);
    ctx.globalAlpha = 0.62;
    ctx.strokeStyle = this.hexToRgba(p.accent, 0.58 + pulse * 0.1);
    ctx.fillStyle = 'rgba(8,4,13,.68)';
    this.roundRect(ctx, -11, -8, 22, 16, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = p.accent;
    ctx.font = '900 8px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MOD', 0, 0);
    ctx.restore();
  }

  drawDamageCracks(ctx, damage, colour, size) {
    ctx.save();
    ctx.globalAlpha = clamp(damage, 0, 0.7);
    ctx.strokeStyle = this.hexToRgba(colour, 0.7);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const x = -size * 0.55 + i * size * 0.26;
      const y = -size * 0.35 + (i % 2) * size * 0.18;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 6, y + 8);
      ctx.lineTo(x + 2, y + 17);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawDestroyedOverlay(ctx, tower) {
    ctx.save();
    ctx.globalAlpha = 0.74;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.beginPath();
    ctx.ellipse(0, 4, tower.radius + 16, tower.radius + 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,91,110,.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-tower.radius, -tower.radius * .7);
    ctx.lineTo(tower.radius, tower.radius * .7);
    ctx.moveTo(tower.radius, -tower.radius * .7);
    ctx.lineTo(-tower.radius, tower.radius * .7);
    ctx.stroke();
    ctx.restore();
  }

  drawBuilding(ctx, building, game) {
    ctx.save();
    ctx.translate(building.x, building.y);
    const [primary, dark] = building.card.colours;
    const time = game.state?.elapsed || 0;
    const pulse = 0.55 + Math.sin(time * 2.8 + building.x) * 0.22 + (building.attackPulse || 0) * 1.5;
    const life = clamp(1 - building.age / Math.max(1, building.lifetime), 0, 1);

    ctx.globalAlpha = building.alive ? 1 : 0.5;
    const floor = ctx.createRadialGradient(0, 8, 2, 0, 8, building.radius + 28);
    floor.addColorStop(0, this.hexToRgba(primary, 0.18));
    floor.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.ellipse(0, 10, building.radius + 18, building.radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    if (building.cardId === 'hauntedGrave') {
      ctx.shadowColor = primary;
      ctx.shadowBlur = 10 + pulse * 8;
      ctx.fillStyle = building.hitFlash > 0 ? '#fff' : dark;
      this.roundRect(ctx, -18, -10, 36, 30, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = primary;
      this.roundRect(ctx, -11, -28, 22, 33, 7);
      ctx.fill();
      ctx.fillStyle = '#0b0610';
      ctx.fillRect(-7, -17, 14, 3);
      ctx.fillRect(-2, -24, 4, 17);
      ctx.strokeStyle = this.hexToRgba(primary, 0.5 + pulse * 0.1);
      ctx.beginPath();
      ctx.arc(0, -9, 22 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#e8e1c8';
      for (let i = 0; i < 3; i++) {
        const a = time * 2 + i * 2.1;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 13, -7 + Math.sin(a) * 4, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.shadowColor = primary;
      ctx.shadowBlur = 12 + pulse * 9;
      ctx.fillStyle = building.hitFlash > 0 ? '#fff' : dark;
      this.roundRect(ctx, -17, -7, 34, 31, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = primary;
      ctx.fillRect(-5, -32, 10, 31);
      ctx.beginPath();
      ctx.arc(0, -34, 9 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.hexToRgba(primary, 0.5);
      ctx.beginPath();
      ctx.arc(0, -34, 19 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0,0,0,.55)';
    this.roundRect(ctx, -21, -43, 42, 4, 2);
    ctx.fill();
    ctx.fillStyle = this.hexToRgba(primary, 0.58);
    this.roundRect(ctx, -21, -43, 42 * life, 4, 2);
    ctx.fill();
    this.healthBar(ctx, building, -21, -36, 42, 4, primary);
    ctx.restore();
  }

  drawUnit(ctx, unit, game) {
    const [primary, dark] = unit.card.colours;
    const profile = characterProfile(unit.skinId || unit.cardId);
    const anim = this.unitAnim(unit, game, profile);

    this.drawUnitMotionTrail(ctx, unit, primary, anim, profile);
    this.drawUnitShadow(ctx, unit, primary, anim);

    ctx.save();
    ctx.translate(unit.x, unit.y + anim.bob - anim.spawnLift);
    ctx.scale((unit.facing || 1) * anim.spawnScale * anim.profileScale, anim.spawnScale * anim.squashY * anim.profileScale);
    ctx.rotate(anim.lean + anim.routeLean);

    if (unit.spawnAnim > 0) {
      ctx.globalAlpha = clamp(1 - unit.spawnAnim / 0.38, 0.2, 1);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = this.hexToRgba(primary, 0.28);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, unit.radius + 18 * (unit.spawnAnim / 0.38), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    if (unit.hitFlash > 0) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 14;
    } else {
      ctx.shadowColor = primary;
      ctx.shadowBlur = unit.card.flying ? 18 : 8;
    }

    this.drawUnitAura(ctx, unit, primary, anim, profile);
    this.drawAttackAnticipation(ctx, unit, primary, anim, profile);

    const drewPremiumSprite = this.drawPremiumSpriteUnit(ctx, unit, primary, dark, anim, profile);
    if (!drewPremiumSprite) {
      switch (unit.cardId) {
        case 'bruteClown': this.drawBruteClown(ctx, unit, primary, dark, anim); break;
        case 'werewolfRunner': this.drawWerewolf(ctx, unit, primary, dark, anim); break;
        case 'midnightWitch': this.drawWitch(ctx, unit, primary, dark, anim); break;
        case 'skeletonSwarm':
        case 'summonedSkeleton': this.drawSkeleton(ctx, unit, primary, dark, anim); break;
        case 'gargoyle': this.drawGargoyle(ctx, unit, primary, dark, anim); break;
        case 'pumpkinCatapult': this.drawPumpkin(ctx, unit, primary, dark, anim); break;
        case 'graveGoblin': this.drawGoblin(ctx, unit, primary, dark, anim); break;
        default: this.drawGenericUnit(ctx, unit, primary, dark, anim);
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();

    this.healthBar(ctx, unit, unit.x - unit.radius - 6, unit.y - unit.radius - 18 + anim.bob, unit.radius * 2 + 12, 4, primary);
  }

  unitAnim(unit, game, profile = characterProfile(unit.skinId || unit.cardId)) {
    const time = unit.animTime || game.state?.elapsed || 0;
    const motion = unit.motion || {};
    const speed = unit.card.speed || 20;
    const cadence = profile.motion?.cadence || (speed > 40 ? 12 : speed > 30 ? 9 : speed > 18 ? 6 : 4.3);
    const step = (motion.stride || time * cadence) + unit.visualSeed;
    const breath = (motion.breath || time) + unit.visualSeed;
    const attack = clamp((unit.attackAnim || 0) / (unit.card.attackType === 'melee' ? 0.22 : 0.38), 0, 1);
    const spawn = clamp((unit.spawnAnim || 0) / 0.38, 0, 1);
    const flying = unit.card.flying ? 1 : 0;
    const speedNorm = motion.speedNorm || 0;
    const state = motion.state || 'idle';
    const locomotion = profile.motion?.locomotion || 'walk';
    const profileBob = profile.motion?.bob ?? 1.8;

    let bob = Math.sin(step) * (profileBob * (0.45 + speedNorm * 0.55));
    let squash = 1 + Math.sin(step * 2) * (flying ? 0.012 : 0.03) - attack * 0.04;
    let routeLean = motion.lean || 0;

    if (locomotion === 'hover') {
      bob = Math.sin(time * 3.6 + unit.visualSeed) * profileBob + Math.sin(time * 7.4) * 0.8;
      squash = 1 + Math.sin(breath) * 0.015;
      routeLean *= 0.45;
    } else if (locomotion === 'flap') {
      bob = Math.sin(time * 5.3 + unit.visualSeed) * profileBob;
      squash = 1 + Math.sin(time * 12) * 0.018;
    } else if (locomotion === 'stomp') {
      bob = Math.max(-1.3, Math.sin(step)) * profileBob * 0.75;
      squash = 1 + Math.abs(Math.sin(step)) * 0.035 - attack * 0.05;
    } else if (locomotion === 'pounce') {
      bob = Math.sin(step) * profileBob + Math.max(0, Math.sin(step * 0.5)) * 1.8;
      squash = 1 + Math.sin(step * 2) * 0.045 - attack * 0.06;
    } else if (locomotion === 'skitter' || locomotion === 'scuttle') {
      bob = Math.sin(step * 1.3) * profileBob * 0.75 + Math.sin(time * 19 + unit.visualSeed) * 0.45;
      squash = 1 + Math.sin(step * 3) * 0.035;
    } else if (locomotion === 'trundle') {
      bob = Math.sin(step) * 0.7;
      routeLean *= 0.35;
    }

    const anticipation = attack > 0.08 ? Math.sin(attack * Math.PI) : 0;
    const hitJolt = unit.hitFlash > 0 ? Math.sin(unit.hitFlash * 90) * 0.08 : 0;

    return {
      time,
      state,
      step,
      attack,
      spawn,
      bob,
      routeLean,
      lean: (unit.team === TEAM.PLAYER ? -0.025 : 0.025) + Math.sin(step * 0.5) * (profile.motion?.lean || 0.04) * 0.45 + hitJolt,
      squashY: squash,
      limb: Math.sin(step),
      limb2: Math.sin(step + Math.PI),
      flap: Math.sin(time * 13 + unit.visualSeed),
      spawnLift: spawn * 14,
      spawnScale: 1 + spawn * 0.18,
      ability: clamp((unit.abilityPulse || 0) / 0.72, 0, 1),
      hurt: clamp(unit.hitFlash / 0.16, 0, 1),
      speedNorm,
      anticipation,
      profileScale: profile.scale || 1,
      locomotion
    };
  }

  selectCharacterFrame(unit, profile, anim) {
    const id = profile.id || unit.skinId || unit.cardId;
    const frames = this.characterImages.get(id) || this.characterImages.get(profile.aliasOf) || this.characterImages.get(unit.card.characterId) || this.characterImages.get(unit.cardId);
    if (!frames) return null;
    const isAttack = (unit.attackAnim || 0) > 0.03;
    const isSpecial = (unit.abilityPulse || 0) > 0.08 || unit.frenzied;
    const isMoving = anim.state === 'walk' || unit.motion?.state === 'walk' || (unit.motion?.speedNorm || 0) > 0.12;
    const order = isAttack
      ? ['attack', 'special', 'walk', 'idle', 'sprite']
      : isSpecial
        ? ['special', 'attack', 'walk', 'idle', 'sprite']
        : isMoving
          ? ['walk', 'idle', 'sprite']
          : ['idle', 'sprite', 'walk'];
    for (const key of order) {
      if (this.isImageReady(frames[key])) return frames[key];
    }
    return null;
  }

  drawPremiumSpriteUnit(ctx, unit, primary, dark, anim, profile) {
    const img = this.selectCharacterFrame(unit, profile, anim);
    if (!img) return false;
    const art = profile.art || {};
    const attack = anim.attack;
    const ability = anim.ability;
    const h = (art.battlefieldHeight || Math.max(42, unit.radius * 4.8)) * (unit.card.flying ? 1.08 : 1);
    const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    const w = h * aspect;
    const anchorY = art.anchorY ?? 0.88;
    const lunge = unit.card.attackType === 'melee' ? attack * (unit.card.special === 'frenzy' ? 15 : 9) : 0;
    const recoil = unit.card.attackType === 'projectile' ? -attack * 5 : 0;
    const hover = unit.card.flying ? -10 + Math.sin(anim.time * 6.2 + unit.visualSeed) * 4.5 : 0;
    const specialPulse = unit.frenzied ? 1 : ability;

    ctx.save();
    ctx.translate(lunge + recoil, hover);

    // Team-coloured readability glow beneath real art.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, unit.radius * 0.55, 1, 0, unit.radius * 0.55, Math.max(22, unit.radius * 2.8));
    glow.addColorStop(0, this.hexToRgba(primary, unit.team === TEAM.PLAYER ? 0.24 : 0.18));
    glow.addColorStop(0.65, this.hexToRgba(primary, 0.05));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, unit.radius * 0.72, unit.radius * 2.2, unit.radius * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (unit.hitFlash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(unit.hitFlash / 0.16, 0, 1) * 0.42;
      ctx.filter = 'brightness(2.4) saturate(0.3)';
      ctx.drawImage(img, -w / 2, -h * anchorY, w, h);
      ctx.restore();
    }

    // Legendary / ability afterimage on fast and special units.
    if ((unit.frenzied || profile.motion?.trail || unit.card.flying) && (unit.motion?.speedNorm || 0) > 0.2) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = unit.frenzied ? 0.24 : 0.12;
      ctx.filter = `drop-shadow(0 0 8px ${profile.signature?.vfx || primary})`;
      ctx.translate(-Math.sign(unit.facing || 1) * 7, 1);
      ctx.drawImage(img, -w / 2, -h * anchorY, w, h);
      ctx.restore();
    }

    ctx.save();
    ctx.filter = `drop-shadow(0 6px 7px rgba(0,0,0,.72)) drop-shadow(0 0 ${unit.card.flying ? 10 : 5}px ${this.hexToRgba(primary, 0.38)})`;
    ctx.drawImage(img, -w / 2, -h * anchorY, w, h);
    ctx.restore();

    // Attack and special effects are drawn around the premium art, not as placeholder bodies.
    if (attack > 0.04) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const vfx = profile.signature?.vfx || primary;
      const a = Math.sin(attack * Math.PI);
      if (unit.card.attackType === 'melee') {
        ctx.strokeStyle = this.hexToRgba(vfx, 0.26 + 0.46 * a);
        ctx.lineWidth = 3.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(10 + a * 14, -h * 0.42, unit.radius + 18 + a * 8, -0.62, 0.78);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(6 + a * 11, -h * 0.28, unit.radius + 10 + a * 6, -0.1, 0.9);
        ctx.stroke();
      } else {
        ctx.fillStyle = this.hexToRgba(vfx, 0.28 + a * 0.28);
        ctx.beginPath();
        ctx.ellipse(0, -h * 0.42, unit.radius + 14 + a * 10, unit.radius * 0.7 + a * 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.hexToRgba(vfx, 0.5);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -h * 0.44, unit.radius + 17 + a * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (specialPulse > 0.05) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const vfx = unit.frenzied ? '#ffd86f' : (profile.signature?.vfx || primary);
      ctx.strokeStyle = this.hexToRgba(vfx, 0.20 + specialPulse * 0.32);
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 4, unit.radius + 20 + specialPulse * 9, unit.radius + 10 + specialPulse * 5, Math.sin(anim.time) * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Tiny contact dust/air wake improves perceived animation when using static concept art.
    if (!unit.card.flying && anim.state === 'walk') {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = this.hexToRgba(primary, 0.34);
      const step = Math.sin(anim.step * 2);
      ctx.beginPath();
      ctx.ellipse(-8 * step, unit.radius * 0.92, 5, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(8 * step, unit.radius * 0.9, 4, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    return true;
  }

  drawUnitMotionTrail(ctx, unit, primary, anim, profile) {
    const trail = unit.motion?.trail || [];
    if (!trail.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const ghost of trail.slice().reverse()) {
      const alpha = clamp(ghost.life / ghost.maxLife, 0, 1) * (unit.card.flying ? 0.18 : unit.frenzied ? 0.28 : 0.16);
      ctx.save();
      ctx.translate(ghost.x, ghost.y + anim.bob * 0.25);
      ctx.scale((ghost.facing || unit.facing || 1) * (profile.scale || 1), profile.scale || 1);
      ctx.fillStyle = this.hexToRgba(primary, alpha);
      ctx.strokeStyle = this.hexToRgba(profile.signature?.vfx || primary, alpha * 1.3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (unit.card.flying) {
        ctx.ellipse(0, -2, unit.radius * 2.0, unit.radius * 0.86, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(0, 2, unit.radius * 1.25, unit.radius * 1.05, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }


  drawAttackAnticipation(ctx, unit, primary, anim, profile) {
    if (anim.attack <= 0.03 && anim.ability <= 0.04 && !unit.frenzied) return;
    const vfx = profile.signature?.vfx || primary;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (anim.attack > 0.03) {
      const a = Math.sin(anim.attack * Math.PI);
      ctx.strokeStyle = this.hexToRgba(vfx, 0.18 + a * 0.26);
      ctx.lineWidth = unit.card.attackType === 'melee' ? 2.5 : 1.7;
      ctx.beginPath();
      if (unit.card.attackType === 'melee') {
        ctx.arc(8 + a * 10, -1, unit.radius + 8 + a * 8, -0.78, 0.78);
      } else {
        ctx.ellipse(0, -4, unit.radius + 10 + a * 7, unit.radius * 0.75 + a * 4, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
    if (unit.frenzied || anim.ability > 0.05) {
      const pulse = unit.frenzied ? 1 : anim.ability;
      ctx.strokeStyle = this.hexToRgba(unit.frenzied ? '#ffd86f' : vfx, 0.12 + pulse * 0.22);
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 5, unit.radius + 13 + pulse * 8, unit.radius * 0.75 + 7, Math.sin(anim.time) * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  drawUnitShadow(ctx, unit, primary, anim) {
    ctx.save();
    ctx.fillStyle = unit.card.flying ? 'rgba(0,0,0,.24)' : 'rgba(0,0,0,.38)';
    const w = unit.radius * (unit.card.flying ? 2.4 : 2.0);
    const h = unit.radius * (unit.card.flying ? 0.55 : 0.66);
    ctx.beginPath();
    ctx.ellipse(unit.x, unit.y + unit.radius * 0.72, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    if (unit.frenzied) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = this.hexToRgba(primary, 0.1);
      ctx.beginPath();
      ctx.ellipse(unit.x, unit.y + unit.radius * 0.6, w + 10, h + 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawUnitAura(ctx, unit, primary, anim, profile = characterProfile(unit.skinId || unit.cardId)) {
    if (!unit.frenzied && anim.ability <= 0.02 && !unit.card.flying) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = this.hexToRgba(unit.frenzied ? '#ffd86f' : (profile.signature?.vfx || primary), unit.frenzied ? 0.42 : 0.22 + anim.ability * 0.24);
    ctx.lineWidth = unit.frenzied ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 2, unit.radius + 6 + anim.ability * 9, unit.radius + 4 + anim.ability * 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawBruteClown(ctx, unit, primary, dark, anim) {
    const swing = anim.attack;
    ctx.save();
    ctx.translate(-swing * 4, 0);

    // Stomping boots and heavy body.
    ctx.fillStyle = '#19101c';
    ctx.beginPath();
    ctx.ellipse(-8, 14 + anim.limb * 2, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(9, 14 - anim.limb * 2, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : dark;
    ctx.beginPath();
    ctx.ellipse(0, 2, unit.radius * 1.1, unit.radius * 1.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f5f0e4';
    ctx.beginPath();
    ctx.arc(0, -11, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(-12, -11, 5, 0, Math.PI * 2);
    ctx.arc(12, -11, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-4, -13, 2, 0, Math.PI * 2);
    ctx.arc(4, -13, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff5b6e';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -7, 5, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Mallet with clear wind-up and slam.
    ctx.save();
    ctx.translate(10, -1);
    ctx.rotate(-0.9 + swing * 1.85);
    ctx.strokeStyle = '#ffd86f';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, -15);
    ctx.stroke();
    ctx.fillStyle = '#6b2534';
    this.roundRect(ctx, 18, -24, 18, 14, 5);
    ctx.fill();
    ctx.restore();

    if (swing > 0.45) {
      ctx.strokeStyle = this.hexToRgba('#ffd86f', 0.5 * swing);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(11, -4, 31, -0.3, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawWerewolf(ctx, unit, primary, dark, anim) {
    const run = anim.limb;
    const attack = anim.attack;
    if (unit.frenzied) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,216,111,.12)';
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(-i * 7, 2 + i, unit.radius * 1.1, unit.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.strokeStyle = primary;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5, 8);
    ctx.lineTo(-13, 17 + run * 4);
    ctx.moveTo(6, 8);
    ctx.lineTo(14, 17 - run * 4);
    ctx.stroke();

    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : dark;
    ctx.beginPath();
    ctx.moveTo(-unit.radius, 8);
    ctx.lineTo(-8, -9);
    ctx.lineTo(-2, -unit.radius - 5);
    ctx.lineTo(3, -9);
    ctx.lineTo(9, -unit.radius - 5);
    ctx.lineTo(unit.radius, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -3, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = unit.frenzied ? '#ffd86f' : '#f3d8aa';
    ctx.lineWidth = 2 + attack * 2;
    ctx.beginPath();
    ctx.moveTo(7, -1);
    ctx.lineTo(24 + attack * 10, -9 - attack * 2);
    ctx.moveTo(8, 5);
    ctx.lineTo(25 + attack * 11, 7 + attack * 5);
    ctx.moveTo(7, 10);
    ctx.lineTo(22 + attack * 10, 18 + attack * 4);
    ctx.stroke();
  }

  drawWitch(ctx, unit, primary, dark, anim) {
    const hover = Math.sin(anim.time * 3 + unit.visualSeed) * 3;
    ctx.save();
    ctx.translate(0, hover);
    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : dark;
    ctx.beginPath();
    ctx.moveTo(-14, 13);
    ctx.quadraticCurveTo(-9, -7, 0, -11);
    ctx.quadraticCurveTo(11, -5, 14, 13);
    ctx.quadraticCurveTo(0, 20, -14, 13);
    ctx.fill();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(-16, -7);
    ctx.lineTo(0, -30 - anim.ability * 5);
    ctx.lineTo(16, -7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd86f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -12);
    ctx.lineTo(12, -15);
    ctx.stroke();

    // Staff and orbiting hex rune.
    ctx.save();
    ctx.translate(13, -1);
    ctx.rotate(-0.25 - anim.attack * 0.65);
    ctx.strokeStyle = '#ffd86f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(9, -22);
    ctx.stroke();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(10, -24, 5 + anim.ability * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = this.hexToRgba(primary, 0.18 + anim.ability * 0.45);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 5, 20 + anim.ability * 8, 8 + anim.ability * 4, Math.sin(anim.time) * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawSkeleton(ctx, unit, primary, dark, anim) {
    const jitter = unit.cardId === 'skeletonSwarm' ? Math.sin(anim.time * 18 + unit.visualSeed) * 1.2 : 0;
    ctx.save();
    ctx.translate(jitter, 0);
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-10, 15 + anim.limb * 3);
    ctx.moveTo(4, 6);
    ctx.lineTo(10, 15 - anim.limb * 3);
    ctx.moveTo(-6, 2);
    ctx.lineTo(-13 - anim.attack * 9, -5);
    ctx.moveTo(6, 2);
    ctx.lineTo(15 + anim.attack * 12, 1 - anim.attack * 4);
    ctx.stroke();

    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : primary;
    ctx.beginPath();
    ctx.arc(0, -6, unit.radius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(-5, -8, 3, 3);
    ctx.fillRect(3, -8, 3, 3);
    ctx.fillRect(-2, -2, 4, 2);
    ctx.strokeStyle = dark;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, 10);
    ctx.moveTo(-7, 5);
    ctx.lineTo(7, 5);
    ctx.stroke();
    ctx.restore();
  }

  drawGargoyle(ctx, unit, primary, dark, anim) {
    const flap = anim.flap;
    ctx.save();
    ctx.translate(0, -2);
    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : dark;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.lineTo(-26, -17 - flap * 7);
    ctx.lineTo(-18, 7 + flap * 3);
    ctx.lineTo(-5, 7);
    ctx.lineTo(0, 14);
    ctx.lineTo(5, 7);
    ctx.lineTo(18, 7 + flap * 3);
    ctx.lineTo(26, -17 - flap * 7);
    ctx.lineTo(4, -5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -2, unit.radius + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#17202a';
    ctx.beginPath();
    ctx.arc(-4, -5, 2, 0, Math.PI * 2);
    ctx.arc(4, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.hexToRgba('#88efff', 0.35 + anim.attack * 0.35);
    ctx.beginPath();
    ctx.arc(0, -2, 16 + anim.attack * 7, -0.6, Math.PI + 0.6);
    ctx.stroke();
    ctx.restore();
  }

  drawPumpkin(ctx, unit, primary, dark, anim) {
    const wheel = anim.time * 7;
    const cock = anim.attack;
    ctx.save();
    ctx.fillStyle = '#1a1015';
    this.roundRect(ctx, -18, -1, 35, 18, 7);
    ctx.fill();
    ctx.strokeStyle = dark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-10, 16, 6, 0, Math.PI * 2);
    ctx.arc(12, 16, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10 + Math.cos(wheel) * 5, 16 + Math.sin(wheel) * 5);
    ctx.lineTo(-10 - Math.cos(wheel) * 5, 16 - Math.sin(wheel) * 5);
    ctx.moveTo(12 + Math.cos(wheel) * 5, 16 + Math.sin(wheel) * 5);
    ctx.lineTo(12 - Math.cos(wheel) * 5, 16 - Math.sin(wheel) * 5);
    ctx.stroke();

    ctx.save();
    ctx.translate(-7, -3);
    ctx.rotate(-0.95 - cock * 0.7);
    ctx.strokeStyle = '#ffd86f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-22, -16);
    ctx.stroke();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(-24, -18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : primary;
    ctx.beginPath();
    ctx.arc(6, -10, unit.radius + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4b1f0c';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(6 + i * 2, -10, unit.radius - Math.abs(i) * 2, -1.1, 1.1);
      ctx.stroke();
    }
    ctx.fillStyle = '#111';
    ctx.fillRect(1, -14, 4, 3);
    ctx.fillRect(9, -14, 4, 3);
    ctx.fillRect(4, -6, 8, 2);
    ctx.restore();
  }

  drawGoblin(ctx, unit, primary, dark, anim) {
    const scuttle = anim.limb;
    const stab = anim.attack;
    ctx.save();
    ctx.translate(0, 1);
    ctx.strokeStyle = dark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-5, 9);
    ctx.lineTo(-13, 16 + scuttle * 3);
    ctx.moveTo(5, 9);
    ctx.lineTo(13, 16 - scuttle * 3);
    ctx.stroke();

    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : dark;
    ctx.beginPath();
    ctx.ellipse(0, 2, unit.radius + 2, unit.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(-unit.radius, -4);
    ctx.lineTo(-24, -12 - scuttle * 2);
    ctx.lineTo(-unit.radius + 2, 5);
    ctx.moveTo(unit.radius, -4);
    ctx.lineTo(24, -12 + scuttle * 2);
    ctx.lineTo(unit.radius - 2, 5);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -2, unit.radius * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-4, -4, 2, 0, Math.PI * 2);
    ctx.arc(4, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e8e1c8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(8, 3);
    ctx.lineTo(23 + stab * 13, -8 - stab * 4);
    ctx.stroke();
    if (stab > 0.35) {
      ctx.strokeStyle = this.hexToRgba(primary, 0.45 * stab);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, -5, 13 + stab * 8, -0.5, 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawGenericUnit(ctx, unit, primary, dark, anim) {
    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : dark;
    ctx.beginPath();
    ctx.arc(0, 0, unit.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawProjectile(ctx, projectile) {
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    if (projectile.target) ctx.rotate(Math.atan2(projectile.target.y - projectile.y, projectile.target.x - projectile.x));
    const styles = {
      pumpkin: ['#ff9b35', 8, 'lob'],
      stone: ['#9da9b8', 5, 'rock'],
      hex: ['#d58cff', 5, 'rune'],
      corebolt: ['#ffd86f', 5, 'bolt'],
      bolt: ['#88efff', 4, 'bolt'],
      soulBolt: ['#88efff', 5, 'beam'],
      bloodBolt: ['#ff5b6e', 5, 'beam'],
      gateBolt: ['#7dff66', 6, 'beam'],
      mausoleumBolt: ['#d58cff', 6, 'beam']
    };
    const [colour, r, shape] = styles[projectile.style] || styles.bolt;
    ctx.shadowColor = colour;
    ctx.shadowBlur = 16;
    ctx.globalCompositeOperation = 'lighter';

    if (shape === 'beam') {
      ctx.strokeStyle = this.hexToRgba(colour, 0.42);
      ctx.lineWidth = r * 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 2.4, 0);
      ctx.lineTo(r * 1.8, 0);
      ctx.stroke();
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'rune') {
      ctx.strokeStyle = colour;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r, r * .55);
      ctx.lineTo(-r, r * .55);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = this.hexToRgba(colour, 0.52);
      ctx.fill();
    } else if (shape === 'lob') {
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#512613';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r * .7, -1.2, 1.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEffect(ctx, effect) {
    ctx.save();
    const alpha = clamp(effect.life / effect.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    if (effect.type === 'dust' || effect.type === 'stompDust') {
      ctx.translate(effect.x, effect.y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = this.normaliseEffectColour(effect.colour, effect.type === 'stompDust' ? 0.18 : 0.12);
      ctx.beginPath();
      ctx.ellipse(0, 0, effect.size * (1.2 - alpha * 0.15), effect.size * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      if (effect.type === 'stompDust') {
        ctx.strokeStyle = this.normaliseEffectColour(effect.colour, 0.26);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, effect.size * (1.15 + (1 - alpha) * 0.8), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (effect.type === 'airwake') {
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle || 0);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = this.normaliseEffectColour(effect.colour, 0.18);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, effect.size * 1.6, effect.size * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (effect.type === 'burst') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = effect.colour;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, (1 - alpha) * 24 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = effect.colour;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 5 + (1 - alpha) * 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    if (effect.type === 'slash') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle || -0.4);
      ctx.strokeStyle = effect.colour;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 16 + (1 - alpha) * 7, -0.75, 0.75);
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.fillStyle = effect.colour;
    ctx.font = `900 ${effect.size}px Inter, system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(effect.text, effect.x, effect.y);
    ctx.restore();
  }

  drawEndState(ctx, game) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.56)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = game.state.over === 'victory' ? '#7dff66' : '#ff5b6e';
    ctx.font = '1000 42px Inter, system-ui';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 18;
    ctx.fillText(game.state.over === 'victory' ? 'VICTORY' : 'DEFEAT', VIEW.width / 2, 330);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = '900 14px Inter, system-ui';
    ctx.fillText(game.state.over === 'victory' ? 'Bones earned. Enemy brain beaten.' : 'Enemy brain controlled the park.', VIEW.width / 2, 374);
    ctx.font = '800 11px Inter, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.fillText('V18: character pipeline, motion rigs and cinematic monster feedback.', VIEW.width / 2, 398);
    ctx.restore();
  }

  healthBar(ctx, entity, x, y, w, h, colour) {
    if (!entity.maxHp) return;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    this.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = colour;
    this.roundRect(ctx, x, y, w * clamp(entity.hp / entity.maxHp, 0, 1), h, h / 2);
    ctx.fill();
  }

  strokeSmoothPath(ctx, points) {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
