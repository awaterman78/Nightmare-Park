using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterClash
{
    public sealed class BattleDirector : MonoBehaviour
    {
        public const string BuildLabel = "MOBILE INPUT 5";

        private readonly List<DefenceTower> towers = new List<DefenceTower>();
        private readonly List<MonsterCard> deck = new List<MonsterCard>();

        private ArenaLayout arena;
        private Transform unitsRoot;
        private CardCycle playerCards;
        private CardCycle enemyCards;
        private EnergyPool playerEnergy;
        private EnergyPool enemyEnergy;
        private float enemyThinkTimer;
        private float statusTimer;
        private int randomSeed;

        public BattlePhase Phase { get; private set; } = BattlePhase.Preparing;
        public float TimeRemaining { get; private set; } = BattleBalance.MatchLengthSeconds;
        public int SelectedHandIndex { get; private set; } = -1;
        public string StatusMessage { get; private set; } = "The gates are opening.";
        public float PlayerEnergy => playerEnergy?.Current ?? 0f;
        public float EnemyEnergy => enemyEnergy?.Current ?? 0f;
        public float MaximumEnergy => BattleBalance.MaximumEnergy;
        public IReadOnlyList<MonsterCard> PlayerHand => playerCards?.SnapshotHand() ?? Array.Empty<MonsterCard>();
        public MonsterCard NextPlayerCard => playerCards?.Next;
        public DefenceTower PlayerCore { get; private set; }
        public DefenceTower EnemyCore { get; private set; }

        public void Initialise(ArenaLayout arenaLayout, Transform spawnedUnitsRoot, IReadOnlyList<MonsterCard> battleDeck)
        {
            arena = arenaLayout;
            unitsRoot = spawnedUnitsRoot;
            deck.Clear();
            deck.AddRange(battleDeck);

            randomSeed = Environment.TickCount;
            playerCards = new CardCycle(deck, BattleBalance.HandSize, randomSeed);
            enemyCards = new CardCycle(deck, BattleBalance.HandSize, randomSeed ^ 0x5f3759df);
            playerEnergy = new EnergyPool(BattleBalance.StartingEnergy, BattleBalance.MaximumEnergy);
            enemyEnergy = new EnergyPool(BattleBalance.StartingEnergy, BattleBalance.MaximumEnergy);
            TimeRemaining = BattleBalance.MatchLengthSeconds;
            SelectedHandIndex = -1;
            enemyThinkTimer = 1.35f;
            Phase = BattlePhase.Playing;
            SetStatus(BuildLabel + " READY. Pick a monster, then tap or drag into the arena.", 8f);
        }

        public void RegisterTower(DefenceTower tower)
        {
            if (tower == null || towers.Contains(tower)) return;
            towers.Add(tower);

            if (!tower.IsCore) return;
            if (tower.Team == BattleTeam.Player) PlayerCore = tower;
            if (tower.Team == BattleTeam.Enemy) EnemyCore = tower;
        }

        public void SelectPlayerCard(int handIndex)
        {
            if (Phase != BattlePhase.Playing) return;

            MonsterCard card = playerCards?.CardAt(handIndex);
            if (card == null) return;

            if (SelectedHandIndex == handIndex)
            {
                SelectedHandIndex = -1;
                SetStatus("Card cancelled.", 1.2f);
                return;
            }

            SelectedHandIndex = handIndex;
            SetStatus(
                playerEnergy.CanSpend(card.EnergyCost)
                    ? card.DisplayName + " selected. Tap or drag into the arena."
                    : card.DisplayName + " needs " + card.EnergyCost + " energy.",
                2.6f);
        }

        public void CancelSelection()
        {
            SelectedHandIndex = -1;
        }

        public bool TryDeploySelected(Vector3 point)
        {
            if (Phase != BattlePhase.Playing || SelectedHandIndex < 0) return false;

            MonsterCard card = playerCards.CardAt(SelectedHandIndex);
            if (card == null) return false;
            if (!playerEnergy.TrySpend(card.EnergyCost))
            {
                SetStatus("Not enough energy for " + card.DisplayName + ".", 2f);
                return false;
            }

            Vector3 deploymentPoint = arena.ClampDeployment(point, BattleTeam.Player);
            int playedIndex = SelectedHandIndex;
            SelectedHandIndex = -1;
            playerCards.Play(playedIndex, out MonsterCard playedCard);
            Spawn(playedCard, BattleTeam.Player, deploymentPoint);
            SetStatus(playedCard.DisplayName + " joins the nightmare.", 1.6f);
            return true;
        }

        public void NotifyTowerDestroyed(DefenceTower tower)
        {
            if (Phase != BattlePhase.Playing || tower == null) return;

            if (tower.IsCore)
            {
                Finish(tower.Team == BattleTeam.Enemy ? BattlePhase.Victory : BattlePhase.Defeat);
                return;
            }

            SetStatus(
                tower.Team == BattleTeam.Enemy ? "Enemy defence destroyed." : "One of your defences has fallen.",
                2.8f);
        }

        public void Restart()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }

        public void SetStatus(string message, float duration)
        {
            StatusMessage = message;
            statusTimer = Mathf.Max(0f, duration);
        }

        private void Update()
        {
            if (Phase != BattlePhase.Playing) return;

            float deltaTime = Mathf.Min(0.05f, Time.deltaTime);
            TimeRemaining = Mathf.Max(0f, TimeRemaining - deltaTime);
            float energyMultiplier = TimeRemaining <= BattleBalance.DoubleEnergyStartsAt ? 2f : 1f;
            playerEnergy.Tick(deltaTime, energyMultiplier);
            enemyEnergy.Tick(deltaTime, energyMultiplier);

            statusTimer -= deltaTime;
            if (statusTimer <= 0f)
            {
                StatusMessage = energyMultiplier > 1f ? "Double energy. The park is furious." : "Destroy the enemy heart tower.";
            }

            enemyThinkTimer -= deltaTime;
            if (enemyThinkTimer <= 0f)
            {
                RunEnemyTurn();
            }

            if (TimeRemaining <= 0f)
            {
                ResolveTimedMatch();
            }
        }

        private void RunEnemyTurn()
        {
            enemyThinkTimer = UnityEngine.Random.Range(0.72f, 1.25f);

            List<int> affordable = new List<int>();
            for (int i = 0; i < BattleBalance.HandSize; i++)
            {
                MonsterCard card = enemyCards.CardAt(i);
                if (card != null && enemyEnergy.CanSpend(card.EnergyCost)) affordable.Add(i);
            }

            if (affordable.Count == 0) return;

            int chosenIndex = affordable[UnityEngine.Random.Range(0, affordable.Count)];
            MonsterCard chosenCard = enemyCards.CardAt(chosenIndex);

            float x = UnityEngine.Random.value < 0.5f ? -BattleBalance.BridgeX : BattleBalance.BridgeX;
            float z = UnityEngine.Random.Range(3.35f, 5.55f);

            MonsterActor threat = FindDeepestPlayerThreat();
            if (threat != null && UnityEngine.Random.value < 0.68f)
            {
                x = Mathf.Clamp(threat.transform.position.x + UnityEngine.Random.Range(-0.65f, 0.65f), -3.6f, 3.6f);
                z = Mathf.Clamp(threat.transform.position.z + 1.2f, 1.25f, 5.2f);
            }

            Vector3 point = arena.ClampDeployment(new Vector3(x, 0.05f, z), BattleTeam.Enemy);
            if (!enemyEnergy.TrySpend(chosenCard.EnergyCost)) return;

            enemyCards.Play(chosenIndex, out MonsterCard playedCard);
            Spawn(playedCard, BattleTeam.Enemy, point);
        }

        private MonsterActor FindDeepestPlayerThreat()
        {
            MonsterActor[] actors = FindObjectsByType<MonsterActor>(FindObjectsSortMode.None);
            MonsterActor best = null;
            float deepest = -BattleBalance.ArenaHalfLength;

            foreach (MonsterActor actor in actors)
            {
                if (actor == null || !actor.IsAlive || actor.Team != BattleTeam.Player) continue;
                if (actor.transform.position.z <= deepest) continue;
                best = actor;
                deepest = actor.transform.position.z;
            }

            return best != null && deepest > 0.9f ? best : null;
        }

        private void Spawn(MonsterCard card, BattleTeam owner, Vector3 point)
        {
            MonsterFactory.Create(card, owner, arena, point, unitsRoot);
        }

        private void ResolveTimedMatch()
        {
            float playerScore = TeamTowerHealth(BattleTeam.Player);
            float enemyScore = TeamTowerHealth(BattleTeam.Enemy);
            Finish(playerScore >= enemyScore ? BattlePhase.Victory : BattlePhase.Defeat);
        }

        private float TeamTowerHealth(BattleTeam owner)
        {
            float total = 0f;
            foreach (DefenceTower tower in towers)
            {
                if (tower == null || tower.Team != owner || tower.Health == null) continue;
                total += tower.Health.Normalised;
            }
            return total;
        }

        private void Finish(BattlePhase result)
        {
            if (Phase != BattlePhase.Playing) return;
            Phase = result;
            SelectedHandIndex = -1;
            StatusMessage = result == BattlePhase.Victory
                ? "Victory. The enemy heart has stopped."
                : "Defeat. Your monsters want a rematch.";
        }
    }
}
