using UnityEngine;

namespace NightmarePark
{
    public class ArenaPathing : MonoBehaviour
    {
        public static ArenaPathing Instance { get; private set; }

        [Header("Bridge points")]
        public Transform LeftBridgePlayerSide;
        public Transform LeftBridgeEnemySide;
        public Transform RightBridgePlayerSide;
        public Transform RightBridgeEnemySide;

        private void Awake()
        {
            Instance = this;
        }

        public Vector3 GetNextPathPoint(Vector3 current, Vector3 destination, Team unitTeam)
        {
            // If both current and destination are on same side, go direct.
            bool currentIsPlayerHalf = current.z < 0f;
            bool destinationIsPlayerHalf = destination.z < 0f;

            if (currentIsPlayerHalf == destinationIsPlayerHalf)
            {
                return destination;
            }

            bool useLeftBridge = current.x < 0f;

            if (unitTeam == Team.Player)
            {
                if (current.z < -0.45f)
                {
                    return useLeftBridge ? LeftBridgePlayerSide.position : RightBridgePlayerSide.position;
                }

                if (current.z < 0.45f)
                {
                    return useLeftBridge ? LeftBridgeEnemySide.position : RightBridgeEnemySide.position;
                }
            }
            else
            {
                if (current.z > 0.45f)
                {
                    return useLeftBridge ? LeftBridgeEnemySide.position : RightBridgeEnemySide.position;
                }

                if (current.z > -0.45f)
                {
                    return useLeftBridge ? LeftBridgePlayerSide.position : RightBridgePlayerSide.position;
                }
            }

            return destination;
        }
    }
}
