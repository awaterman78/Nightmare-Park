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

console.log(`Monster Clash Unity foundation smoke test passed across ${csharpFiles.length} C# files.`);
