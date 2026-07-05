using UnityEngine;

namespace NightmarePark
{
    [CreateAssetMenu(menuName = "Nightmare Park/Unit Stats")]
    public class UnitStats : ScriptableObject
    {
        [Header("Identity")]
        public string UnitId = "grave_goblin";
        public string DisplayName = "Grave Goblin";
        public string Rarity = "Common";
        public int EnergyCost = 2;

        [Header("Combat")]
        public float MaxHealth = 260f;
        public float Damage = 52f;
        public float AttackRange = 0.8f;
        public float AttackRate = 0.72f;
        public float FirstHitMultiplier = 1.85f;

        [Header("Movement")]
        public float MoveSpeed = 3.8f;
        public float TurnSpeed = 12f;
        public bool MustUseBridge = true;

        [Header("Presentation")]
        public string MovementStyle = "Quick Scuttle";
        public string SignatureSkill = "Bone Stab";
    }
}
