using UnityEngine;

namespace NightmarePark
{
    public class TowerController : MonoBehaviour
    {
        public Team Team;
        public float Range = 4f;
        public float Damage = 62f;
        public float FireRate = 0.9f;

        private float cooldown;

        private void Update()
        {
            cooldown -= Time.deltaTime;
            if (cooldown > 0f) return;

            Health target = FindTarget();
            if (target == null) return;

            cooldown = FireRate;
            target.TakeDamage(Damage);

            // TODO, trigger tower projectile, hit VFX and audio.
        }

        private Health FindTarget()
        {
            Health[] allHealth = FindObjectsOfType<Health>();
            Health best = null;
            float bestDistance = float.MaxValue;

            foreach (Health health in allHealth)
            {
                if (health.Team == Team) continue;
                if (health.CurrentHealth <= 0f) continue;

                float distance = Vector3.Distance(transform.position, health.transform.position);

                if (distance <= Range && distance < bestDistance)
                {
                    bestDistance = distance;
                    best = health;
                }
            }

            return best;
        }
    }
}
