using System;
using UnityEngine;

namespace NightmarePark
{
    public class EnergySystem : MonoBehaviour
    {
        public float MaxEnergy = 10f;
        public float StartingEnergy = 5f;
        public float RechargeRate = 1f;

        public float CurrentEnergy { get; private set; }

        public event Action<float, float> EnergyChanged;

        private void Awake()
        {
            CurrentEnergy = StartingEnergy;
            EnergyChanged?.Invoke(CurrentEnergy, MaxEnergy);
        }

        private void Update()
        {
            if (CurrentEnergy >= MaxEnergy) return;

            CurrentEnergy = Mathf.Min(MaxEnergy, CurrentEnergy + RechargeRate * Time.deltaTime);
            EnergyChanged?.Invoke(CurrentEnergy, MaxEnergy);
        }

        public bool TrySpend(float amount)
        {
            if (CurrentEnergy < amount) return false;

            CurrentEnergy -= amount;
            EnergyChanged?.Invoke(CurrentEnergy, MaxEnergy);
            return true;
        }
    }
}
