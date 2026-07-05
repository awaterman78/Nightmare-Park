using UnityEngine;
using UnityEngine.UI;

namespace NightmarePark
{
    [RequireComponent(typeof(Button))]
    public class SfxButtonBinder : MonoBehaviour
    {
        public bool UseCardSelectSound = true;

        private void Awake()
        {
            Button button = GetComponent<Button>();
            button.onClick.AddListener(Play);
        }

        private void Play()
        {
            if (UseCardSelectSound)
            {
                SfxPlayer.Instance?.PlayCardSelect();
            }
        }
    }
}
