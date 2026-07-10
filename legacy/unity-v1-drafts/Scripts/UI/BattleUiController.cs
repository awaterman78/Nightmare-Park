using UnityEngine;

namespace NightmarePark
{
    public class BattleUiController : MonoBehaviour
    {
        [Header("Systems")]
        public EnergySystem EnergySystem;
        public DeploymentController_TouchReady DeploymentController;

        [Header("Health")]
        public Health PlayerCore;
        public Health EnemyCore;

        [Header("Views")]
        public EnergyUiView EnergyView;
        public CoreHealthUiView PlayerCoreView;
        public CoreHealthUiView EnemyCoreView;
        public BattleTimerUiView TimerView;
        public MonsterCardUiView GraveGoblinCard;
        public ResultPanelController ResultPanel;

        [Header("Battle")]
        public float MatchTime = 180f;

        private bool graveGoblinSelected;
        private bool battleEnded;

        private void Start()
        {
            if (EnergySystem != null)
            {
                EnergySystem.EnergyChanged += HandleEnergyChanged;
                HandleEnergyChanged(EnergySystem.CurrentEnergy, EnergySystem.MaxEnergy);
            }

            if (PlayerCore != null)
            {
                PlayerCore.Changed += HandlePlayerCoreChanged;
                PlayerCore.Died += HandleCoreDied;
                HandlePlayerCoreChanged(PlayerCore, PlayerCore.CurrentHealth, PlayerCore.MaxHealth);
            }

            if (EnemyCore != null)
            {
                EnemyCore.Changed += HandleEnemyCoreChanged;
                EnemyCore.Died += HandleCoreDied;
                HandleEnemyCoreChanged(EnemyCore, EnemyCore.CurrentHealth, EnemyCore.MaxHealth);
            }

            if (GraveGoblinCard != null)
            {
                GraveGoblinCard.Setup("GRAVE GOBLIN", 2, "Quick Scuttle");
            }
        }

        private void Update()
        {
            if (battleEnded) return;

            MatchTime -= Time.deltaTime;
            if (TimerView != null)
            {
                TimerView.SetTime(MatchTime);
            }
        }

        public void OnGraveGoblinCardPressed()
        {
            if (battleEnded) return;

            graveGoblinSelected = !graveGoblinSelected;

            if (GraveGoblinCard != null)
            {
                GraveGoblinCard.SetSelected(graveGoblinSelected);
            }

            if (graveGoblinSelected && DeploymentController != null)
            {
                DeploymentController.SelectGraveGoblin();
            }
        }

        private void HandleEnergyChanged(float current, float max)
        {
            if (EnergyView != null)
            {
                EnergyView.SetEnergy(current, max);
            }

            if (GraveGoblinCard != null)
            {
                GraveGoblinCard.SetAffordable(current >= GraveGoblinCard.Cost);
            }
        }

        private void HandlePlayerCoreChanged(Health health, float current, float max)
        {
            if (PlayerCoreView != null)
            {
                PlayerCoreView.SetHealth(current, max);
            }
        }

        private void HandleEnemyCoreChanged(Health health, float current, float max)
        {
            if (EnemyCoreView != null)
            {
                EnemyCoreView.SetHealth(current, max);
            }
        }

        private void HandleCoreDied(Health core)
        {
            if (battleEnded) return;
            battleEnded = true;

            if (core == EnemyCore)
            {
                ResultPanel?.ShowVictory();
            }
            else if (core == PlayerCore)
            {
                ResultPanel?.ShowDefeat();
            }
        }
    }
}
