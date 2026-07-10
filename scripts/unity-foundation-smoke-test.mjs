import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const unityRoot = new URL('../unity/Assets/', import.meta.url);
const sourceRoot = new URL('../unity/Assets/MonsterClash/', import.meta.url);

function walk(directory) {
  const paths = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) paths.push(...walk(path));
    else paths.push(path);
  }
  return paths;
}

const csharpFiles = walk(unityRoot.pathname).filter(path => path.endsWith('.cs'));
assert.ok(csharpFiles.length >= 12, 'Unity production foundation should contain a meaningful set of C# files');

const publicTypes = new Map();
for (const file of csharpFiles) {
  const source = readFileSync(file, 'utf8');
  const display = relative(unityRoot.pathname, file);
  assert.ok(!source.includes('namespace NightmarePark'), `${display} still contains the abandoned prototype namespace`);

  const types = source.matchAll(/public\s+(?:sealed\s+|static\s+)?(?:class|enum|struct|interface)\s+(\w+)/g);
  for (const match of types) {
    const typeName = match[1];
    assert.ok(!publicTypes.has(typeName), `Duplicate Unity type ${typeName} in ${display} and ${publicTypes.get(typeName)}`);
    publicTypes.set(typeName, display);
  }

  const opens = [...source].filter(character => character === '{').length;
  const closes = [...source].filter(character => character === '}').length;
  assert.equal(opens, closes, `${display} has unbalanced braces`);
}

for (const required of [
  'BattleDirector',
  'MonsterActor',
  'MonsterCard',
  'ArenaLayout',
  'DefenceTower',
  'BattleHud',
  'BattleInputController',
  'ArenaPointerSurface',
  'CardPointerHandler',
  'DirectWebInput',
  'PortraitCameraFit',
  'MonsterClashBootstrap',
  'MonsterClashBuild'
]) {
  assert.ok(publicTypes.has(required), `Missing required Unity type ${required}`);
}

const bootstrap = readFileSync(new URL('Runtime/MonsterClashBootstrap.cs', sourceRoot), 'utf8');
for (const cardId of [
  'grave_goblin',
  'candle_imp',
  'tin_bat',
  'mirror_clown',
  'zombie_runner',
  'bone_brute',
  'phantom_bride',
  'werewolf_king'
]) {
  assert.ok(bootstrap.includes(`"${cardId}"`), `Starter deck is missing ${cardId}`);
}

assert.ok(bootstrap.includes('-BattleBalance.BridgeX'), 'Arena should create the left bridge');
assert.ok(bootstrap.includes('BattleBalance.BridgeX, bridge'), 'Arena should create the right bridge');

const director = readFileSync(new URL('Runtime/BattleDirector.cs', sourceRoot), 'utf8');
assert.ok(director.includes('BattleBalance.HandSize'), 'Battle director should use a rotating four card hand');
assert.ok(director.includes('DoubleEnergyStartsAt'), 'Battle director should implement the final minute energy ramp');
assert.ok(director.includes('TryDeploySelected'), 'Battle director should expose player deployment');
assert.ok(director.includes('RunEnemyTurn'), 'Battle director should include an enemy opponent loop');
assert.ok(director.includes('arena.ClampDeployment'), 'Player placement should clamp into the legal arena area');

const workflow = readFileSync(new URL('../.github/workflows/unity-webgl-diagnostic-build.yml', import.meta.url), 'utf8');
assert.ok(workflow.includes('MonsterClash.Editor.MonsterClashBuild.BuildWebGL'), 'Cloud build must invoke the production build entry point');
assert.ok(workflow.includes('Run Monster Clash smoke test'), 'Pull requests should run the repository input checks');

const buildEntryPoint = readFileSync(new URL('Editor/MonsterClashBuild.cs', sourceRoot), 'utf8');
assert.ok(buildEntryPoint.includes('public static void PreExport()'), 'Unity Build Automation needs a public pre export hook');
assert.ok(buildEntryPoint.includes('PROJECT:MonsterClashMobile'), 'Web builds should use the mobile responsive template');
assert.ok(buildEntryPoint.includes('defaultWebScreenWidth = 430'), 'Web builds should default to a portrait canvas');
assert.ok(buildEntryPoint.includes('GraphicsDeviceType.OpenGLES3'), 'iPhone builds should target the stable WebGL 2 graphics path');
assert.ok(buildEntryPoint.includes('PlayerSettings.WebGL.wasm2023 = false'), 'Web builds should retain Safari 15 compatibility');

