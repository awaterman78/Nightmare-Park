using UnityEngine;

namespace NightmarePark
{
    public class UnitController : MonoBehaviour
    {
        public Team Team;
        public UnitStats Stats;
        public Animator Animator;
        public Health Health;

        private Transform target;
        private bool isDead;

        private static readonly int IsMoving = Animator.StringToHash("IsMoving");
        private static readonly int MoveSpeed = Animator.StringToHash("MoveSpeed");
        private static readonly int Hit = Animator.StringToHash("Hit");
        private static readonly int Death = Animator.StringToHash("Death");

        private void Awake()
        {
            if (Animator == null) Animator = GetComponentInChildren<Animator>();
            if (Health == null) Health = GetComponent<Health>();

            if (Health != null)
            {
                Health.Team = Team;
                Health.MaxHealth = Stats != null ? Stats.MaxHealth : Health.MaxHealth;
                Health.CurrentHealth = Health.MaxHealth;
                Health.OnDamaged += HandleDamaged;
                Health.OnDied += HandleDeath;
            }
        }

        private void Update()
        {
            if (isDead) return;

            target = TargetingUtility.FindNearestTarget(transform.position, Team);

            if (target == null)
            {
                SetMoving(false);
                return;
            }

            float distance = Vector3.Distance(transform.position, target.position);

            if (distance > Stats.AttackRange)
            {
                MoveTowards(target.position);
            }
            else
            {
                SetMoving(false);
            }
        }

        private void MoveTowards(Vector3 destination)
        {
            SetMoving(true);

            Vector3 direction = destination - transform.position;
            direction.y = 0f;

            if (direction.sqrMagnitude < 0.001f) return;

            Vector3 movement = direction.normalized * Stats.MoveSpeed * Time.deltaTime;
            transform.position += movement;

            Quaternion lookRotation = Quaternion.LookRotation(direction.normalized);
            transform.rotation = Quaternion.Slerp(transform.rotation, lookRotation, Time.deltaTime * 12f);

            if (Animator != null)
            {
                Animator.SetFloat(MoveSpeed, Stats.MoveSpeed);
            }
        }

        private void SetMoving(bool moving)
        {
            if (Animator != null)
            {
                Animator.SetBool(IsMoving, moving);
            }
        }

        private void HandleDamaged(float amount)
        {
            if (isDead) return;
            if (Animator != null) Animator.SetTrigger(Hit);
        }

        private void HandleDeath(Health deadHealth)
        {
            isDead = true;
            SetMoving(false);

            if (Animator != null) Animator.SetTrigger(Death);

            Collider collider = GetComponent<Collider>();
            if (collider != null) collider.enabled = false;

            Destroy(gameObject, 1.2f);
        }
    }
}
