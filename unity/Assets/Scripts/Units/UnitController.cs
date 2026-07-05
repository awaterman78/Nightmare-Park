using UnityEngine;

public class UnitController : MonoBehaviour
{
    public enum Team { Player, Enemy }

    public Team team;
    public float moveSpeed = 3.8f;
    public float attackRange = 0.8f;
    public float attackRate = 0.72f;
    public float attackDamage = 52f;
    public float firstHitMultiplier = 1.85f;

    private Transform currentTarget;
    private float attackCooldown;
    private bool firstHit = true;
    private Animator animator;

    private void Awake()
    {
        animator = GetComponentInChildren<Animator>();
    }

    private void Update()
    {
        FindTarget();

        if (currentTarget == null)
        {
            animator?.SetBool("IsMoving", false);
            return;
        }

        float distance = Vector3.Distance(transform.position, currentTarget.position);

        if (distance > attackRange)
        {
            MoveTowardsTarget();
        }
        else
        {
            AttackTarget();
        }
    }

    private void FindTarget()
    {
        // TODO, replace with efficient targeting system.
        var targets = FindObjectsOfType<Health>();
        float bestDistance = float.MaxValue;
        Transform best = null;

        foreach (var target in targets)
        {
            if (target.team == team) continue;

            float d = Vector3.Distance(transform.position, target.transform.position);
            if (d < bestDistance)
            {
                bestDistance = d;
                best = target.transform;
            }
        }

        currentTarget = best;
    }

    private void MoveTowardsTarget()
    {
        animator?.SetBool("IsMoving", true);
        Vector3 direction = (currentTarget.position - transform.position).normalized;
        transform.position += direction * moveSpeed * Time.deltaTime;

        if (direction.sqrMagnitude > 0.001f)
        {
            transform.forward = Vector3.Lerp(transform.forward, direction, Time.deltaTime * 12f);
        }
    }

    private void AttackTarget()
    {
        animator?.SetBool("IsMoving", false);

        attackCooldown -= Time.deltaTime;
        if (attackCooldown > 0f) return;

        attackCooldown = attackRate;
        animator?.SetTrigger("BoneStab");

        float damage = attackDamage;
        if (firstHit)
        {
            damage *= firstHitMultiplier;
            firstHit = false;
        }

        Health health = currentTarget.GetComponent<Health>();
        if (health != null)
        {
            health.TakeDamage(damage);
        }
    }
}
