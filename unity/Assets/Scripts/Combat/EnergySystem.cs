using System;
using UnityEngine;

namespace NightmarePark
{
    public class EnergySystem : MonoBehaviour
    {
        public float MaxEnergy = 10f;
        public float CurrentEnergy = 5f;
        public float RechargeRate = 1f;

        public event Action<float, float> OnEnergyChanged;

        private void Update()
        {
            CurrentEnergy = Mathf.Min(MaxEnergy, CurrentEnergy + RechargeRate * Time.deltaTime);
            OnEnergyChanged?.Invoke(CurrentEnergy, MaxEnergy);
        }

        public bool CanSpend(float cost)
        {
            return CurrentEnergy >= cost;
        }

        public bool TrySpend(float cost)
        {
            if (!CanSpend(cost)) return false;

            CurrentEnergy -= cost;
            OnEnergyChanged?.Invoke(CurrentEnergy, MaxEnergy);
            return true;
        }
    }
}
