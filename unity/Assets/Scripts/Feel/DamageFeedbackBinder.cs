using UnityEngine;

namespace NightmarePark
{
    public class DamageFeedbackBinder : MonoBehaviour
    {
        public Health Health;
        public HitFlash HitFlash;
        public UnitVfxController Vfx;
        public UnitAudioController Audio;

        private void Awake()
        {
            if (Health == null) Health = GetComponent<Health>();
            if (HitFlash == null) HitFlash = GetComponentInChildren<HitFlash>();
            if (Vfx == null) Vfx = GetComponent<UnitVfxController>();
            if (Audio == null) Audio = GetComponent<UnitAudioController>();

            if (Health != null)
            {
                Health.Damaged += HandleDamaged;
                Health.Died += HandleDied;
            }
        }

        private void HandleDamaged(Health health, float amount)
        {
            HitFlash?.Flash();
            Vfx?.PlayHitFlash();
            Audio?.PlayHit();

            CombatFeedbackService.Instance?.ShowDamage(transform.position + Vector3.up * 1.2f, amount, health.Team == Team.Player ? Team.Enemy : Team.Player);
        }

        private void HandleDied(Health health)
        {
            Vfx?.PlayDeathPuff();
            Audio?.PlayDeath();
        }
    }
}
