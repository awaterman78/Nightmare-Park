using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace NightmarePark
{
    public class EnergyUiView : MonoBehaviour
    {
        public Slider EnergySlider;
        public TMP_Text EnergyText;
        public TMP_Text EnergyOrbText;

        public void SetEnergy(float current, float max)
        {
            float normalised = max <= 0f ? 0f : current / max;

            if (EnergySlider != null)
            {
                EnergySlider.value = normalised;
            }

            if (EnergyText != null)
            {
                EnergyText.text = $"{current:0.0} / {max:0}";
            }

            if (EnergyOrbText != null)
            {
                EnergyOrbText.text = Mathf.FloorToInt(current).ToString();
            }
        }
    }
}
