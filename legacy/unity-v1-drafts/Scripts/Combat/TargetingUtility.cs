using UnityEngine;

namespace NightmarePark
{
    public static class TargetingUtility
    {
        public static Transform FindNearestTarget(Vector3 fromPosition, Team ownTeam)
        {
            Health[] allHealth = Object.FindObjectsOfType<Health>();
            Transform bestTarget = null;
            float bestDistance = float.MaxValue;

            foreach (Health health in allHealth)
            {
                if (health == null) continue;
                if (health.Team == ownTeam) continue;
                if (health.CurrentHealth <= 0f) continue;

                float distance = Vector3.Distance(fromPosition, health.transform.position);
                if (distance < bestDistance)
                {
                    bestDistance = distance;
                    bestTarget = health.transform;
                }
            }

            return bestTarget;
        }
    }
}
