using UnityEngine;

namespace MonsterClash
{
    public sealed class ArenaLayout : MonoBehaviour
    {
        [SerializeField] private float arenaHalfWidth = BattleBalance.ArenaHalfWidth;
        [SerializeField] private float arenaHalfLength = BattleBalance.ArenaHalfLength;
        [SerializeField] private float riverHalfWidth = BattleBalance.RiverHalfWidth;
        [SerializeField] private float bridgeX = BattleBalance.BridgeX;

        public float ArenaHalfWidth => arenaHalfWidth;
        public float ArenaHalfLength => arenaHalfLength;
        public float RiverHalfWidth => riverHalfWidth;
        public float BridgeX => bridgeX;

        public bool IsValidDeployment(Vector3 point, BattleTeam team)
        {
            if (Mathf.Abs(point.x) > arenaHalfWidth - 0.3f) return false;
            if (Mathf.Abs(point.z) > arenaHalfLength - 0.4f) return false;

            return team == BattleTeam.Player
                ? point.z <= -BattleBalance.DeploymentRiverMargin
                : point.z >= BattleBalance.DeploymentRiverMargin;
        }

        public Vector3 ClampDeployment(Vector3 point, BattleTeam team)
        {
            float z = team == BattleTeam.Player
                ? Mathf.Clamp(point.z, -arenaHalfLength + 0.4f, -BattleBalance.DeploymentRiverMargin)
                : Mathf.Clamp(point.z, BattleBalance.DeploymentRiverMargin, arenaHalfLength - 0.4f);

            return new Vector3(
                Mathf.Clamp(point.x, -arenaHalfWidth + 0.3f, arenaHalfWidth - 0.3f),
                0.05f,
                z);
        }

        public Vector3 NextWaypoint(Vector3 current, Vector3 destination, bool flying)
        {
            if (flying || SameSideOfRiver(current.z, destination.z))
            {
                return destination;
            }

            float chosenBridge = ChooseBridge(current, destination);
            const float waypointPadding = 0.18f;

            if (current.z < -riverHalfWidth - waypointPadding)
            {
                return new Vector3(chosenBridge, current.y, -riverHalfWidth - waypointPadding);
            }

            if (current.z > riverHalfWidth + waypointPadding)
            {
                return new Vector3(chosenBridge, current.y, riverHalfWidth + waypointPadding);
            }

            float exitZ = destination.z >= 0f
                ? riverHalfWidth + waypointPadding
                : -riverHalfWidth - waypointPadding;

            return new Vector3(chosenBridge, current.y, exitZ);
        }

        public bool IsInsideRiver(Vector3 point)
        {
            if (Mathf.Abs(point.z) > riverHalfWidth) return false;
            return Mathf.Abs(Mathf.Abs(point.x) - bridgeX) > 0.72f;
        }

        private bool SameSideOfRiver(float firstZ, float secondZ)
        {
            bool firstPlayerSide = firstZ < -riverHalfWidth;
            bool firstEnemySide = firstZ > riverHalfWidth;
            bool secondPlayerSide = secondZ < -riverHalfWidth;
            bool secondEnemySide = secondZ > riverHalfWidth;
            return (firstPlayerSide && secondPlayerSide) || (firstEnemySide && secondEnemySide);
        }

        private float ChooseBridge(Vector3 current, Vector3 destination)
        {
            float left = Mathf.Abs(current.x + bridgeX) + Mathf.Abs(destination.x + bridgeX);
            float right = Mathf.Abs(current.x - bridgeX) + Mathf.Abs(destination.x - bridgeX);
            return left <= right ? -bridgeX : bridgeX;
        }
    }
}
