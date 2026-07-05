using UnityEngine;

namespace NightmarePark
{
    public class EnemyDummySpawner : MonoBehaviour
    {
        public GameObject GraveGoblinPrefab;
        public UnitStats GraveGoblinStats;
        public Transform SpawnedUnitsParent;

        public Transform[] SpawnPoints;
        public float SpawnInterval = 4f;

        private float timer;

        private void Update()
        {
            timer -= Time.deltaTime;
            if (timer > 0f) return;

            timer = SpawnInterval;
            SpawnEnemyGoblin();
        }

        private void SpawnEnemyGoblin()
        {
            if (GraveGoblinPrefab == null || SpawnPoints == null || SpawnPoints.Length == 0) return;

            Transform point = SpawnPoints[Random.Range(0, SpawnPoints.Length)];

            GameObject unit = Instantiate(GraveGoblinPrefab, point.position, Quaternion.identity, SpawnedUnitsParent);

            UnitController controller = unit.GetComponent<UnitController>();
            if (controller != null)
            {
                controller.Team = Team.Enemy;
                controller.Stats = GraveGoblinStats;
            }

            Health health = unit.GetComponent<Health>();
            if (health != null)
            {
                health.Team = Team.Enemy;
            }
        }
    }
}
