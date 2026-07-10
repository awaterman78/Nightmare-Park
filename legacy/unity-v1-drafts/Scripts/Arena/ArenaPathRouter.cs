using UnityEngine;

namespace NightmarePark
{
    public class ArenaPathRouter : MonoBehaviour
    {
        public static ArenaPathRouter Instance { get; private set; }

        private ArenaReferences refs;

        private void Awake()
        {
            Instance = this;
            refs = ArenaReferences.Instance;
        }

        public Vector3 GetNextPoint(Vector3 current, Vector3 destination, Team team)
        {
            if (refs == null)
            {
                refs = ArenaReferences.Instance;
            }

            if (refs == null)
            {
                return destination;
            }

            bool currentPlayerSide = current.z < 0f;
            bool destinationPlayerSide = destination.z < 0f;

            if (currentPlayerSide == destinationPlayerSide)
            {
                return destination;
            }

            bool useLeftBridge = current.x < 0f;

            Transform nearBridge = GetNearBridge(team, current.z, useLeftBridge);
            if (nearBridge != null)
            {
                float distanceToNearBridge = Vector3.Distance(current, nearBridge.position);
                if (distanceToNearBridge > 0.25f)
                {
                    return nearBridge.position;
                }
            }

            Transform farBridge = GetFarBridge(team, current.z, useLeftBridge);
            if (farBridge != null)
            {
                float distanceToFarBridge = Vector3.Distance(current, farBridge.position);
                if (distanceToFarBridge > 0.25f)
                {
                    return farBridge.position;
                }
            }

            return destination;
        }

        private Transform GetNearBridge(Team team, float currentZ, bool left)
        {
            if (team == Team.Player)
            {
                if (currentZ < -0.55f)
                {
                    return left ? refs.LeftBridgePlayerSide : refs.RightBridgePlayerSide;
                }

                return left ? refs.LeftBridgeEnemySide : refs.RightBridgeEnemySide;
            }

            if (currentZ > 0.55f)
            {
                return left ? refs.LeftBridgeEnemySide : refs.RightBridgeEnemySide;
            }

            return left ? refs.LeftBridgePlayerSide : refs.RightBridgePlayerSide;
        }

        private Transform GetFarBridge(Team team, float currentZ, bool left)
        {
            if (team == Team.Player)
            {
                return left ? refs.LeftBridgeEnemySide : refs.RightBridgeEnemySide;
            }

            return left ? refs.LeftBridgePlayerSide : refs.RightBridgePlayerSide;
        }
    }
}
