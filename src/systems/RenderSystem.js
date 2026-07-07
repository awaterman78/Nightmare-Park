import { FIELD, TEAM, VIEW } from '../core/constants.js';
import { clamp } from '../core/math.js';

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
      `${window.location.pathname.replace(/[^/]*$/, '')}assets/maps/nightmare_park_arena_v14_4k.jpg`
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
        console.warn('Nightmare Park map asset failed to load. Expected assets/maps/nightmare_park_arena_v14_4k.jpg');
      }
    };
    this.mapImage.src = this.mapImageCandidates[0];
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

    for (const tower of game.state.towers) this.drawTower(ctx, tower);
    for (const building of game.state.buildings) this.drawBuilding(ctx, building);
    for (const unit of game.state.units) this.drawUnit(ctx, unit);
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
      this.mapImageFailed ? 'MAP ASSET MISSING: upload assets/maps/nightmare_park_arena_v14_4k.jpg' : 'LOADING 4K MAP...',
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
      ctx.strokeStyle = 'rgba(125,255,102,.055)';
      ctx.lineWidth = lane.width || 34;
      this.strokeSmoothPath(ctx, lane.points);
      ctx.strokeStyle = 'rgba(255,216,111,.07)';
      ctx.lineWidth = 4;
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

  drawTower(ctx, tower) {
    ctx.save();
    ctx.translate(tower.x, tower.y);
    const enemy = tower.team === TEAM.ENEMY;
    const base = enemy ? '#3b1422' : '#173526';
    const glow = enemy ? '#ff5b6e' : '#7dff66';
    ctx.shadowColor = glow;
    ctx.shadowBlur = tower.kind === 'core' ? 15 : 10;
    ctx.fillStyle = tower.hitFlash > 0 ? '#fff' : base;
    this.roundRect(ctx, -tower.radius, -tower.radius, tower.radius * 2, tower.radius * 2, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = enemy ? 'rgba(255,91,110,.66)' : 'rgba(125,255,102,.66)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = enemy ? '#ff5b6e' : '#7dff66';
    ctx.beginPath();
    ctx.moveTo(-tower.radius * .62, -tower.radius * .15);
    ctx.lineTo(0, -tower.radius * .82);
    ctx.lineTo(tower.radius * .62, -tower.radius * .15);
    ctx.closePath();
    ctx.fill();
    if (!tower.alive) {
      ctx.fillStyle = 'rgba(0,0,0,.62)';
      ctx.fillRect(-tower.radius, -tower.radius, tower.radius * 2, tower.radius * 2);
    }
    this.healthBar(ctx, tower, -tower.radius - 2, -tower.radius - 9, tower.radius * 2 + 4, 5, enemy ? '#ff5b6e' : '#7dff66');
    ctx.restore();
  }

  drawBuilding(ctx, building) {
    ctx.save();
    ctx.translate(building.x, building.y);
    const [primary, dark] = building.card.colours;
    ctx.shadowColor = primary;
    ctx.shadowBlur = 12;
    ctx.fillStyle = building.hitFlash > 0 ? '#fff' : dark;
    ctx.beginPath();
    ctx.arc(0, 0, building.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (building.cardId === 'hauntedGrave') {
      ctx.fillStyle = primary;
      this.roundRect(ctx, -8, -17, 16, 24, 5);
      ctx.fill();
      ctx.fillStyle = '#0b0610';
      ctx.fillRect(-5, -8, 10, 3);
    } else {
      ctx.fillStyle = primary;
      ctx.fillRect(-5, -22, 10, 24);
      ctx.beginPath();
      ctx.arc(0, -24, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    this.healthBar(ctx, building, -18, -29, 36, 5, primary);
    ctx.restore();
  }

  drawUnit(ctx, unit) {
    ctx.save();
    ctx.translate(unit.x, unit.y);
    ctx.scale(unit.facing || 1, 1);
    const [primary, dark] = unit.card.colours;
    ctx.shadowColor = primary;
    ctx.shadowBlur = unit.card.flying ? 15 : 7;
    ctx.fillStyle = unit.hitFlash > 0 ? '#fff' : dark;

    switch (unit.cardId) {
      case 'bruteClown': this.drawBruteClown(ctx, unit, primary, dark); break;
      case 'werewolfRunner': this.drawWerewolf(ctx, unit, primary, dark); break;
      case 'midnightWitch': this.drawWitch(ctx, unit, primary, dark); break;
      case 'skeletonSwarm':
      case 'summonedSkeleton': this.drawSkeleton(ctx, unit, primary, dark); break;
      case 'gargoyle': this.drawGargoyle(ctx, unit, primary, dark); break;
      case 'pumpkinCatapult': this.drawPumpkin(ctx, unit, primary, dark); break;
      case 'graveGoblin': this.drawGoblin(ctx, unit, primary, dark); break;
      default: this.drawGenericUnit(ctx, unit, primary, dark);
    }

    ctx.shadowBlur = 0;
    this.healthBar(ctx, unit, -unit.radius - 5, -unit.radius - 12, unit.radius * 2 + 10, 4, primary);
    if (unit.frenzied) {
      ctx.strokeStyle = '#ffd86f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, unit.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBruteClown(ctx, unit, primary, dark) {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(0, 1, unit.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(-4, -7, 5, 0, Math.PI * 2);
    ctx.arc(5, -7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd86f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(24, -13);
    ctx.stroke();
  }

  drawWerewolf(ctx, unit, primary, dark) {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-unit.radius, 8);
    ctx.lineTo(-5, -unit.radius);
    ctx.lineTo(0, -7);
    ctx.lineTo(5, -unit.radius);
    ctx.lineTo(unit.radius, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = unit.frenzied ? '#ffd86f' : primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(21, -5);
    ctx.moveTo(8, 6);
    ctx.lineTo(22, 8);
    ctx.stroke();
  }

  drawWitch(ctx, unit, primary, dark) {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(0, 2, unit.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(-14, -7);
    ctx.lineTo(0, -25);
    ctx.lineTo(14, -7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd86f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, -2);
    ctx.lineTo(21, -18);
    ctx.stroke();
  }

  drawSkeleton(ctx, unit, primary, dark) {
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -4, unit.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, 10);
    ctx.moveTo(-7, 5);
    ctx.lineTo(7, 5);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fillRect(-4, -5, 2, 2);
    ctx.fillRect(3, -5, 2, 2);
  }

  drawGargoyle(ctx, unit, primary, dark) {
    ctx.fillStyle = 'rgba(0,0,0,.32)';
    ctx.beginPath();
    ctx.ellipse(0, 13, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.lineTo(-25, -18);
    ctx.lineTo(-15, 6);
    ctx.lineTo(0, 10);
    ctx.lineTo(15, 6);
    ctx.lineTo(25, -18);
    ctx.lineTo(4, -5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, 0, unit.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPumpkin(ctx, unit, primary, dark) {
    ctx.fillStyle = dark;
    this.roundRect(ctx, -16, -3, 30, 18, 6);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(5, -11, unit.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd86f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-13, -5);
    ctx.lineTo(-26, -22);
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fillRect(0, -14, 4, 3);
    ctx.fillRect(8, -14, 4, 3);
  }

  drawGoblin(ctx, unit, primary, dark) {
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(0, 0, unit.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.moveTo(-unit.radius, -4);
    ctx.lineTo(-22, -10);
    ctx.lineTo(-unit.radius + 2, 4);
    ctx.moveTo(unit.radius, -4);
    ctx.lineTo(22, -10);
    ctx.lineTo(unit.radius - 2, 4);
    ctx.fill();
    ctx.strokeStyle = '#e8e1c8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(9, 2);
    ctx.lineTo(22, -8);
    ctx.stroke();
  }

  drawGenericUnit(ctx, unit, primary, dark) {
    ctx.fillStyle = dark;
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
    const styles = {
      pumpkin: ['#ff9b35', 8],
      stone: ['#9da9b8', 5],
      hex: ['#d58cff', 5],
      corebolt: ['#ffd86f', 5],
      bolt: ['#88efff', 4]
    };
    const [colour, r] = styles[projectile.style] || styles.bolt;
    ctx.shadowColor = colour;
    ctx.shadowBlur = 12;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawEffect(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = clamp(effect.life / effect.maxLife, 0, 1);
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
    ctx.fillText('V14 uses real map art plus navmesh-aware deployment.', VIEW.width / 2, 374);
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
