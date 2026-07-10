using UnityEngine;

namespace NightmarePark
{
    public class CardSelectionFeedback : MonoBehaviour
    {
        public RectTransform CardRoot;
        public CanvasGroup GlowGroup;
        public Vector2 SelectedOffset = new Vector2(0f, 18f);

        private Vector2 basePosition;

        private void Awake()
        {
            if (CardRoot == null) CardRoot = transform as RectTransform;
            if (CardRoot != null) basePosition = CardRoot.anchoredPosition;

            if (GlowGroup != null) GlowGroup.alpha = 0f;
        }

        public void SetSelected(bool selected)
        {
            if (CardRoot != null)
            {
                CardRoot.anchoredPosition = selected ? basePosition + SelectedOffset : basePosition;
            }

            if (GlowGroup != null)
            {
                GlowGroup.alpha = selected ? 1f : 0f;
            }
        }
    }
}
