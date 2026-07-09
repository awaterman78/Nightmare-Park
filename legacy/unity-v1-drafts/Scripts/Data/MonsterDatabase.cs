using System.Collections.Generic;
using UnityEngine;

namespace NightmarePark
{
    [CreateAssetMenu(menuName = "Nightmare Park/Monster Database")]
    public class MonsterDatabase : ScriptableObject
    {
        public List<MonsterDefinition> Monsters = new List<MonsterDefinition>();

        public MonsterDefinition GetById(string id)
        {
            foreach (MonsterDefinition monster in Monsters)
            {
                if (monster != null && monster.Id == id)
                {
                    return monster;
                }
            }

            return null;
        }
    }
}
