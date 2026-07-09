using System.Collections;
using UnityEngine;

namespace MonsterClash
{
    [RequireComponent(typeof(BattleHealth))]
    [RequireComponent(typeof(CombatTarget))]
    public sealed class MonsterActor : MonoBehaviour
    {
        private MonsterCard card;
        private BattleTeam team;
        private ArenaLayout arena;
        private BattleHealth health;
        private CombatTarget target;
        private Transform visual;
        private float attackTimer;
        private float searchTimer;
        private float spawnTime;
        private Vector3 visualBasePosition;
        private Quaternion visualBaseRotation;
        private bool dying;

        public MonsterCard Card => card;
        public BattleTeam Team => team;
        public bool IsAlive => health != null && health.IsAlive && !dying;

        public void Initialise(MonsterCard definition, BattleTeam owner, ArenaLayout layout, Transform visualRoot)
        {
            card = definition;
            team = owner;
            arena = layout;
            visual = visualRoot;
            spawnTime = Time.time;

            health = GetComponent<BattleHealth>();
            health.Initialise(owner, card.MaximumHealth);
            health.Died += HandleDeath;

            CombatTarget ownTarget = GetComponent<CombatTarget>();
            ownTarget.Configure(false, false, transform);

            if (visual != null)
            {
                visualBasePosition = visual.localPosition;
                visualBaseRotation = visual.localRotation;
                visual.localScale = Vector3.zero;
            }
        }

        private void Update()
        {
            if (!IsAlive || card == null || arena == null) return;

            attackTimer -= Time.deltaTime;
            searchTimer -= Time.deltaTime;

            if (target == null || !target.IsAlive || searchTimer <= 0f)
            {
                target = FindBestTarget();
                searchTimer = 0.22f + Random.value * 0.12f;
            }

            AnimateVisual();

            if (target == null) return;

            Vector3 targetPosition = target.AimPosition;
            float distance = PlanarDistance(transform.position, targetPosition);

            if (distance <= card.AttackRange)
            {
                Face(targetPosition, 14f);
                if (attackTimer <= 0f) Attack();
                return;
            }

            Vector3 waypoint = arena.NextWaypoint(transform.position, targetPosition, card.Flying);
            MoveTowards(waypoint);
        }

        private CombatTarget FindBestTarget()
        {
            CombatTarget best = null;
            float bestScore = float.MaxValue;

            foreach (CombatTarget candidate in CombatTarget.All)
            {
                if (candidate == null || !candidate.IsAlive || candidate.Team == team) continue;

                float distance = PlanarDistance(transform.position, candidate.AimPosition);
                if (!candidate.IsBuilding && distance > card.AggroRange) continue;

                float score = distance;

                if (card.TargetPreference == TargetPreference.Buildings && !candidate.IsBuilding) score += 18f;
                if (card.TargetPreference == TargetPreference.Units && candidate.IsBuilding) score += 5f;
                if (candidate.IsCore) score += 1.4f;
                if (!candidate.IsBuilding) score -= 0.35f;

                if (score < bestScore)
                {
                    best = candidate;
                    bestScore = score;
                }
            }

            return best;
        }

        private void MoveTowards(Vector3 destination)
        {
            Vector3 direction = destination - transform.position;
            direction.y = 0f;
            if (direction.sqrMagnitude < 0.005f) return;

            Vector3 step = direction.normalized * card.MoveSpeed * Time.deltaTime;
            transform.position += step;
            Face(transform.position + direction, 12f);
        }

        private void Face(Vector3 destination, float turnSpeed)
        {
            Vector3 direction = destination - transform.position;
            direction.y = 0f;
            if (direction.sqrMagnitude < 0.001f) return;

            Quaternion facing = Quaternion.LookRotation(direction.normalized, Vector3.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, facing, turnSpeed * Time.deltaTime);
        }

        private void Attack()
        {
            if (target == null || !target.IsAlive) return;
            attackTimer = card.AttackInterval;

            if (card.AttackRange > 1.55f)
            {
                HauntedBolt.Launch(
                    transform.position + Vector3.up * 0.65f,
                    target.Health,
                    card.Damage,
                    9.5f,
                    card.AccentColour);
            }
            else
            {
                target.Health.ApplyDamage(card.Damage);
            }

            if (visual != null)
            {
                visual.localRotation = visualBaseRotation * Quaternion.Euler(-12f, 0f, 0f);
            }
        }

        private void AnimateVisual()
        {
            if (visual == null) return;

            float age = Time.time - spawnTime;
            float reveal = Mathf.Clamp01(age / 0.24f);
            float overshoot = 1f + Mathf.Sin(reveal * Mathf.PI) * 0.16f;
            visual.localScale = Vector3.one * card.VisualScale * reveal * overshoot;

            float gait = Mathf.Sin(Time.time * (card.MoveSpeed * 2.7f + 2f));
            float hover = card.Flying ? 0.26f + Mathf.Sin(Time.time * 5.2f) * 0.09f : Mathf.Abs(gait) * 0.035f;
            visual.localPosition = visualBasePosition + Vector3.up * hover;
            visual.localRotation = Quaternion.Slerp(visual.localRotation, visualBaseRotation * Quaternion.Euler(0f, 0f, gait * 2.8f), Time.deltaTime * 9f);
        }

        private void HandleDeath(BattleHealth deadHealth)
        {
            if (dying) return;
            dying = true;
            target = null;

            CombatTarget ownTarget = GetComponent<CombatTarget>();
            if (ownTarget != null) ownTarget.enabled = false;

            StartCoroutine(DeathSequence());
        }

        private IEnumerator DeathSequence()
        {
            float elapsed = 0f;
            Vector3 startScale = visual == null ? Vector3.one : visual.localScale;

            while (elapsed < 0.38f)
            {
                elapsed += Time.deltaTime;
                float amount = 1f - Mathf.Clamp01(elapsed / 0.38f);
                if (visual != null)
                {
                    visual.localScale = startScale * amount;
                    visual.localPosition += Vector3.up * Time.deltaTime * 0.4f;
                }
                yield return null;
            }

            Destroy(gameObject);
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
