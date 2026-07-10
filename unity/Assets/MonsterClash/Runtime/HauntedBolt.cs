using UnityEngine;

namespace MonsterClash
{
    public sealed class HauntedBolt : MonoBehaviour
    {
        private BattleHealth target;
        private float damage;
        private float speed;
        private Vector3 lastTargetPosition;

        public static void Launch(Vector3 origin, BattleHealth targetHealth, float amount, float travelSpeed, Color colour)
        {
            if (targetHealth == null || !targetHealth.IsAlive) return;

            GameObject bolt = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            bolt.name = "Haunted bolt";
            bolt.transform.position = origin;
            bolt.transform.localScale = Vector3.one * 0.16f;

            Collider collider = bolt.GetComponent<Collider>();
            if (collider != null) Destroy(collider);

            Renderer renderer = bolt.GetComponent<Renderer>();
            renderer.sharedMaterial = RuntimeArt.CreateMaterial("Haunted bolt", colour, true);

            TrailRenderer trail = bolt.AddComponent<TrailRenderer>();
            trail.time = 0.18f;
            trail.startWidth = 0.12f;
            trail.endWidth = 0f;
            trail.sharedMaterial = RuntimeArt.CreateMaterial("Haunted trail", new Color(colour.r, colour.g, colour.b, 0.75f), true);

            HauntedBolt projectile = bolt.AddComponent<HauntedBolt>();
            projectile.target = targetHealth;
            projectile.damage = amount;
            projectile.speed = Mathf.Max(1f, travelSpeed);
            projectile.lastTargetPosition = targetHealth.transform.position + Vector3.up * 0.45f;
        }

        private void Update()
        {
            if (target != null && target.IsAlive)
            {
                lastTargetPosition = target.transform.position + Vector3.up * 0.45f;
            }

            transform.position = Vector3.MoveTowards(transform.position, lastTargetPosition, speed * Time.deltaTime);

            if ((transform.position - lastTargetPosition).sqrMagnitude > 0.025f) return;

            if (target != null && target.IsAlive)
            {
                target.ApplyDamage(damage);
            }

            Destroy(gameObject);
        }
    }
}
