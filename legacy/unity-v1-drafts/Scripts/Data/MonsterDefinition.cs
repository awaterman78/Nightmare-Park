using UnityEngine;

namespace NightmarePark
{
    [CreateAssetMenu(menuName = "Nightmare Park/Monster Definition")]
    public class MonsterDefinition : ScriptableObject
    {
        public string Id;
        public string DisplayName;
        public MonsterRarity Rarity;
        public MonsterRole Role;
        public int EnergyCost;

        public Sprite CardPortrait;
        public GameObject UnitPrefab;
        public string MovementStyle;
        public string SignatureSkill;
        [TextArea] public string ShortDescription;
        [TextArea] public string AnimationNotes;

        public TargetingType TargetingType;

        public float Health;
        public float Damage;
        public float AttackRate;
        public float AttackRange;
        public float MoveSpeed;
        public int DeploymentCount = 1;

        [TextArea] public string SpecialRule;
        [TextArea] public string Strengths;
        [TextArea] public string Weaknesses;
        public int BuildPriority;
    }
}
