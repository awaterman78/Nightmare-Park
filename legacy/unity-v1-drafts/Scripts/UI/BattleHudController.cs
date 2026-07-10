using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace NightmarePark
{
    public class BattleHudController : MonoBehaviour
    {
        public EnergySystem EnergySystem;

        [Header("Energy UI")]
        public Slider EnergySlider;
        public TMP_Text EnergyText;

        [Header("Core UI")]
        public Health PlayerCore;
        public Health EnemyCore;
        public Slider PlayerCoreSlider;
        public Slider EnemyCoreSlider;
        public TMP_Text PlayerCoreText;
        public TMP_Text EnemyCoreText;

        private void Start()
        {
            if (EnergySystem != null)
            {
                EnergySystem.EnergyChanged += UpdateEnergy;
                UpdateEnergy(EnergySystem.CurrentEnergy, EnergySystem.MaxEnergy);
            }

            if (PlayerCore != null)
            {
                PlayerCore.Changed += UpdatePlayerCore;
                UpdatePlayerCore(PlayerCore, PlayerCore.CurrentHealth, PlayerCore.MaxHealth);
            }

            if (EnemyCore != null)
            {
                EnemyCore.Changed += UpdateEnemyCore;
                UpdateEnemyCore(EnemyCore, EnemyCore.CurrentHealth, EnemyCore.MaxHealth);
            }
        }

        private void UpdateEnergy(float current, float max)
        {
            if (EnergySlider != null) EnergySlider.value = current / max;
            if (EnergyText != null) EnergyText.text = $"{current:0.0} / {max:0}";
        }

        private void UpdatePlayerCore(Health health, float current, float max)
        {
            if (PlayerCoreSlider != null) PlayerCoreSlider.value = current / max;
            if (PlayerCoreText != null) PlayerCoreText.text = $"{current:0}";
        }

        private void UpdateEnemyCore(Health health, float current, float max)
        {
            if (EnemyCoreSlider != null) EnemyCoreSlider.value = current / max;
            if (EnemyCoreText != null) EnemyCoreText.text = $"{current:0}";
        }
    }
}
