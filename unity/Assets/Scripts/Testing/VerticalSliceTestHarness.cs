using UnityEngine;

namespace NightmarePark
{
    public class VerticalSliceTestHarness : MonoBehaviour
    {
        public EnemyDummySpawner EnemySpawner;
        public bool AutoSpawnEnemy = true;

        private void Start()
        {
            if (EnemySpawner != null)
            {
                EnemySpawner.enabled = AutoSpawnEnemy;
            }

            Debug.Log("Nightmare Park vertical slice test harness active.");
        }
    }
}
