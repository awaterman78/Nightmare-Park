using System;
using UnityEngine;

namespace MonsterClash
{
    public sealed class EnergyPool
    {
        public float Current { get; private set; }
        public float Maximum { get; }

        public event Action<float, float> Changed;

        public EnergyPool(float starting, float maximum)
        {
            Maximum = Mathf.Max(1f, maximum);
            Current = Mathf.Clamp(starting, 0f, Maximum);
        }

        public void Tick(float deltaTime, float rechargeMultiplier)
        {
            float previous = Current;
            Current = Mathf.Min(
                Maximum,
                Current + BattleBalance.BaseEnergyPerSecond * Mathf.Max(0f, rechargeMultiplier) * deltaTime);

            if (!Mathf.Approximately(previous, Current))
            {
                Changed?.Invoke(Current, Maximum);
            }
        }

        public bool CanSpend(int amount)
        {
            return amount >= 0 && Current + 0.001f >= amount;
        }

        public bool TrySpend(int amount)
        {
            if (!CanSpend(amount)) return false;
            Current = Mathf.Max(0f, Current - amount);
            Changed?.Invoke(Current, Maximum);
            return true;
        }
    }
}
