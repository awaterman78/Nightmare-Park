using UnityEngine;

namespace NightmarePark
{
    public class PlacementValidator : MonoBehaviour
    {
        public ArenaConfig Config;

        private void Awake()
        {
            if (Config == null && ArenaReferences.Instance != null)
            {
                Config = ArenaReferences.Instance.Config;
            }
        }

        public bool IsValidPlacement(Vector3 point, Team team)
        {
            if (Config == null) return false;

            if (team == Team.Player)
            {
                return Config.IsInPlayerDeployment(point);
            }

            return Config.IsInEnemyDeployment(point);
        }
    }
}
