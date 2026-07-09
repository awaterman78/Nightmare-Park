using UnityEngine;

namespace NightmarePark
{
    public class FloatingTextSpawner : MonoBehaviour
    {
        public static FloatingTextSpawner Instance { get; private set; }

        public RectTransform Root;
        public Camera WorldCamera;
        public Camera UiCamera;
        public FloatingCombatText FloatingTextPrefab;

        private void Awake()
        {
            Instance = this;
        }

        public void SpawnWorldText(Vector3 worldPosition, string text, Color colour)
        {
            if (Root == null || FloatingTextPrefab == null || WorldCamera == null) return;

            Vector3 screenPosition = WorldCamera.WorldToScreenPoint(worldPosition);

            FloatingCombatText instance = Instantiate(FloatingTextPrefab, Root);
            RectTransform rect = instance.transform as RectTransform;

            if (RectTransformUtility.ScreenPointToLocalPointInRectangle(Root, screenPosition, UiCamera, out Vector2 localPoint))
            {
                rect.anchoredPosition = localPoint;
            }

            instance.SetText(text, colour);
        }
    }
}
