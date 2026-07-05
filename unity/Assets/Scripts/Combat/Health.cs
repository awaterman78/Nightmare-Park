using UnityEngine;
using System;

public class Health : MonoBehaviour
{
    public UnitController.Team team;
    public float maxHealth = 260f;
    public float currentHealth;

    public event Action<float, float> OnHealthChanged;
    public event Action OnDied;

    private void Awake()
    {
        currentHealth = maxHealth;
        OnHealthChanged?.Invoke(currentHealth, maxHealth);
    }

    public void TakeDamage(float damage)
    {
        currentHealth = Mathf.Max(0f, currentHealth - damage);
        OnHealthChanged?.Invoke(currentHealth, maxHealth);

        if (currentHealth <= 0f)
        {
            OnDied?.Invoke();
            Destroy(gameObject);
        }
    }
}
