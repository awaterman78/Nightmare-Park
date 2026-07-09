using UnityEngine;

[CreateAssetMenu(menuName = "Nightmare Park/Monster Stats/Grave Goblin")]
public class GraveGoblinStats : ScriptableObject
{
    public string monsterName = "Grave Goblin";
    public int energyCost = 2;
    public float maxHealth = 260f;
    public float moveSpeed = 3.8f;
    public float attackDamage = 52f;
    public float attackRate = 0.72f;
    public float attackRange = 0.8f;
    public float firstHitMultiplier = 1.85f;
}
