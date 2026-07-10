using System.Globalization;
using UnityEngine;

namespace MonsterClash
{
    public sealed class DirectWebInput : MonoBehaviour
    {
        public const string BuildLabel = "DIRECT TAP 1";

        private const float CardZoneMaximumY = 0.34f;
        private const float ArenaMinimumY = 0.34f;
        private const float ArenaMaximumY = 0.86f;

        private BattleDirector director;
        private bool announced;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Install()
        {
            if (FindFirstObjectByType<DirectWebInput>() != null) return;

            GameObject inputObject = new GameObject("Direct Web Input");
            DontDestroyOnLoad(inputObject);
            inputObject.AddComponent<DirectWebInput>();
        }

        private void Update()
        {
            if (director == null)
            {
                director = FindFirstObjectByType<BattleDirector>();
            }

            if (director == null || announced) return;

            announced = true;
            director.SetStatus(BuildLabel + " READY. Tap a card, then tap the arena.", 8f);
        }

        [UnityEngine.Scripting.Preserve]
        public void OnWebTap(string payload)
        {
            if (!TryParseNormalisedPoint(payload, out float normalisedX, out float normalisedY)) return;

            if (director == null)
            {
                director = FindFirstObjectByType<BattleDirector>();
            }

            if (director == null) return;

            if (director.Phase == BattlePhase.Victory || director.Phase == BattlePhase.Defeat)
            {
                director.Restart();
                return;
            }

            if (director.Phase != BattlePhase.Playing) return;

            if (normalisedY <= CardZoneMaximumY)
            {
                int handIndex = Mathf.Clamp(
                    Mathf.FloorToInt(normalisedX * BattleBalance.HandSize),
                    0,
                    BattleBalance.HandSize - 1);

                director.SelectPlayerCard(handIndex);
                return;
            }

            if (director.SelectedHandIndex < 0)
            {
                director.SetStatus(BuildLabel + " TAP RECEIVED. Pick a card first.", 2.2f);
                return;
            }

            float arenaX = Mathf.Lerp(
                -BattleBalance.ArenaHalfWidth + 0.45f,
                BattleBalance.ArenaHalfWidth - 0.45f,
                normalisedX);

            float depth = Mathf.InverseLerp(ArenaMinimumY, ArenaMaximumY, normalisedY);
            float arenaZ = Mathf.Lerp(
                -BattleBalance.ArenaHalfLength + 0.5f,
                -BattleBalance.DeploymentRiverMargin,
                depth);

            director.TryDeploySelected(new Vector3(arenaX, 0.05f, arenaZ));
        }

        private static bool TryParseNormalisedPoint(string payload, out float x, out float y)
        {
            x = 0f;
            y = 0f;
            if (string.IsNullOrWhiteSpace(payload)) return false;

            string[] parts = payload.Split(',');
            if (parts.Length != 2) return false;
            if (!float.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out x)) return false;
            if (!float.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out y)) return false;

            x = Mathf.Clamp01(x);
            y = Mathf.Clamp01(y);
            return true;
        }
    }
}
