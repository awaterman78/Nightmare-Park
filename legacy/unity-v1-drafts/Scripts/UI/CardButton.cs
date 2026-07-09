using UnityEngine;
using UnityEngine.UI;

namespace NightmarePark
{
    [RequireComponent(typeof(Button))]
    public class CardButton : MonoBehaviour
    {
        public DeploymentController DeploymentController;

        private Button button;

        private void Awake()
        {
            button = GetComponent<Button>();
            button.onClick.AddListener(HandleClick);
        }

        private void HandleClick()
        {
            if (DeploymentController != null)
            {
                DeploymentController.SelectGraveGoblin();
            }
        }
    }
}
