using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace NightmarePark
{
    public class ResultPanelController : MonoBehaviour
    {
        public GameObject Root;
        public TMP_Text TitleText;
        public TMP_Text MessageText;
        public Button RestartButton;
        public GameManager GameManager;

        private void Awake()
        {
            if (Root != null) Root.SetActive(false);

            if (RestartButton != null)
            {
                RestartButton.onClick.AddListener(Restart);
            }
        }

        public void ShowVictory()
        {
            Show("Victory", "Your monsters destroyed the enemy core.");
        }

        public void ShowDefeat()
        {
            Show("Defeat", "Your core was destroyed.");
        }

        private void Show(string title, string message)
        {
            if (Root != null) Root.SetActive(true);
            if (TitleText != null) TitleText.text = title;
            if (MessageText != null) MessageText.text = message;
        }

        private void Restart()
        {
            if (GameManager != null)
            {
                GameManager.Restart();
            }
        }
    }
}
