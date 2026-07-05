using UnityEngine;

namespace NightmarePark
{
    public class MeleeAttack : MonoBehaviour
    {
        public UnitController Unit;
        public UnitStats Stats;
        public Animator Animator;

        private Targetable currentTarget;
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
                    ApplyDamage();
                }
            }
        }

        // Hook this to the impact frame in the GG_Bone_Stab animation.
        public void AnimEvent_BoneStabImpact()
        {
            ApplyDamage();
        }

        private void ApplyDamage()
        {
            if (currentTarget == null || currentTarget.Health == null) return;

            float damage = Stats.Damage;

            if (firstHit)
            {
                damage *= Stats.FirstHitMultiplier;
                firstHit = false;
            }

            currentTarget.Health.TakeDamage(damage);
        }
    }
}
