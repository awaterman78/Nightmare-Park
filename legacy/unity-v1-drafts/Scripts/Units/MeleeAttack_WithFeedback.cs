using UnityEngine;

namespace NightmarePark
{
    public class MeleeAttack_WithFeedback : MonoBehaviour
    {
        public UnitController Unit;
        public UnitStats Stats;
        public Animator Animator;
        public BoneStabFeedback BoneStabFeedback;

        private Targetable currentTarget;
        private float cooldown;
        private bool firstHit = true;

        private static readonly int BoneStab = Animator.StringToHash("BoneStab");

        private void Awake()
        {
            if (Unit == null) Unit = GetComponent<UnitController>();
            if (Animator == null) Animator = GetComponentInChildren<Animator>();
            if (BoneStabFeedback == null) BoneStabFeedback = GetComponent<BoneStabFeedback>();
        }

        private void Update()
        {
            if (Unit == null || Stats == null || TargetingService.Instance == null) return;

            cooldown -= Time.deltaTime;

            currentTarget = TargetingService.Instance.FindNearestEnemy(transform.position, Unit.Team);

            if (currentTarget == null) return;

            float distance = Vector3.Distance(transform.position, currentTarget.transform.position);
            if (distance > Stats.AttackRange) return;

            if (cooldown <= 0f)
            {
                cooldown = Stats.AttackRate;

                if (Animator != null)
                {
                    Animator.SetTrigger(BoneStab);
                }
                else
                {
                    AnimEvent_BoneStabImpact();
                }
            }
        }

        public void AnimEvent_BoneStabImpact()
        {
            if (currentTarget == null || currentTarget.Health == null) return;

            float damage = Stats.Damage;
            bool special = false;

            if (firstHit)
            {
                damage *= Stats.FirstHitMultiplier;
                firstHit = false;
                special = true;
            }

            currentTarget.Health.TakeDamage(damage);
            CombatFeedbackService.Instance?.ShowDamage(currentTarget.transform.position + Vector3.up * 1.2f, damage, Unit.Team, special);
            BoneStabFeedback?.PlayBoneStabFeedback();
        }
    }
}
