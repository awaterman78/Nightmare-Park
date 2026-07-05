using UnityEngine;

namespace NightmarePark
{
    public class BoneStabFeedback : MonoBehaviour
    {
        public UnitVfxController Vfx;
        public UnitAudioController Audio;
        public float FirstHitShake = 0.12f;
        public float NormalHitShake = 0.04f;

        private bool firstHit = true;

        private void Awake()
        {
            if (Vfx == null) Vfx = GetComponent<UnitVfxController>();
            if (Audio == null) Audio = GetComponent<UnitAudioController>();
        }

        public void PlayBoneStabFeedback()
        {
            Vfx?.PlayBoneStabSlash();
            Audio?.PlayBoneStab();

            CombatFeedbackService.Instance?.Shake(firstHit ? FirstHitShake : NormalHitShake);

            firstHit = false;
        }
    }
}
