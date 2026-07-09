using UnityEngine;

namespace NightmarePark
{
    public class HitReactionBinder : MonoBehaviour
    {
        public Health Health;
        public UnitVfxController Vfx;
        public UnitAudioController Audio;

        private void Awake()
        {
            if (Health == null) Health = GetComponent<Health>();
            if (Vfx == null) Vfx = GetComponent<UnitVfxController>();
            if (Audio == null) Audio = GetComponent<UnitAudioController>();

            if (Health != null)
            {
                Health.Damaged += HandleDamaged;
            }
        }

        private void HandleDamaged(Health health, float amount)
        {
            Vfx?.PlayHitFlash();
            Audio?.PlayHit();
        }
    }
}
