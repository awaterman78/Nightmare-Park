using UnityEngine;
using TMPro;

namespace NightmarePark
{
    public class InvalidPlacementMessage : MonoBehaviour
    {
        public CanvasGroup CanvasGroup;
        public TMP_Text MessageText;
        public float VisibleTime = 0.65f;

        private float timer;

        private void Awake()
        {
            HideImmediate();
        }

        public void Show(string message)
        {
            if (MessageText != null)
            {
                MessageText.text = message;
            }

            timer = VisibleTime;

            if (CanvasGroup != null)
            {
                CanvasGroup.alpha = 1f;
            }
        }

        private void Update()
        {
            if (timer <= 0f) return;

            timer -= Time.deltaTime;

            if (CanvasGroup != null)
            {
                CanvasGroup.alpha = Mathf.Clamp01(timer / VisibleTime);
            }
        }

        private void HideImmediate()
        {
            if (CanvasGroup != null)
            {
                CanvasGroup.alpha = 0f;
            }
        }
    }
}
