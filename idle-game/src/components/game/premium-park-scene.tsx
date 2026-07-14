import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ImageBackground, Pressable, Text, View } from 'react-native';

import { formatMoney } from '@/game/economy';
import { getRevealPoints, SCENES, type ActiveBonusVehicle } from '@/game/game-data';

const SCENE_ART = [
  [
    require('../../../assets/deadmans-field-portrait-0.jpg'),
    require('../../../assets/deadmans-field-portrait-1.jpg'),
    require('../../../assets/deadmans-field-portrait-2.jpg'),
  ],
  [
    require('../../../assets/cursed-carnival-portrait-0.jpg'),
    require('../../../assets/cursed-carnival-portrait-1.jpg'),
    require('../../../assets/cursed-carnival-portrait-2.jpg'),
  ],
  [
    require('../../../assets/haunted-resort-portrait-0.jpg'),
    require('../../../assets/haunted-resort-portrait-1.jpg'),
    require('../../../assets/haunted-resort-portrait-2.jpg'),
  ],
];

const BUILD_STATES = ['GROUNDS CLAIMED', 'PARK TAKING SHAPE', 'NIGHTMARE COMPLETE'];

type PremiumParkSceneProps = {
  sceneIndex: number;
  progress: number;
  moneyToNextReveal: number;
  tapValue: number;
  tapStreak: number;
  tapMultiplier: number;
  bonusVehicle: ActiveBonusVehicle | null;
  onTap: () => void;
  onCollectBonusVehicle: () => void;
};

