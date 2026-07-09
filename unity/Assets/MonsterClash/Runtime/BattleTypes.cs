using UnityEngine;

namespace MonsterClash
{
    public enum BattleTeam
    {
        Player,
        Enemy
    }

    public enum BattlePhase
    {
        Preparing,
        Playing,
        Victory,
        Defeat
    }

    public enum MonsterArchetype
    {
        GraveGoblin,
        CandleImp,
        TinBat,
        MirrorClown,
        ZombieRunner,
        BoneBrute,
        PhantomBride,
        WerewolfKing
    }

    public enum TargetPreference
    {
        Any,
        Units,
        Buildings
    }

    public static class BattleBalance
    {
        public const float MatchLengthSeconds = 180f;
        public const float DoubleEnergyStartsAt = 60f;
        public const float MaximumEnergy = 10f;
        public const float StartingEnergy = 5f;
        public const float BaseEnergyPerSecond = 1f;
        public const int HandSize = 4;
        public const float RiverHalfWidth = 0.58f;
        public const float BridgeX = 2.35f;
        public const float ArenaHalfWidth = 4.45f;
        public const float ArenaHalfLength = 6.9f;
        public const float DeploymentRiverMargin = 0.85f;

        public static Color TeamColour(BattleTeam team)
        {
            return team == BattleTeam.Player
                ? new Color(0.18f, 1f, 0.58f, 1f)
                : new Color(0.95f, 0.22f, 0.72f, 1f);
        }
    }
}
