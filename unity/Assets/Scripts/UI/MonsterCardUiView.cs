using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace NightmarePark
{
    public class MonsterCardUiView : MonoBehaviour
    {
        public Button Button;
        public TMP_Text NameText;
        public TMP_Text CostText;
        public TMP_Text SubtitleText;
        public CanvasGroup CanvasGroup;
        public CardSelectionFeedback SelectionFeedback;

        public int Cost { get; private set; }

        public void Setup(string displayName, int cost, string subtitle)
        {
            Cost = cost;

            if (NameText != null) NameText.text = displayName;
            if (CostText != null) CostText.text = cost.ToString();
            if (SubtitleText != null) SubtitleText.text = subtitle;
        }

        public void SetAffordable(bool affordable)
        {
            if (CanvasGroup != null)
            {
                CanvasGroup.alpha = affordable ? 1f : 0.55f;
            }
        }

        public void SetSelected(bool selected)
        {
            if (SelectionFeedback != null)
            {
                SelectionFeedback.SetSelected(selected);
            }
        }

        public void SetInteractable(bool interactable)
        {
            if (Button != null)
            {
                Button.interactable = interactable;
            }
        }
    }
}