const input = readFileSync(new URL('Runtime/BattleInputController.cs', sourceRoot), 'utf8');
assert.ok(input.includes('enabled = false'), 'The retired custom input component should stay disabled');
assert.ok(!input.includes('OnWebPointerEvent'), 'The retired input component must not own browser taps');
assert.ok(!input.includes('webPointerEvents'), 'The retired input component must not queue browser events');
assert.ok(!input.includes('DllImport'), 'Mobile input must not depend on a WebGL plug-in entry point');

const hud = readFileSync(new URL('Runtime/BattleHud.cs', sourceRoot), 'utf8');
assert.ok(hud.includes('BUILD 13'), 'HUD should carry the visible Build 13 marker');
assert.ok(hud.includes('matchWidthOrHeight = 0f'), 'HUD should lock scaling to screen width so four cards cannot clip');
assert.ok(hud.includes('Screen.safeArea'), 'HUD should respect phone safe areas');
assert.ok(hud.includes('PortraitDockTop'), 'HUD should define a compact portrait dock');
assert.ok(hud.includes('WideDockTop'), 'HUD should adapt to the Unity preview aspect ratio');
assert.ok(hud.includes('minimumX = 0.015f + i * 0.2475f'), 'Four card slots should fit fully across the width');
assert.ok(hud.includes('SetHudViewport'), 'HUD should reserve a dedicated middle viewport for the arena');
assert.ok(hud.includes('CardPortrait'), 'Cards should support production portrait art without another layout rebuild');
assert.ok(hud.includes('GraphicRaycaster'), 'HUD should retain Unity UI rendering and desktop input');
assert.ok(!hud.includes('OnGUI'), 'The mobile HUD must not use immediate mode GUI input');

const cameraFit = readFileSync(new URL('Runtime/PortraitCameraFit.cs', sourceRoot), 'utf8');
assert.ok(cameraFit.includes('SetHudViewport'), 'Camera should expose the HUD-safe arena viewport');
assert.ok(cameraFit.includes('battleCamera.rect'), 'Arena camera should render only between the top HUD and card dock');

const directInput = readFileSync(new URL('Runtime/DirectWebInput.cs', sourceRoot), 'utf8');
assert.ok(directInput.includes('BUILD 13 · DIRECT TAP'), 'Direct input should carry the Build 13 marker');
assert.ok(directInput.includes('public void OnWebTap'), 'Direct input should expose one browser tap entry point');
assert.ok(directInput.includes('Screen.safeArea'), 'Tap coordinates should align with the safe-area card layout');
assert.ok(directInput.includes('normalisedX * BattleBalance.HandSize') || directInput.includes('safeX * BattleBalance.HandSize'), 'Card taps should map deterministically to the four card slots');
assert.ok(directInput.includes('BattleBalance.ArenaHalfWidth'), 'Arena taps should map directly to arena width');
assert.ok(directInput.includes('BattleBalance.ArenaHalfLength'), 'Arena taps should map directly to player deployment depth');
assert.ok(directInput.includes('director.TryDeploySelected'), 'Direct arena taps should deploy the selected card');

const mobileTemplate = readFileSync(new URL('../WebGLTemplates/MonsterClashMobile/index.html', sourceRoot), 'utf8');
assert.ok(mobileTemplate.includes('viewport-fit=cover'), 'Mobile template should support iPhone safe areas');
assert.ok(mobileTemplate.includes('touch-action: none'), 'Mobile template should prevent browser gestures from stealing taps');
assert.ok(mobileTemplate.includes('devicePixelRatio: isMobile ? 1'), 'Mobile template should avoid an oversized Retina framebuffer');
assert.ok(mobileTemplate.includes('OPENING MONSTER CLASH · BUILD 13'), 'Loading screen should identify Build 13');
assert.ok(mobileTemplate.includes('SendMessage("Direct Web Input", "OnWebTap"'), 'Template should retain the proven direct tap bridge');
assert.ok(mobileTemplate.includes('touchstart'), 'Touch devices should use the proven DOM touch path');
assert.ok(mobileTemplate.includes('normalisedX'), 'Template should normalise taps against the visible canvas');
assert.ok(mobileTemplate.includes('normalisedY'), 'Template should normalise vertical taps against the visible canvas');

console.log(`Monster Clash Build 13 smoke test passed across ${csharpFiles.length} C# files.`);
