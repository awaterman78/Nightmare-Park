using UnityEngine;

namespace NightmarePark
{
    public class DeploymentFeedbackSpawner : MonoBehaviour
    {
        public GameObject DeploymentRingPrefab;
        public GameObject SpawnPuffPrefab;

        public void Play(Vector3 position)
        {
            if (DeploymentRingPrefab != null)
            {
                Instantiate(DeploymentRingPrefab, position, Quaternion.identity);
            }

            if (SpawnPuffPrefab != null)
            {
                Instantiate(SpawnPuffPrefab, position, Quaternion.identity);
            }
        }
    }
}
