using UnityEngine;

namespace NightmarePark
{
    [CreateAssetMenu(menuName = "Nightmare Park/Unit Stats")]
    public class UnitStats : ScriptableObject
    {
        public string UnitName = "Grave Goblin";
        public int EnergyCost = 2;

        public float MaxHealth = 260f;
        public float MoveSpeed = 3.8f;
        public float AttackDamage = 52f;
        public float AttackRate = 0.72f;
        public float AttackRange = 0.8f;
        public float FirstHitMultiplier = 1.85f;
    }
}
