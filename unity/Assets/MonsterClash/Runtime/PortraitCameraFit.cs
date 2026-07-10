using UnityEngine;

namespace MonsterClash
{
    [RequireComponent(typeof(Camera))]
    public sealed class PortraitCameraFit : MonoBehaviour
    {
        [SerializeField] private float minimumVerticalSize = 7.8f;
        [SerializeField] private float requiredHalfWidth = 4.95f;

        private Camera battleCamera;
        private int lastWidth;
        private int lastHeight;
        private float viewportBottom;
        private float viewportTop = 1f;

        private void Awake()
        {
            battleCamera = GetComponent<Camera>();
            Refresh();
        }

        private void Update()
        {
            if (lastWidth == Screen.width && lastHeight == Screen.height) return;
            Refresh();
        }

        public void SetHudViewport(float bottom, float top)
        {
            viewportBottom = Mathf.Clamp01(bottom);
            viewportTop = Mathf.Clamp(top, viewportBottom + 0.1f, 1f);
            Refresh();
        }

        private void Refresh()
        {
            if (battleCamera == null)
            {
                battleCamera = GetComponent<Camera>();
            }

            lastWidth = Mathf.Max(1, Screen.width);
            lastHeight = Mathf.Max(1, Screen.height);

            float viewportHeight = Mathf.Max(0.1f, viewportTop - viewportBottom);
            battleCamera.rect = new Rect(0f, viewportBottom, 1f, viewportHeight);

            float pixelWidth = lastWidth;
            float pixelHeight = lastHeight * viewportHeight;
            float aspect = pixelWidth / Mathf.Max(1f, pixelHeight);
            battleCamera.orthographicSize = Mathf.Max(
                minimumVerticalSize,
                requiredHalfWidth / Mathf.Max(0.1f, aspect));
        }
    }
}
