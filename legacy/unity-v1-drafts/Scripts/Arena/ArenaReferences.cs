using UnityEngine;

namespace NightmarePark
{
    public class ArenaReferences : MonoBehaviour
    {
        public static ArenaReferences Instance { get; private set; }

        [Header("Config")]
        public ArenaConfig Config;

        [Header("Bridge points")]
        public Transform LeftBridgePlayerSide;
        public Transform LeftBridgeEnemySide;
        public Transform RightBridgePlayerSide;
        public Transform RightBridgeEnemySide;

        [Header("Core points")]
        public Transform PlayerCore;
        public Transform EnemyCore;

        [Header("Tower points")]
        public Transform PlayerTowerLeft;
        public Transform PlayerTowerRight;
        public Transform EnemyTowerLeft;
        public Transform EnemyTowerRight;

        [Header("Runtime parents")]
        public Transform SpawnedUnitsParent;
        public Transform VfxParent;
        public Transform ProjectileParent;

        private void Awake()
        {
            Instance = this;
        }
    }
}
