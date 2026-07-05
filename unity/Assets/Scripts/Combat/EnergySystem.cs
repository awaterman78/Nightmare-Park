using UnityEngine;
using System;

public class EnergySystem : MonoBehaviour
{
    public float maxEnergy = 10f;
    public float currentEnergy = 5f;
    public float rechargeRate = 1f;

    public event Action<float, float> OnEnergyChanged;

    private void Update()
    {
        currentEnergy = Mathf.Min(maxEnergy, currentEnergy + rechargeRate * Time.deltaTime);
        OnEnergyChanged?.Invoke(currentEnergy, maxEnergy);
    }

    public bool TrySpend(float amount)
    {
        if (currentEnergy < amount) return false;

        currentEnergy -= amount;
        OnEnergyChanged?.Invoke(currentEnergy, maxEnergy);
        return true;
    }
}
