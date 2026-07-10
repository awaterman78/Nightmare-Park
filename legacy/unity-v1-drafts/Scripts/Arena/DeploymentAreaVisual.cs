using UnityEngine;

namespace NightmarePark
{
    public class DeploymentAreaVisual : MonoBehaviour
    {
        public GameObject PlayerDeploymentVisual;
        public GameObject InvalidPlacementVisual;

        public void ShowPlayerDeployment(bool show)
        {
            if (PlayerDeploymentVisual != null)
            {
                PlayerDeploymentVisual.SetActive(show);
            }
        }

        public void PulseInvalid()
        {
            if (InvalidPlacementVisual == null) return;

            InvalidPlacementVisual.SetActive(false);
            InvalidPlacementVisual.SetActive(true);

            // First slice placeholder.
            // Later, replace with proper animation or shader pulse.
        }
    }
}
