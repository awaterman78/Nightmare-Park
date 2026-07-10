using UnityEngine;
using TMPro;

namespace NightmarePark
{
    public class BattleTimerUiView : MonoBehaviour
    {
        public TMP_Text TimerText;

        public void SetTime(float seconds)
        {
            int total = Mathf.Max(0, Mathf.CeilToInt(seconds));
            int minutes = total / 60;
            int remainder = total % 60;

            if (TimerText != null)
            {
                TimerText.text = $"{minutes}:{remainder:00}";
            }
        }
    }
}
