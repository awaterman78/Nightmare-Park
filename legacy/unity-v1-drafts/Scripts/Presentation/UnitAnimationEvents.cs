using UnityEngine;

namespace NightmarePark
{
    public class UnitAnimationEvents : MonoBehaviour
    {
        public MeleeAttack MeleeAttack;
        public UnitVfxController Vfx;
        public UnitAudioController Audio;

        private void Awake()
        {
            if (MeleeAttack == null) MeleeAttack = GetComponentInParent<MeleeAttack>();
            if (Vfx == null) Vfx = GetComponentInParent<UnitVfxController>();
            if (Audio == null) Audio = GetComponentInParent<UnitAudioController>();
        }

        public void AnimEvent_BoneStabImpact()
        {
            MeleeAttack?.AnimEvent_BoneStabImpact();
            Vfx?.PlayBoneStabSlash();
            Audio?.PlayBoneStab();
        }

        public void AnimEvent_FootstepLeft()
        {
            Vfx?.PlayFootDust(true);
            Audio?.PlayFootstep();
        }

        public void AnimEvent_FootstepRight()
        {
            Vfx?.PlayFootDust(false);
            Audio?.PlayFootstep();
        }

        public void AnimEvent_SpawnImpact()
        {
            Vfx?.PlaySpawnPuff();
            Audio?.PlaySpawn();
        }

        public void AnimEvent_DeathPuff()
        {
            Vfx?.PlayDeathPuff();
            Audio?.PlayDeath();
        }
    }
}
