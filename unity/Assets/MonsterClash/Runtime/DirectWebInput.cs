using System.Globalization;
using UnityEngine;

namespace MonsterClash
{
    public sealed class DirectWebInput : MonoBehaviour
    {
        public const string BuildLabel = "BUILD 13 · DIRECT TAP";

        private const float PortraitDockTop = 0.235f;
        private const float PortraitTopBottom = 0.89f;
        private const float WideDockTop = 0.30f;
        private const float WideTopBottom = 0.84f;
        private const float CardHeightWithinDock = 0.75f;

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

            Rect safeArea = Screen.safeArea;
            float pixelX = normalisedX * Mathf.Max(1f, Screen.width);
            float pixelY = normalisedY * Mathf.Max(1f, Screen.height);
            float safeX = Mathf.InverseLerp(safeArea.xMin, safeArea.xMax, pixelX);
            float safeY = Mathf.InverseLerp(safeArea.yMin, safeArea.yMax, pixelY);

            bool wideLayout = safeArea.width / Mathf.Max(1f, safeArea.height) > 0.85f;
            float dockTop = wideLayout ? WideDockTop : PortraitDockTop;
            float arenaTop = wideLayout ? WideTopBottom : PortraitTopBottom;
            float cardZoneTop = dockTop * CardHeightWithinDock;

            if (safeY <= cardZoneTop)
            {
                int handIndex = Mathf.Clamp(
                    Mathf.FloorToInt(safeX * BattleBalance.HandSize),
                    0,
                    BattleBalance.HandSize - 1);

                director.SelectPlayerCard(handIndex);
                return;
            }

            if (safeY < dockTop || safeY > arenaTop)
            {
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
                safeX);

            float depth = Mathf.InverseLerp(dockTop, arenaTop, safeY);
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