export function PremiumParkScene({
  sceneIndex,
  progress,
  moneyToNextReveal,
  tapValue,
  tapStreak,
  tapMultiplier,
  bonusVehicle,
  onTap,
  onCollectBonusVehicle,
}: PremiumParkSceneProps) {
  const scene = SCENES[sceneIndex];
  const revealPoints = getRevealPoints(scene);
  const revealed = useMemo(
    () => revealPoints.map((point) => progress >= point),
    [progress, revealPoints],
  );
  const openedCount = revealed.filter(Boolean).length;
  const nextRevealIndex = revealed.findIndex((value) => !value);
  const visualStage = progress >= 0.7 ? 2 : progress >= 0.34 ? 1 : 0;
  const previousStage = useRef(visualStage);
  const [pulse] = useState(() => new Animated.Value(0));
  const [sceneReveal] = useState(() => new Animated.Value(0));
  const [showStageReveal, setShowStageReveal] = useState(false);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1_100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1_100, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    if (visualStage === previousStage.current) return;
    previousStage.current = visualStage;
    setShowStageReveal(true);
    sceneReveal.setValue(0);
    Animated.sequence([
      Animated.timing(sceneReveal, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(sceneReveal, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start(() => setShowStageReveal(false));
  }, [sceneReveal, visualStage]);

  const imageSource = SCENE_ART[sceneIndex]?.[visualStage] ?? SCENE_ART[0][0];
  const nextObjective =
    nextRevealIndex === -1
      ? sceneIndex < SCENES.length - 1
        ? `Unlock ${SCENES[sceneIndex + 1].name}`
        : 'Complete the empire'
      : scene.revealNames[nextRevealIndex];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tap the park to earn fear funds"
      onPress={onTap}
      style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.994 : 1 }] })}>
      <View
        style={{
          flex: 1,
          overflow: 'hidden',
          borderRadius: 24,
          borderWidth: 1,
          borderColor: `${scene.accent}88`,
          backgroundColor: '#080914',
          boxShadow: '0 14px 36px rgba(0,0,0,0.48)',
        }}>
        <ImageBackground source={imageSource} resizeMode="cover" style={{ flex: 1 }}>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: '#02050a12',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 92,
              backgroundColor: '#02040bb0',
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 10,
              left: 11,
              right: 11,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={{ color: scene.accent, fontSize: 8, fontWeight: '900', letterSpacing: 1.8 }}>
                CHAPTER {String(sceneIndex + 1).padStart(2, '0')}
              </Text>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900', marginTop: 1 }}>
                {scene.name.toUpperCase()}
              </Text>
              <Text style={{ color: '#c2c7d1', fontSize: 7, fontWeight: '800', letterSpacing: 1, marginTop: 2 }}>
                {BUILD_STATES[visualStage]}
              </Text>
            </View>
            <View
              style={{
                borderRadius: 99,
                borderWidth: 1,
                borderColor: '#ffffff40',
                backgroundColor: '#060914c9',
                paddingHorizontal: 9,
                paddingVertical: 6,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>
                {openedCount}/{scene.revealNames.length}
              </Text>
              <Text style={{ color: '#aab1c0', fontSize: 6, fontWeight: '900', letterSpacing: 1 }}>
                OPEN
              </Text>
            </View>
          </View>

          {bonusVehicle && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Collect ${bonusVehicle.name}`}
              onPress={(event) => {
                event.stopPropagation();
                onCollectBonusVehicle();
              }}
              style={({ pressed }) => ({
                position: 'absolute',
                top: 72,
                right: 11,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                borderRadius: 99,
                borderWidth: 1,
                borderColor: bonusVehicle.accent,
                backgroundColor: '#060914e8',
                paddingHorizontal: 10,
                paddingVertical: 7,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}>
              <View>
                <Text style={{ color: bonusVehicle.accent, fontSize: 7, fontWeight: '900', letterSpacing: 1 }}>
                  {bonusVehicle.name.toUpperCase()} · {bonusVehicle.timeLeft}s
                </Text>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900', marginTop: 1 }}>
                  CLAIM {formatMoney(bonusVehicle.reward)}
                </Text>
              </View>
            </Pressable>
          )}

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: '48%',
              left: 0,
              right: 0,
              alignItems: 'center',
            }}>
            <Animated.View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: `${scene.accent}88`,
                backgroundColor: '#03091488',
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) }],
                boxShadow: `0 0 32px ${scene.accent}55`,
              }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Make visitors scream"
                onPress={(event) => {
                  event.stopPropagation();
                  onTap();
                }}
                style={({ pressed }) => ({
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: scene.accent,
                  backgroundColor: pressed ? `${scene.accent}30` : '#06111de8',
                  transform: [{ scale: pressed ? 0.91 : 1 }],
                })}>
                <Text style={{ color: '#b8c0cd', fontSize: 7, fontWeight: '900', letterSpacing: 1.5 }}>
                  TAP
                </Text>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 1 }}>SCREAM</Text>
                <Text style={{ color: scene.accent, fontSize: 13, fontWeight: '900', marginTop: 1 }}>
                  +{formatMoney(tapValue)}
                </Text>
              </Pressable>
            </Animated.View>
            {tapStreak >= 5 && (
              <View
                style={{
                  marginTop: 6,
                  borderRadius: 99,
                  borderWidth: 1,
                  borderColor: `${scene.accent}99`,
                  backgroundColor: '#060914e6',
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                }}>
                <Text style={{ color: scene.accent, fontSize: 8, fontWeight: '900' }}>
                  {tapStreak} STREAK · ×{tapMultiplier.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              bottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 15,
              borderWidth: 1,
              borderColor: '#ffffff38',
              backgroundColor: '#050812eb',
              paddingHorizontal: 11,
              paddingVertical: 8,
            }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#9fa8b8', fontSize: 7, fontWeight: '900', letterSpacing: 1.2 }}>
                NEXT
              </Text>
              <Text numberOfLines={1} style={{ color: '#fff', fontSize: 11, fontWeight: '900', marginTop: 1 }}>
                {nextObjective}
              </Text>
            </View>
            <Text style={{ color: scene.accent, fontSize: 12, fontWeight: '900', marginLeft: 8 }}>
              {moneyToNextReveal > 0 ? `${formatMoney(moneyToNextReveal)} TO GO` : 'READY'}
            </Text>
          </View>

          {showStageReveal && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#02030cd9',
                opacity: sceneReveal,
              }}>
              <Text style={{ color: scene.accent, fontSize: 9, fontWeight: '900', letterSpacing: 3 }}>
                PARK EVOLVED
              </Text>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 5 }}>
                {BUILD_STATES[visualStage]}
              </Text>
            </Animated.View>
          )}
        </ImageBackground>
      </View>
    </Pressable>
  );
}
