using UnityEngine;

namespace NightmarePark
{
    [RequireComponent(typeof(Health))]
    [RequireComponent(typeof(Targetable))]
    public class UnitController : MonoBehaviour
    {
        public Team Team;
        public UnitStats Stats;

        [Header("References")]
        public Animator Animator;
        public Transform ModelRoot;

        private Health health;
        private Targetable currentTarget;
        private bool dead;

        private static readonly int IsMoving = Animator.StringToHash("IsMoving");
        private static readonly int MoveSpeed = Animator.StringToHash("MoveSpeed");
        private static readonly int Hit = Animator.StringToHash("Hit");
        private static readonly int Death = Animator.StringToHash("Death");
        private static readonly int SpawnLeap = Animator.StringToHash("SpawnLeap");

        private void Awake()
        {
            health = GetComponent<Health>();
            health.Team = Team;

            if (Stats != null)
            {
                health.SetMaxHealth(Stats.MaxHealth);
            }

            health.Damaged += OnDamaged;
            health.Died += OnDied;

            if (Animator == null)
            {
                Animator = GetComponentInChildren<Animator>();
            }
        }

        private void Start()
        {
            if (Animator != null)
            {
                Animator.SetTrigger(SpawnLeap);
            }
        }

        private void Update()
        {
            if (dead || Stats == null) return;

            currentTarget = TargetingService.Instance.FindNearestEnemy(transform.position, Team);

            if (currentTarget == null)
            {
                SetMoving(false);
                return;
            }

            float distance = Vector3.Distance(transform.position, currentTarget.transform.position);

            if (distance <= Stats.AttackRange)
            {
                SetMoving(false);
                return;
            }

            MoveTowards(currentTarget.transform.position);
        }

        private void MoveTowards(Vector3 finalDestination)
        {
            Vector3 nextPoint = ArenaPathing.Instance != null
                ? ArenaPathing.Instance.GetNextPathPoint(transform.position, finalDestination, Team)
                : finalDestination;

            Vector3 direction = nextPoint - transform.position;
            direction.y = 0f;

            if (direction.sqrMagnitude < 0.01f)
            {
                SetMoving(false);
                return;
            }

            SetMoving(true);

            Vector3 move = direction.normalized * Stats.MoveSpeed * Time.deltaTime;
            transform.position += move;

            Quaternion look = Quaternion.LookRotation(direction.normalized);
            transform.rotation = Quaternion.Slerp(transform.rotation, look, Time.deltaTime * Stats.TurnSpeed);
        }

        private void SetMoving(bool moving)
        {
            if (Animator == null) return;

            Animator.SetBool(IsMoving, moving);
            Animator.SetFloat(MoveSpeed, moving ? Stats.MoveSpeed : 0f);
        }

        private void OnDamaged(Health h, float amount)
        {
            if (dead) return;
            if (Animator != null) Animator.SetTrigger(Hit);
        }

        private void OnDied(Health h)
        {
            dead = true;
            SetMoving(false);

            Collider col = GetComponent<Collider>();
            if (col != null) col.enabled = false;

            if (Animator != null) Animator.SetTrigger(Death);

            Destroy(gameObject, 1.25f);
        }
    }
}
