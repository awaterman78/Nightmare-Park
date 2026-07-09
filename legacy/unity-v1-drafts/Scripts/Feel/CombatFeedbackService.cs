using UnityEngine;

namespace NightmarePark
{
    public class CombatFeedbackService : MonoBehaviour
    {
        public static CombatFeedbackService Instance { get; private set; }

        [Header("Camera")]
        public CameraShake CameraShake;

        [Header("Floating Text")]
        public FloatingTextSpawner FloatingTextSpawner;
        public Color PlayerDamageColour = new Color(0.55f, 1f, 0.68f);
        public Color EnemyDamageColour = new Color(1f, 0.45f, 0.55f);
        public Color SpecialDamageColour = new Color(1f, 0.84f, 0.35f);

        private void Awake()
        {
            Instance = this;
        }

        public void ShowDamage(Vector3 worldPosition, float amount, Team sourceTeam, bool special = false)
        {
            if (FloatingTextSpawner == null) return;

            Color colour = special ? SpecialDamageColour : sourceTeam == Team.Player ? PlayerDamageColour : EnemyDamageColour;
            FloatingTextSpawner.SpawnWorldText(worldPosition, Mathf.CeilToInt(amount).ToString(), colour);
        }

        public void Shake(float strength)
        {
            if (CameraShake != null)
            {
                CameraShake.Shake(strength);
            }
        }
    }
}
