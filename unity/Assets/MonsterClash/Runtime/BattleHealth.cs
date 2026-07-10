using System;
using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleHealth : MonoBehaviour
    {
        [SerializeField] private BattleTeam team;
        [SerializeField] private float maximum = 100f;
        [SerializeField] private float current;

        public BattleTeam Team => team;
        public float Maximum => maximum;
        public float Current => current;
        public float Normalised => maximum <= 0f ? 0f : current / maximum;
        public bool IsAlive => current > 0f;

        public event Action<BattleHealth> Changed;
        public event Action<BattleHealth> Died;

        public void Initialise(BattleTeam owner, float maximumHealth)
        {
            team = owner;
            maximum = Mathf.Max(1f, maximumHealth);
            current = maximum;
            Changed?.Invoke(this);
        }

        public bool ApplyDamage(float amount)
        {
            if (!IsAlive || amount <= 0f) return false;

            current = Mathf.Max(0f, current - amount);
            Changed?.Invoke(this);

            if (current <= 0f)
            {
                Died?.Invoke(this);
            }

            return true;
        }

        public bool Heal(float amount)
        {
            if (!IsAlive || amount <= 0f || current >= maximum) return false;
            current = Mathf.Min(maximum, current + amount);
            Changed?.Invoke(this);
            return true;
        }
    }
}
