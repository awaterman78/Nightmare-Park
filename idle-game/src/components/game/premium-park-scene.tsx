import { useEffect, useMemo, useState } from 'react';
import { Animated, ImageBackground, Pressable, Text, View } from 'react-native';

import { formatMoney } from '@/game/economy';
import { getRevealPoints, SCENES, type ActiveBonusVehicle } from '@/game/game-data';

const DEADMAN_ART = require('../../../assets/deadmans-field-v2.png');

type PremiumParkSceneProps = {
  sceneIndex: number;
  progress: number;
  tapValue: number;
  tapStreak: number;
  tapMultiplier: number;
  bonusVehicle: ActiveBonusVehicle | null;
  height: number;
  onTap: () => void;
  onCollectBonusVehicle: () => void;
};

export function PremiumParkScene({
  sceneIndex,
  progress,
  tapValue,
  tapStreak,
  tapMultiplier,
  bonusVehicle,
  height,
  onTap,
  onCollectBonusVehicle,
}: PremiumParkSceneProps) {
  const scene = SCENES[sceneIndex];
  const revealPoints = getRevealPoints(scene);
  const revealed = useMemo(
    () => revealPoints.map((point) => progress >= point),
    [progress, revealPoints],
  );
  const nextRevealIndex = revealed.findIndex((value) => !value);
  const [targetPulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(targetPulse, { toValue: 1, duration: 1_250, useNativeDriver: true }),
        Animated.timing(targetPulse, { toValue: 0, duration: 1_250, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [targetPulse]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tap the park to earn fear funds"
      onPress={onTap}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: height,
        transform: [{ scale: pressed ? 0.994 : 1 }],
      })}>
      <View
        style={{
          flex: 1,
          minHeight: height,
          overflow: 'hidden',
          borderRadius: 28,
          borderWidth: 1,
          borderColor: '#a8ff5caa',
          backgroundColor: '#090d1b',
          boxShadow: '0 18px 42px rgba(0,0,0,0.5)',
        }}>
        <ImageBackground source={DEADMAN_ART} resizeMode="cover" style={{ flex: 1 }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#06102924',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '44%',
              backgroundColor: '#070b1f54',
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                backgroundColor: '#071020d9',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#b8ff5c8a',
                paddingHorizontal: 11,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#b8ff5c', fontSize: 9, fontWeight: '900', letterSpacing: 1.8 }}>
                CHAPTER 01
              </Text>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 2 }}>
                DEADMAN’S FIELD
              </Text>
            </View>
            <View
              style={{
                alignItems: 'flex-end',
                backgroundColor: '#071020c7',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#ffffff36',
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>
                {revealed.filter(Boolean).length}/{scene.revealNames.length}
              </Text>
              <Text style={{ color: '#c0c8d5', fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>
                ATTRACTIONS OPEN
              </Text>
            </View>
          </View>

          {revealed[0] && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: '8%',
                top: '37%',
                backgroundColor: '#071020c9',
                borderRadius: 8,
                borderLeftWidth: 2,
                borderLeftColor: '#ffbe5c',
                paddingHorizontal: 8,
                paddingVertical: 5,
              }}>
              <Text style={{ color: '#ffe2aa', fontSize: 9, fontWeight: '900' }}>TICKET SHACK</Text>
              <Text style={{ color: '#a9b6c9', fontSize: 8, marginTop: 2 }}>OPEN FOR BUSINESS</Text>
            </View>
          )}

          {revealed[3] && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: '30%',
                top: '44%',
                backgroundColor: '#071020c9',
                borderRadius: 8,
                borderLeftWidth: 2,
                borderLeftColor: '#72f39a',
                paddingHorizontal: 8,
                paddingVertical: 5,
              }}>
              <Text style={{ color: '#b7ffd0', fontSize: 9, fontWeight: '900' }}>GHOST TRAIN</Text>
              <Text style={{ color: '#a9b6c9', fontSize: 8, marginTop: 2 }}>RIDES EVERY NIGHT</Text>
            </View>
          )}

          {bonusVehicle && (
            <View
              style={{
                position: 'absolute',
                right: 14,
                top: '24%',
              }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Collect ${bonusVehicle.name}`}
                onPress={(event) => {
                  event.stopPropagation();
                  onCollectBonusVehicle();
                }}
                style={({ pressed }) => ({
                  minWidth: 148,
                  backgroundColor: '#071020ee',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: bonusVehicle.accent,
                  paddingHorizontal: 11,
                  paddingVertical: 9,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  boxShadow: `0 8px 20px ${bonusVehicle.accent}44`,
                })}>
                <Text style={{ color: bonusVehicle.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1 }}>
                  BONUS ARRIVAL · {bonusVehicle.timeLeft}s
                </Text>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900', marginTop: 3 }}>
                  {bonusVehicle.name}
                </Text>
                <Text style={{ color: '#d4dbea', fontSize: 10, fontWeight: '700', marginTop: 4 }}>
                  COLLECT {formatMoney(bonusVehicle.reward)}
                </Text>
              </Pressable>
            </View>
          )}

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '39%',
              alignItems: 'center',
            }}>
            <Animated.View
              style={{
                width: 142,
                height: 142,
                borderRadius: 71,
                borderWidth: 1,
                borderColor: '#d6ff9c99',
                backgroundColor: '#0610207a',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [
                  { scale: targetPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) },
                ],
                boxShadow: '0 0 36px rgba(167,255,95,0.35)',
              }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open the scare interaction"
                onPress={(event) => {
                  event.stopPropagation();
                  onTap();
                }}
                style={({ pressed }) => ({
                  width: 108,
                  height: 108,
                  borderRadius: 54,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? '#172b2b' : '#0b1d25',
                  borderWidth: 2,
                  borderColor: '#b8ff5c',
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                })}>
                <Text style={{ color: '#9fb2bc', fontSize: 9, fontWeight: '900', letterSpacing: 2 }}>
                  TAP TO OPEN
                </Text>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 1, marginTop: 4 }}>
                  SCREAM
                </Text>
                <Text style={{ color: '#b8ff5c', fontSize: 15, fontWeight: '900', marginTop: 2 }}>
                  +{formatMoney(tapValue)}
                </Text>
              </Pressable>
            </Animated.View>
            {tapStreak >= 5 && (
              <View
                style={{
                  marginTop: 10,
                  borderRadius: 99,
                  borderWidth: 1,
                  borderColor: '#b8ff5caa',
                  backgroundColor: '#071020df',
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                }}>
                <Text style={{ color: '#b8ff5c', fontSize: 10, fontWeight: '900', letterSpacing: 0.9 }}>
                  SCREAM STREAK ×{tapMultiplier.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 14,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                maxWidth: '68%',
                backgroundColor: '#071020d9',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#ffffff33',
                paddingHorizontal: 11,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#9faec0', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }}>
                NEXT TO OPEN
              </Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900', marginTop: 3 }}>
                {nextRevealIndex === -1 ? 'THE FIELD IS FULL' : scene.revealNames[nextRevealIndex]}
              </Text>
            </View>
            <View
              style={{
                minWidth: 96,
                backgroundColor: '#071020d9',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#b8ff5c88',
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}>
              <Text style={{ color: '#9faec0', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }}>
                CHAPTER VALUE
              </Text>
              <Text style={{ color: '#b8ff5c', fontSize: 16, fontWeight: '900', marginTop: 3 }}>
                {formatMoney(progress * scene.target)}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  );
}
