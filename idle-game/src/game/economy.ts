import { SCENES, type Upgrade } from '@/game/game-data';

export function getUpgradeCost(upgrade: Upgrade, owned: number) {
  return Math.ceil(upgrade.baseCost * Math.pow(1.18, owned));
}

export function getIncomePerSecond(owned: Record<string, number>) {
  return SCENES.flatMap((scene) => scene.upgrades).reduce(
    (total, upgrade) => total + upgrade.income * (owned[upgrade.id] ?? 0),
    0,
  );
}

export function getTapValue(incomePerSecond: number) {
  return Math.max(5, Math.floor(5 + incomePerSecond * 0.12));
}

export function getSceneIndex(lifetimeCash: number) {
  let index = 0;
  SCENES.forEach((scene, sceneIndex) => {
    if (lifetimeCash >= scene.startAt) index = sceneIndex;
  });
  return index;
}

export function getSceneProgress(lifetimeCash: number, sceneIndex: number) {
  const scene = SCENES[sceneIndex];
  const range = scene.target - scene.startAt;
  return Math.min(1, Math.max(0, (lifetimeCash - scene.startAt) / range));
}

export function formatMoney(value: number) {
  const absolute = Math.abs(value);
  const units = [
    { value: 1_000_000_000_000, suffix: 'T' },
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'K' },
  ];
  const unit = units.find((candidate) => absolute >= candidate.value);
  if (!unit) return `£${Math.floor(value).toLocaleString('en-GB')}`;
  const scaled = value / unit.value;
  const precision = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return `£${scaled.toFixed(precision).replace(/\.0+$|(?<=\.[0-9])0+$/, '')}${unit.suffix}`;
}
