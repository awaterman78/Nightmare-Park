using UnityEngine;

namespace NightmarePark
{
    public class TargetingService : MonoBehaviour
    {
        public static TargetingService Instance { get; private set; }

        private void Awake()
        {
            Instance = this;
        }

        public Targetable FindNearestEnemy(Vector3 position, Team ownTeam, float maxRange = Mathf.Infinity)
        {
            Targetable[] allTargets = FindObjectsOfType<Targetable>();
            Targetable best = null;
            float bestDistance = float.MaxValue;

            foreach (Targetable target in allTargets)
            {
                if (target == null || !target.IsAlive) continue;
                if (target.Team == ownTeam) continue;

                float distance = Vector3.Distance(position, target.transform.position);
                if (distance > maxRange) continue;

                if (distance < bestDistance)
                {
                    bestDistance = distance;
                    best = target;
                }
            }

            return best;
        }
    }
}
