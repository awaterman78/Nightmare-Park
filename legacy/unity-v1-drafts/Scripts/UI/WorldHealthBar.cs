using UnityEngine;
using UnityEngine.UI;

namespace NightmarePark
{
    public class WorldHealthBar : MonoBehaviour
    {
        public Health Health;
        public Slider Slider;
        public Transform FollowTarget;
        public Vector3 WorldOffset = new Vector3(0f, 1.0f, 0f);
        public Camera WorldCamera;

        private RectTransform rectTransform;

        private void Awake()
        {
            rectTransform = transform as RectTransform;

            if (Health != null)
            {
                Health.Changed += HandleHealthChanged;
                HandleHealthChanged(Health, Health.CurrentHealth, Health.MaxHealth);
            }
        }

        private void LateUpdate()
        {
            if (FollowTarget == null || WorldCamera == null || rectTransform == null) return;

            Vector3 screenPosition = WorldCamera.WorldToScreenPoint(FollowTarget.position + WorldOffset);
            rectTransform.position = screenPosition;
        }

        private void HandleHealthChanged(Health health, float current, float max)
        {
            if (Slider != null)
            {
                Slider.value = max <= 0f ? 0f : current / max;
            }
        }
    }
}
