using UnityEngine;

namespace MonsterClash
{
    [RequireComponent(typeof(BattleHealth))]
    [RequireComponent(typeof(CombatTarget))]
    public sealed class DefenceTower : MonoBehaviour
    {
        private BattleHealth health;
        private CombatTarget target;
        private BattleTeam team;
        private BattleDirector director;
        private Transform muzzle;
        private float range;
        private float damage;
        private float fireInterval;
        private float fireTimer;
        private bool core;

        public BattleHealth Health => health;
        public BattleTeam Team => team;
        public bool IsCore => core;

        public void Initialise(
            BattleDirector battleDirector,
            BattleTeam owner,
            bool isCore,
            float maximumHealth,
            float attackRange,
            float attackDamage,
            float attackInterval,
            Transform firePoint)
        {
            director = battleDirector;
            team = owner;
            core = isCore;
            range = attackRange;
            damage = attackDamage;
            fireInterval = attackInterval;
            muzzle = firePoint == null ? transform : firePoint;

            health = GetComponent<BattleHealth>();
            health.Initialise(owner, maximumHealth);
            health.Died += HandleDeath;

            CombatTarget ownTarget = GetComponent<CombatTarget>();
            ownTarget.Configure(true, isCore, transform);
        }

        private void Update()
        {
            if (health == null || !health.IsAlive) return;

            fireTimer -= Time.deltaTime;
            if (target == null || !target.IsAlive || PlanarDistance(transform.position, target.AimPosition) > range)
            {
                target = FindTarget();
            }

            if (target == null || fireTimer > 0f) return;

            fireTimer = fireInterval;
            HauntedBolt.Launch(
                muzzle.position,
                target.Health,
                damage,
                12f,
                BattleBalance.TeamColour(team));
        }

        private CombatTarget FindTarget()
        {
            CombatTarget best = null;
            float bestDistance = float.MaxValue;

            foreach (CombatTarget candidate in CombatTarget.All)
            {
                if (candidate == null || !candidate.IsAlive || candidate.Team == team || candidate.IsBuilding) continue;
                float distance = PlanarDistance(transform.position, candidate.AimPosition);
                if (distance > range || distance >= bestDistance) continue;
                best = candidate;
                bestDistance = distance;
            }

            return best;
        }

        private void HandleDeath(BattleHealth deadHealth)
        {
            target = null;
            GetComponent<CombatTarget>().enabled = false;
            director?.NotifyTowerDestroyed(this);

            Renderer[] renderers = GetComponentsInChildren<Renderer>();
            foreach (Renderer item in renderers)
            {
                item.material.color = Color.Lerp(item.material.color, Color.black, 0.7f);
            }
        }

        private void OnDestroy()
        {
            if (health != null) health.Died -= HandleDeath;
        }

        private static float PlanarDistance(Vector3 first, Vector3 second)
        {
            first.y = 0f;
            second.y = 0f;
            return Vector3.Distance(first, second);
        }
    }
}
