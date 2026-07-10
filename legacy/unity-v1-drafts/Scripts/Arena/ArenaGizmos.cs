using UnityEngine;

namespace NightmarePark
{
    public class ArenaGizmos : MonoBehaviour
    {
        public ArenaConfig Config;

        private void OnDrawGizmos()
        {
            if (Config == null) return;

            DrawRect(Config.PlayerMinX, Config.PlayerMaxX, Config.PlayerMinZ, Config.PlayerMaxZ, Color.green);
            DrawRect(Config.EnemyMinX, Config.EnemyMaxX, Config.EnemyMinZ, Config.EnemyMaxZ, Color.magenta);
            DrawRect(Config.MinX, Config.MaxX, Config.MiddleMinZ, Config.MiddleMaxZ, Color.red);
        }

        private void DrawRect(float minX, float maxX, float minZ, float maxZ, Color color)
        {
            Gizmos.color = color;

            Vector3 a = new Vector3(minX, 0.05f, minZ);
            Vector3 b = new Vector3(maxX, 0.05f, minZ);
            Vector3 c = new Vector3(maxX, 0.05f, maxZ);
            Vector3 d = new Vector3(minX, 0.05f, maxZ);

            Gizmos.DrawLine(a, b);
            Gizmos.DrawLine(b, c);
            Gizmos.DrawLine(c, d);
            Gizmos.DrawLine(d, a);
        }
    }
}
