using System;
using UnityEngine;

namespace NightmarePark
{
    public class Health : MonoBehaviour
    {
        public Team Team;
        public float MaxHealth = 260f;
        public float CurrentHealth;

        public event Action<float, float> OnHealthChanged;
        public event Action<Health> OnDied;
        public event Action<float> OnDamaged;

        private bool isDead;

        private void Awake()
        {
            CurrentHealth = MaxHealth;
            OnHealthChanged?.Invoke(CurrentHealth, MaxHealth);
        }

        public void TakeDamage(float amount)
        {
            if (isDead) return;

            CurrentHealth = Mathf.Max(0f, CurrentHealth - amount);
            OnDamaged?.Invoke(amount);
            OnHealthChanged?.Invoke(CurrentHealth, MaxHealth);

            if (CurrentHealth <= 0f)
            {
                isDead = true;
                OnDied?.Invoke(this);
            }
        }
    }
}
