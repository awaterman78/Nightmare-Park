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

        private void Refresh()
        {
            lastWidth = Mathf.Max(1, Screen.width);
            lastHeight = Mathf.Max(1, Screen.height);
            float aspect = (float)lastWidth / lastHeight;
            battleCamera.orthographicSize = Mathf.Max(minimumVerticalSize, requiredHalfWidth / Mathf.Max(0.1f, aspect));
        }
    }
}
