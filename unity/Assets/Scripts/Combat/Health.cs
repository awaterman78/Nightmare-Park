using System;
using UnityEngine;

namespace NightmarePark
{
    public class Health : MonoBehaviour
    {
        public Team Team;
        public float MaxHealth = 100f;
        public float CurrentHealth = 100f;

        public bool IsDead { get; private set; }

        public event Action<Health> Died;
        public event Action<Health, float> Damaged;
        public event Action<Health, float, float> Changed;

        private void Awake()
        {
            CurrentHealth = MaxHealth;
            Changed?.Invoke(this, CurrentHealth, MaxHealth);
        }

        public void SetMaxHealth(float maxHealth)
        {
            MaxHealth = maxHealth;
            CurrentHealth = MaxHealth;
            Changed?.Invoke(this, CurrentHealth, MaxHealth);
        }

        public void TakeDamage(float amount)
        {
            if (IsDead) return;

            CurrentHealth = Mathf.Max(0f, CurrentHealth - amount);
            Damaged?.Invoke(this, amount);
            Changed?.Invoke(this, CurrentHealth, MaxHealth);

            if (CurrentHealth <= 0f)
            {
                IsDead = true;
                Died?.Invoke(this);
            }
        }
    }
}
