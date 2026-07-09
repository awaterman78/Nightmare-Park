using UnityEngine;

namespace MonsterClash
{
    public sealed class WorldHealthBar : MonoBehaviour
    {
        private BattleHealth health;
        private Transform fill;
        private float fullWidth;
        private Camera battleCamera;

        public void Initialise(BattleHealth battleHealth, Transform fillTransform, float width)
        {
            health = battleHealth;
            fill = fillTransform;
            fullWidth = Mathf.Max(0.1f, width);
            battleCamera = Camera.main;
            health.Changed += Refresh;
            health.Died += Refresh;
            Refresh(health);
        }

        private void LateUpdate()
        {
            if (battleCamera == null) battleCamera = Camera.main;
            if (battleCamera != null)
            {
                transform.rotation = battleCamera.transform.rotation;
            }
        }

        private void OnDestroy()
        {
            if (health == null) return;
            health.Changed -= Refresh;
            health.Died -= Refresh;
        }

        private void Refresh(BattleHealth changedHealth)
        {
            if (fill == null || changedHealth == null) return;
            float amount = Mathf.Clamp01(changedHealth.Normalised);
            Vector3 scale = fill.localScale;
            scale.x = fullWidth * amount;
            fill.localScale = scale;
            fill.localPosition = new Vector3(-fullWidth * (1f - amount) * 0.5f, fill.localPosition.y, fill.localPosition.z);
            gameObject.SetActive(amount < 0.999f && amount > 0f);
        }
    }
}
