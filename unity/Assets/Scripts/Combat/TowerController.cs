using UnityEngine;

namespace NightmarePark
{
    [RequireComponent(typeof(Health))]
    [RequireComponent(typeof(Targetable))]
    public class TowerController : MonoBehaviour
    {
        public Team Team;
        public float Range = 4f;
        public float Damage = 62f;
        public float FireRate = 0.9f;

        [Header("Optional")]
        public Transform FirePoint;
        public GameObject ProjectilePrefab;

        private float cooldown;
        private Health health;

        private void Awake()
        {
            health = GetComponent<Health>();
            health.Team = Team;
        }

        private void Update()
        {
            if (health.IsDead) return;

            cooldown -= Time.deltaTime;
            if (cooldown > 0f) return;

            Targetable target = TargetingService.Instance.FindNearestEnemy(transform.position, Team, Range);
            if (target == null) return;

            cooldown = FireRate;
            target.Health.TakeDamage(Damage);

            // First slice can use instant damage.
            // Later, replace with projectile travel and hit VFX.
        }
    }
}
