using UnityEngine;

namespace NightmarePark
{
    [CreateAssetMenu(menuName = "Nightmare Park/Arena Config")]
    public class ArenaConfig : ScriptableObject
    {
        [Header("Arena bounds")]
        public float MinX = -4.5f;
        public float MaxX = 4.5f;
        public float MinZ = -7.0f;
        public float MaxZ = 7.0f;

        [Header("Player deployment bounds")]
        public float PlayerMinX = -4.0f;
        public float PlayerMaxX = 4.0f;
        public float PlayerMinZ = -6.25f;
        public float PlayerMaxZ = -0.75f;

        [Header("Enemy deployment bounds")]
        public float EnemyMinX = -4.0f;
        public float EnemyMaxX = 4.0f;
        public float EnemyMinZ = 0.75f;
        public float EnemyMaxZ = 6.25f;

        [Header("Middle no deployment")]
        public float MiddleMinZ = -0.75f;
        public float MiddleMaxZ = 0.75f;

        public bool IsInPlayerDeployment(Vector3 point)
        {
            return point.x >= PlayerMinX &&
                   point.x <= PlayerMaxX &&
                   point.z >= PlayerMinZ &&
                   point.z <= PlayerMaxZ;
        }

        public bool IsInEnemyDeployment(Vector3 point)
        {
            return point.x >= EnemyMinX &&
                   point.x <= EnemyMaxX &&
                   point.z >= EnemyMinZ &&
                   point.z <= EnemyMaxZ;
        }

        public bool IsInMiddleNoDeploy(Vector3 point)
        {
            return point.z >= MiddleMinZ && point.z <= MiddleMaxZ;
        }
    }
}
