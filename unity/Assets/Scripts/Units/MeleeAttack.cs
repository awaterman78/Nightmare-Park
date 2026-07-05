using UnityEngine;

namespace NightmarePark
{
    public class MeleeAttack : MonoBehaviour
    {
        public UnitController Unit;
        public UnitStats Stats;
        public Animator Animator;

        private Transform target;
        private float cooldown;
        private bool firstHit = true;

        private static readonly int BoneStab = Animator.StringToHash("BoneStab");

        private void Awake()
        {
            if (Unit == null) Unit = GetComponent<UnitController>();
            if (Animator == null) Animator = GetComponentInChildren<Animator>();
        }

        private void Update()
        {
            if (Unit == null || Stats == null) return;

            cooldown -= Time.deltaTime;

            target = TargetingUtility.FindNearestTarget(transform.position, Unit.Team);
            if (target == null) return;

            float distance = Vector3.Distance(transform.position, target.position);
            if (distance > Stats.AttackRange) return;

            if (cooldown <= 0f)
            {
                cooldown = Stats.AttackRate;
                if (Animator != null) Animator.SetTrigger(BoneStab);
            }
        }

        // Call this from the Bone Stab animation event at the impact frame.
        public void AnimEvent_BoneStabImpact()
        {
            if (target == null || Stats == null) return;

            Health targetHealth = target.GetComponent<Health>();
            if (targetHealth == null) return;

            float damage = Stats.AttackDamage;

            if (firstHit)
            {
                damage *= Stats.FirstHitMultiplier;
                firstHit = false;
            }

            targetHealth.TakeDamage(damage);
        }
    }
}
