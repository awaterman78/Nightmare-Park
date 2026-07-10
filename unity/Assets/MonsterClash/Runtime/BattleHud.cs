using System.Collections.Generic;
using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleHud : MonoBehaviour
    {
        private BattleDirector director;
        private BattleInputController inputController;
        private GUIStyle titleStyle;
        private GUIStyle hudStyle;
        private GUIStyle smallStyle;
        private GUIStyle cardStyle;
        private GUIStyle resultStyle;
        private Texture2D panelTexture;

        private const float OuterMargin = 8f;
        private const float DockInnerMargin = 12f;
        private const float CardGap = 6f;

        public void Initialise(BattleDirector battleDirector)
        {
            director = battleDirector;
        }

        public void AttachInput(BattleInputController battleInputController)
        {
            inputController = battleInputController;
        }

        private void OnGUI()
        {
            if (director == null) return;
            EnsureStyles();
            if (Event.current.type == EventType.Repaint)
            {
                inputController?.ObserveGuiPointer(Event.current.mousePosition);
            }

            float width = Screen.width;
            float height = Screen.height;

            DrawPanel(GetTopPanelRect(width), new Color(0.025f, 0.015f, 0.05f, 0.9f));
            GUI.Label(new Rect(18f, 12f, width - 36f, 28f), "MONSTER CLASH", titleStyle);

            int totalSeconds = Mathf.CeilToInt(director.TimeRemaining);
            string timer = (totalSeconds / 60).ToString("0") + ":" + (totalSeconds % 60).ToString("00");
            string enemyCore = FormatCore(director.EnemyCore);
            string playerCore = FormatCore(director.PlayerCore);
            GUI.Label(new Rect(18f, 42f, width - 36f, 24f), "ENEMY " + enemyCore + "     " + timer + "     YOU " + playerCore, hudStyle);
            GUI.Label(new Rect(18f, 68f, width - 36f, 22f), director.StatusMessage, smallStyle);

            Rect dock = GetDockRect(width, height);
            DrawPanel(dock, new Color(0.018f, 0.012f, 0.035f, 0.94f));
            DrawEnergy(new Rect(dock.x + DockInnerMargin, dock.y + 10f, dock.width - DockInnerMargin * 2f, 24f));

            IReadOnlyList<MonsterCard> hand = director.PlayerHand;

            for (int i = 0; i < hand.Count; i++)
            {
                MonsterCard card = hand[i];
                Rect rect = GetCardRect(dock, i);
                bool selected = director.SelectedHandIndex == i;
                bool affordable = director.PlayerEnergy + 0.001f >= card.EnergyCost;
                GUI.color = selected
                    ? new Color(0.45f, 1f, 0.65f, 1f)
                    : affordable ? Color.white : new Color(0.48f, 0.48f, 0.55f, 1f);

                string label = card.DisplayName.ToUpperInvariant() + "\n" + card.EnergyCost + " ENERGY";
                GUI.Box(rect, label, cardStyle);
            }

            GUI.color = Color.white;

            if (director.Phase == BattlePhase.Victory || director.Phase == BattlePhase.Defeat)
            {
                DrawResult(width, height);
            }
        }

        public bool TryGetHandIndex(Vector2 screenPoint, out int handIndex)
        {
            handIndex = -1;
            if (director == null || director.PlayerHand == null) return false;

            Vector2 guiPoint = ScreenToGuiPoint(screenPoint);
            Rect dock = GetDockRect(Screen.width, Screen.height);
            int count = Mathf.Min(BattleBalance.HandSize, director.PlayerHand.Count);

            for (int i = 0; i < count; i++)
            {
                if (!GetCardRect(dock, i).Contains(guiPoint)) continue;
                handIndex = i;
                return true;
            }

            return false;
        }

        public bool IsPointOverInterface(Vector2 screenPoint)
        {
            Vector2 guiPoint = ScreenToGuiPoint(screenPoint);
            return GetTopPanelRect(Screen.width).Contains(guiPoint)
                || GetDockRect(Screen.width, Screen.height).Contains(guiPoint);
        }

        public bool IsPointOverRestart(Vector2 screenPoint)
        {
            if (director == null || (director.Phase != BattlePhase.Victory && director.Phase != BattlePhase.Defeat))
            {
                return false;
            }

            return GetRestartRect(Screen.width, Screen.height).Contains(ScreenToGuiPoint(screenPoint));
        }

        private void DrawEnergy(Rect rect)
        {
            GUI.color = new Color(0.06f, 0.05f, 0.1f, 1f);
            GUI.DrawTexture(rect, Texture2D.whiteTexture);

            float normalised = Mathf.Clamp01(director.PlayerEnergy / director.MaximumEnergy);
            GUI.color = new Color(0.25f, 0.95f, 0.72f, 1f);
            GUI.DrawTexture(new Rect(rect.x + 2f, rect.y + 2f, (rect.width - 4f) * normalised, rect.height - 4f), Texture2D.whiteTexture);
            GUI.color = Color.white;

            string next = director.NextPlayerCard == null ? string.Empty : "     NEXT  " + director.NextPlayerCard.DisplayName.ToUpperInvariant();
            GUI.Label(rect, "ENERGY  " + director.PlayerEnergy.ToString("0.0") + " / 10" + next, hudStyle);
        }

        private void DrawResult(float width, float height)
        {
            DrawPanel(new Rect(0f, height * 0.32f, width, height * 0.34f), new Color(0.01f, 0.005f, 0.018f, 0.94f));
            string result = director.Phase == BattlePhase.Victory ? "VICTORY" : "DEFEAT";
            GUI.Label(new Rect(0f, height * 0.37f, width, 74f), result, resultStyle);
            GUI.Label(new Rect(20f, height * 0.47f, width - 40f, 34f), director.StatusMessage, hudStyle);
            GUI.Box(GetRestartRect(width, height), "PLAY AGAIN", cardStyle);
        }

        private static Rect GetTopPanelRect(float width)
        {
            return new Rect(OuterMargin, OuterMargin, Mathf.Max(1f, width - OuterMargin * 2f), 92f);
        }

        private static Rect GetDockRect(float width, float height)
        {
            float dockHeight = Mathf.Clamp(height * 0.205f, 150f, 196f);
            return new Rect(
                OuterMargin,
                height - dockHeight - OuterMargin,
                Mathf.Max(1f, width - OuterMargin * 2f),
                dockHeight);
        }

        private static Rect GetCardRect(Rect dock, int handIndex)
        {
            float cardsTop = dock.y + 42f;
            float cardHeight = dock.height - 52f;
            float cardWidth = Mathf.Max(
                1f,
                (dock.width - DockInnerMargin * 2f - CardGap * (BattleBalance.HandSize - 1)) / BattleBalance.HandSize);

            return new Rect(
                dock.x + DockInnerMargin + handIndex * (cardWidth + CardGap),
                cardsTop,
                cardWidth,
                cardHeight);
        }

        private static Rect GetRestartRect(float width, float height)
        {
            return new Rect(width * 0.5f - 90f, height * 0.55f, 180f, 52f);
        }

        private static Vector2 ScreenToGuiPoint(Vector2 screenPoint)
        {
            return new Vector2(screenPoint.x, Screen.height - screenPoint.y);
        }

        private void DrawPanel(Rect rect, Color colour)
        {
            GUI.color = colour;
            GUI.DrawTexture(rect, panelTexture);
            GUI.color = Color.white;
        }

        private static string FormatCore(DefenceTower tower)
        {
            if (tower == null || tower.Health == null) return "0";
            return Mathf.CeilToInt(Mathf.Max(0f, tower.Health.Current)).ToString();
        }

        private void EnsureStyles()
        {
            if (titleStyle != null) return;

            panelTexture = Texture2D.whiteTexture;
            int baseSize = Mathf.Clamp(Screen.height / 58, 12, 19);

            titleStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = FontStyle.Bold,
                fontSize = Mathf.Clamp(Screen.height / 35, 20, 31)
            };
            titleStyle.normal.textColor = new Color(0.72f, 1f, 0.84f, 1f);

            hudStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = FontStyle.Bold,
                fontSize = baseSize
            };
            hudStyle.normal.textColor = Color.white;

            smallStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Max(11, baseSize - 1),
                clipping = TextClipping.Clip
            };
            smallStyle.normal.textColor = new Color(0.78f, 0.9f, 1f, 1f);

            cardStyle = new GUIStyle(GUI.skin.button)
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = FontStyle.Bold,
                fontSize = Mathf.Max(10, baseSize - 1),
                wordWrap = true
            };

            resultStyle = new GUIStyle(titleStyle)
            {
                fontSize = Mathf.Clamp(Screen.height / 8, 48, 92)
            };
        }
    }
}
