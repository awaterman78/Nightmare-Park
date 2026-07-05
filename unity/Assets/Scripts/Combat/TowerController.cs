using UnityEngine;

public class TowerController : MonoBehaviour
{
    public UnitController.Team team;
    public float range = 4f;
    public float damage = 62f;
    public float fireRate = 0.9f;

    private float cooldown;

    private void Update()
    {
        cooldown -= Time.deltaTime;
        if (cooldown > 0f) return;

        Health target = FindTarget();
        if (target == null) return;

        cooldown = fireRate;
        target.TakeDamage(damage);

        // TODO, trigger projectile VFX and tower animation.
    }

    private Health FindTarget()
    {
        Health[] all = FindObjectsOfType<Health>();
        Health best = null;
        float bestDistance = float.MaxValue;

        foreach (var h in all)
        {
            if (h.team == team) continue;

            float d = Vector3.Distance(transform.position, h.transform.position);
            if (d <= range && d < bestDistance)
            {
                bestDistance = d;
                best = h;
            }
        }

        return best;
    }
}
