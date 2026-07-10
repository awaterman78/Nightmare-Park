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

const workflow = readFileSync(new URL('../.github/workflows/unity-webgl-diagnostic-build.yml', import.meta.url), 'utf8');
assert.ok(workflow.includes('MonsterClash.Editor.MonsterClashBuild.BuildWebGL'), 'Cloud build must invoke the production build entry point');

const buildEntryPoint = readFileSync(new URL('Editor/MonsterClashBuild.cs', sourceRoot), 'utf8');
assert.ok(buildEntryPoint.includes('public static void PreExport()'), 'Unity Build Automation needs a public pre export hook');
assert.ok(buildEntryPoint.includes('PROJECT:MonsterClashMobile'), 'Web builds should use the mobile responsive template');
assert.ok(buildEntryPoint.includes('defaultWebScreenWidth = 430'), 'Web builds should default to a portrait canvas');
assert.ok(buildEntryPoint.includes('GraphicsDeviceType.OpenGLES3'), 'iPhone builds should target the stable WebGL 2 graphics path');
assert.ok(buildEntryPoint.includes('PlayerSettings.WebGL.wasm2023 = false'), 'Web builds should retain Safari 15 compatibility');

const input = readFileSync(new URL('Runtime/BattleInputController.cs', sourceRoot), 'utf8');
assert.ok(input.includes('OnWebPointerDown'), 'Web builds need a direct browser pointer bridge');
assert.ok(input.includes('MonsterClashInput_Install'), 'Web builds need a compiled browser pointer bridge');
assert.ok(input.includes('OnWebPointerUp'), 'Web builds need pointer release input for card dragging');
assert.ok(input.includes('hud.TryGetHandIndex'), 'Card selection should not depend on immediate mode GUI touch handling');

const webInputPlugin = readFileSync(new URL('../Plugins/WebGL/MonsterClashInput.jslib', sourceRoot), 'utf8');
assert.ok(webInputPlugin.includes('MonsterClashInput_HasPointerDown'), 'Web input plug-in should expose pointer press state');
assert.ok(webInputPlugin.includes('MonsterClashInput_HasPointerUp'), 'Web input plug-in should expose pointer release state');
assert.ok(webInputPlugin.includes('setPointerCapture'), 'Web input plug-in should retain drag input outside a card');

const hud = readFileSync(new URL('Runtime/BattleHud.cs', sourceRoot), 'utf8');
assert.ok(hud.includes('public bool TryGetHandIndex'), 'HUD should expose deterministic mobile card hit testing');

const mobileTemplate = readFileSync(new URL('../WebGLTemplates/MonsterClashMobile/index.html', sourceRoot), 'utf8');
assert.ok(mobileTemplate.includes('viewport-fit=cover'), 'Mobile template should support iPhone safe areas');
assert.ok(mobileTemplate.includes('touch-action: none'), 'Mobile template should prevent browser gestures from stealing game input');
assert.ok(mobileTemplate.includes('devicePixelRatio: isMobile ? 1'), 'Mobile template should avoid an oversized Retina framebuffer');
assert.ok(mobileTemplate.includes('OnWebPointerDown'), 'Mobile template should forward pointer input into Unity');
assert.ok(mobileTemplate.includes('OnWebPointerUp'), 'Mobile template should forward drag release input into Unity');

console.log(`Monster Clash Unity foundation smoke test passed across ${csharpFiles.length} C# files.`);
