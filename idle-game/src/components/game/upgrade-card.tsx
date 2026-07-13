import { Pressable, Text, View } from 'react-native';

import { formatMoney, getUpgradeCost } from '@/game/economy';
import type { Upgrade } from '@/game/game-data';

type UpgradeCardProps = {
  upgrade: Upgrade;
  owned: number;
  cash: number;
  accent: string;
  onBuy: () => void;
};

export function UpgradeCard({ upgrade, owned, cash, accent, onBuy }: UpgradeCardProps) {
  const cost = getUpgradeCost(upgrade, owned);
  const canBuy = cash >= cost;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !canBuy }}
      onPress={onBuy}
      disabled={!canBuy}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 13,
        borderRadius: 18,
        borderCurve: 'continuous',
        backgroundColor: canBuy ? '#211d38' : '#181629',
        borderWidth: 1,
        borderColor: canBuy ? `${accent}66` : '#332f49',
        opacity: pressed ? 0.78 : canBuy ? 1 : 0.72,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}>
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0d1f',
        }}>
        <Text style={{ fontSize: 28 }}>{upgrade.icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800', flex: 1 }}>
            {upgrade.name}
          </Text>
          {owned > 0 && (
            <View
              style={{
                backgroundColor: `${accent}22`,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 99,
              }}>
              <Text style={{ color: accent, fontWeight: '900', fontSize: 11 }}>LV {owned}</Text>
            </View>
          )}
        </View>
        <Text style={{ color: '#9892ae', fontSize: 12, lineHeight: 16 }}>
          {upgrade.description}
        </Text>
        <Text style={{ color: '#d8d3e8', fontSize: 12, fontWeight: '700' }}>
          +{formatMoney(upgrade.income)}/sec
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text
          style={{
            color: canBuy ? accent : '#777087',
            fontWeight: '900',
            fontVariant: ['tabular-nums'],
          }}>
          {formatMoney(cost)}
        </Text>
        <Text style={{ color: '#777087', fontSize: 10, fontWeight: '800' }}>BUY</Text>
      </View>
    </Pressable>
  );
}
