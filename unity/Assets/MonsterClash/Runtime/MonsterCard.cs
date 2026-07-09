using UnityEngine;

namespace MonsterClash
{
    [CreateAssetMenu(menuName = "Monster Clash/Monster Card")]
    public sealed class MonsterCard : ScriptableObject
    {
        [Header("Identity")]
        public string Id = "grave_goblin";
        public string DisplayName = "Grave Goblin";
        [TextArea] public string Description = "Fast melee pressure.";
        public MonsterArchetype Archetype = MonsterArchetype.GraveGoblin;
        [Range(1, 10)] public int EnergyCost = 2;

        [Header("Combat")]
        public float MaximumHealth = 260f;
        public float Damage = 52f;
        public float AttackInterval = 0.72f;
        public float AttackRange = 0.82f;
        public float AggroRange = 4.6f;
        public float MoveSpeed = 2.8f;
        public TargetPreference TargetPreference = TargetPreference.Any;
        public bool Flying;

        [Header("Presentation")]
        public GameObject ModelPrefab;
        public Sprite CardPortrait;
        public Color AccentColour = new Color(0.35f, 1f, 0.34f, 1f);
        public float VisualScale = 1f;

        public void Configure(
            string id,
            string displayName,
            MonsterArchetype archetype,
            int cost,
            float health,
            float damage,
            float attackInterval,
            float attackRange,
            float moveSpeed,
            Color accent)
        {
            Id = id;
            DisplayName = displayName;
            Archetype = archetype;
            EnergyCost = cost;
            MaximumHealth = health;
            Damage = damage;
            AttackInterval = attackInterval;
            AttackRange = attackRange;
            MoveSpeed = moveSpeed;
            AccentColour = accent;
        }

        private void OnValidate()
        {
            EnergyCost = Mathf.Clamp(EnergyCost, 1, 10);
            MaximumHealth = Mathf.Max(1f, MaximumHealth);
            Damage = Mathf.Max(1f, Damage);
            AttackInterval = Mathf.Max(0.1f, AttackInterval);
            AttackRange = Mathf.Max(0.2f, AttackRange);
            AggroRange = Mathf.Max(AttackRange, AggroRange);
            MoveSpeed = Mathf.Max(0.1f, MoveSpeed);
            VisualScale = Mathf.Max(0.1f, VisualScale);
        }
    }
}
