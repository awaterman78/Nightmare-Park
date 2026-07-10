using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace NightmarePark
{
    public class CoreHealthUiView : MonoBehaviour
    {
        public Slider HealthSlider;
        public TMP_Text HealthText;

        public void SetHealth(float current, float max)
        {
            float normalised = max <= 0f ? 0f : current / max;

            if (HealthSlider != null)
            {
                HealthSlider.value = normalised;
            }

            if (HealthText != null)
            {
                HealthText.text = Mathf.CeilToInt(current).ToString();
            }
        }
    }
}
