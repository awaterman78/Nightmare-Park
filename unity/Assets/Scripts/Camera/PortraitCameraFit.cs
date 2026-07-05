using UnityEngine;

namespace NightmarePark
{
    [RequireComponent(typeof(Camera))]
    public class PortraitCameraFit : MonoBehaviour
    {
        public float TargetAspect = 9f / 16f;
        public float BaseOrthographicSize = 7.3f;
        public float MinSize = 6.6f;
        public float MaxSize = 8.2f;

        private Camera cam;

        private void Awake()
        {
            cam = GetComponent<Camera>();
            Apply();
        }

        private void OnValidate()
        {
            if (cam == null) cam = GetComponent<Camera>();
            Apply();
        }

        private void Apply()
        {
            if (cam == null || !cam.orthographic) return;

            float currentAspect = (float)Screen.width / Mathf.Max(1, Screen.height);
            float size = BaseOrthographicSize;

            if (currentAspect < TargetAspect)
            {
                size = BaseOrthographicSize * (TargetAspect / Mathf.Max(0.1f, currentAspect));
            }

            cam.orthographicSize = Mathf.Clamp(size, MinSize, MaxSize);
        }
    }
}
