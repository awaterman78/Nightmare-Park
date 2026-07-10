using UnityEngine;

namespace NightmarePark
{
    public class TowerBoltSpawner : MonoBehaviour
    {
        public TowerBoltVfx BoltPrefab;

        public void SpawnBolt(Vector3 start, Vector3 end)
        {
            if (BoltPrefab == null) return;

            TowerBoltVfx bolt = Instantiate(BoltPrefab, start, Quaternion.identity);
            bolt.Setup(start, end);
        }
    }
}
