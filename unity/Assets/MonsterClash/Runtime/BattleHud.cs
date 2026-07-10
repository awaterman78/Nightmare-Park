using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace MonsterClash
{
    public sealed class BattleHud : MonoBehaviour
    {
        private const string NativeUiBuildLabel = "NATIVE UI 1";

        private readonly List<CardSlot> cardSlots = new List<CardSlot>();

        private BattleDirector director;
        private Camera battleCamera;
        private RectTransform topPanel;
        private RectTransform dockPanel;
        private RectTransform resultPanel;
        private Text scoreText;
        private Text statusText;
        private Text energyText;
        private Text nextText;
        private Text resultText;
        private Image energyFill;
        private Font uiFont;
        private BattlePhase lastPhase = BattlePhase.Preparing;

        public void Initialise(BattleDirector battleDirector)
        {
            director = battleDirector;
            battleCamera = Camera.main;
            uiFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            EnsureEventSystem();
            BuildInterface();
            RefreshInterface();
        }

        public void AttachInput(BattleInputController battleInputController)
        {
            if (battleInputController != null)
            {
                battleInputController.enabled = false;
            }
        }

        private void Update()
        {
            if (director == null) return;
            if (battleCamera == null) battleCamera = Camera.main;
            RefreshInterface();
        }

        public void OnCardClicked(int handIndex)
        {
            if (director == null || director.Phase != BattlePhase.Playing) return;
            director.SelectPlayerCard(handIndex);
            RefreshInterface();
        }

        public void OnCardDragStarted(int handIndex)
        {
            if (director == null || director.Phase != BattlePhase.Playing) return;
            if (director.SelectedHandIndex != handIndex)
            {
                director.SelectPlayerCard(handIndex);
            }

            RefreshInterface();
        }

        public void OnCardDragEnded(Vector2 screenPoint)
        {
            if (IsPointOverHud(screenPoint)) return;
            TryDeployAt(screenPoint);
        }

        public void OnArenaClicked(Vector2 screenPoint)
        {
            TryDeployAt(screenPoint);
        }

        private void TryDeployAt(Vector2 screenPoint)
        {
            if (director == null
                || director.Phase != BattlePhase.Playing
                || director.SelectedHandIndex < 0
                || battleCamera == null)
            {
                return;
            }

            Ray ray = battleCamera.ScreenPointToRay(screenPoint);
            Plane floor = new Plane(Vector3.up, Vector3.zero);
            if (!floor.Raycast(ray, out float distance))
            {
                director.SetStatus("Could not place there. Tap the arena again.", 1.8f);
                return;
            }

            director.TryDeploySelected(ray.GetPoint(distance));
            RefreshInterface();
        }

        private bool IsPointOverHud(Vector2 screenPoint)
        {
            return RectTransformUtility.RectangleContainsScreenPoint(topPanel, screenPoint, null)
                || RectTransformUtility.RectangleContainsScreenPoint(dockPanel, screenPoint, null)
                || (resultPanel.gameObject.activeSelf
                    && RectTransformUtility.RectangleContainsScreenPoint(resultPanel, screenPoint, null));
        }

        private void BuildInterface()
        {
            GameObject canvasObject = new GameObject(
                "Battle UI Canvas",
                typeof(RectTransform),
                typeof(Canvas),
                typeof(CanvasScaler),
                typeof(GraphicRaycaster));

            canvasObject.transform.SetParent(transform, false);

            Canvas canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 100;

            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(430f, 932f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;

            RectTransform canvasRect = canvasObject.GetComponent<RectTransform>();

            RectTransform arenaSurface = CreatePanel(
                canvasRect,
                "Arena Touch Surface",
                new Color(0f, 0f, 0f, 0.001f),
                Vector2.zero,
                Vector2.one,
                Vector2.zero,
                Vector2.zero);

            arenaSurface.gameObject.AddComponent<ArenaPointerSurface>().Initialise(this);

            topPanel = CreatePanel(
                canvasRect,
                "Top Panel",
                new Color(0.025f, 0.015f, 0.05f, 0.92f),
                new Vector2(0f, 1f),
                new Vector2(1f, 1f),
                new Vector2(8f, -104f),
                new Vector2(-8f, -8f));

            CreateText(
                topPanel,
                "Title",
                "MONSTER CLASH · " + NativeUiBuildLabel,
                24,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                new Color(0.72f, 1f, 0.84f, 1f),
                new Vector2(0.02f, 0.66f),
                new Vector2(0.98f, 0.98f));

            scoreText = CreateText(
                topPanel,
                "Score",
                string.Empty,
                16,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                Color.white,
                new Vector2(0.02f, 0.36f),
                new Vector2(0.98f, 0.68f));

            statusText = CreateText(
                topPanel,
                "Status",
                string.Empty,
                14,
                FontStyle.Normal,
                TextAnchor.MiddleCenter,
                new Color(0.78f, 0.9f, 1f, 1f),
                new Vector2(0.02f, 0.03f),
                new Vector2(0.98f, 0.38f));

            dockPanel = CreatePanel(
                canvasRect,
                "Card Dock",
                new Color(0.018f, 0.012f, 0.035f, 0.96f),
                new Vector2(0f, 0f),
                new Vector2(1f, 0f),
                new Vector2(8f, 8f),
                new Vector2(-8f, 204f));

            RectTransform energyTrack = CreatePanel(
                dockPanel,
                "Energy Track",
                new Color(0.06f, 0.05f, 0.1f, 1f),
                new Vector2(0.03f, 0.79f),
                new Vector2(0.67f, 0.95f),
                Vector2.zero,
                Vector2.zero);

            energyFill = CreateImage(
                energyTrack,
                "Energy Fill",
                new Color(0.25f, 0.95f, 0.72f, 1f),
                Vector2.zero,
                Vector2.one,
                new Vector2(2f, 2f),
                new Vector2(-2f, -2f));

            energyFill.rectTransform.pivot = new Vector2(0f, 0.5f);
            energyFill.rectTransform.anchorMax = new Vector2(0f, 1f);

            energyText = CreateText(
                energyTrack,
                "Energy Text",
                string.Empty,
                13,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                Color.white,
                Vector2.zero,
                Vector2.one);

            nextText = CreateText(
                dockPanel,
                "Next Card",
                string.Empty,
                12,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                new Color(0.78f, 0.9f, 1f, 1f),
                new Vector2(0.69f, 0.79f),
                new Vector2(0.97f, 0.95f));

            for (int i = 0; i < BattleBalance.HandSize; i++)
            {
                float minimumX = 0.03f + i * 0.245f;
                float maximumX = minimumX + 0.22f;

                RectTransform cardRect = CreatePanel(
                    dockPanel,
                    "Card " + (i + 1),
                    new Color(0.18f, 0.16f, 0.25f, 1f),
                    new Vector2(minimumX, 0.06f),
                    new Vector2(maximumX, 0.73f),
                    Vector2.zero,
                    Vector2.zero);

                Image cardImage = cardRect.GetComponent<Image>();
                Text cardText = CreateText(
                    cardRect,
                    "Label",
                    string.Empty,
                    12,
                    FontStyle.Bold,
                    TextAnchor.MiddleCenter,
                    Color.white,
                    new Vector2(0.05f, 0.05f),
                    new Vector2(0.95f, 0.95f));

                cardText.resizeTextForBestFit = true;
                cardText.resizeTextMinSize = 9;
                cardText.resizeTextMaxSize = 14;

                CardPointerHandler pointerHandler = cardRect.gameObject.AddComponent<CardPointerHandler>();
                pointerHandler.Initialise(this, i);

                cardSlots.Add(new CardSlot(cardImage, cardText));
            }

            resultPanel = CreatePanel(
                canvasRect,
                "Result Panel",
                new Color(0.01f, 0.005f, 0.018f, 0.97f),
                new Vector2(0.08f, 0.34f),
                new Vector2(0.92f, 0.68f),
                Vector2.zero,
                Vector2.zero);

            resultText = CreateText(
                resultPanel,
                "Result",
                string.Empty,
                44,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                new Color(0.72f, 1f, 0.84f, 1f),
                new Vector2(0.04f, 0.48f),
                new Vector2(0.96f, 0.94f));

            RectTransform restartRect = CreatePanel(
                resultPanel,
                "Play Again",
                new Color(0.16f, 0.48f, 0.34f, 1f),
                new Vector2(0.22f, 0.12f),
                new Vector2(0.78f, 0.38f),
                Vector2.zero,
                Vector2.zero);

            Button restartButton = restartRect.gameObject.AddComponent<Button>();
            restartButton.targetGraphic = restartRect.GetComponent<Image>();
            restartButton.onClick.AddListener(() => director.Restart());

            CreateText(
                restartRect,
                "Label",
                "PLAY AGAIN",
                18,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                Color.white,
                Vector2.zero,
                Vector2.one);

            resultPanel.gameObject.SetActive(false);
        }

        private void RefreshInterface()
        {
            int totalSeconds = Mathf.CeilToInt(director.TimeRemaining);
            string timer = (totalSeconds / 60).ToString("0") + ":" + (totalSeconds % 60).ToString("00");
            scoreText.text = "ENEMY " + FormatCore(director.EnemyCore) + "     " + timer + "     YOU " + FormatCore(director.PlayerCore);
            statusText.text = director.StatusMessage;

            float normalisedEnergy = Mathf.Clamp01(director.PlayerEnergy / director.MaximumEnergy);
            energyFill.rectTransform.anchorMax = new Vector2(normalisedEnergy, 1f);
            energyText.text = "ENERGY " + director.PlayerEnergy.ToString("0.0") + " / 10";
            nextText.text = director.NextPlayerCard == null
                ? string.Empty
                : "NEXT\n" + director.NextPlayerCard.DisplayName.ToUpperInvariant();

            IReadOnlyList<MonsterCard> hand = director.PlayerHand;
            for (int i = 0; i < cardSlots.Count; i++)
            {
                CardSlot slot = cardSlots[i];
                MonsterCard card = i < hand.Count ? hand[i] : null;

                if (card == null)
                {
                    slot.Text.text = string.Empty;
                    slot.Image.color = new Color(0.1f, 0.1f, 0.12f, 1f);
                    continue;
                }

                bool selected = director.SelectedHandIndex == i;
                bool affordable = director.PlayerEnergy + 0.001f >= card.EnergyCost;

                slot.Text.text = card.DisplayName.ToUpperInvariant() + "\n" + card.EnergyCost + " ENERGY";
                slot.Image.color = selected
                    ? new Color(0.2f, 0.72f, 0.44f, 1f)
                    : affordable
                        ? new Color(0.26f, 0.23f, 0.34f, 1f)
                        : new Color(0.13f, 0.12f, 0.16f, 1f);
                slot.Text.color = affordable || selected
                    ? Color.white
                    : new Color(0.55f, 0.55f, 0.62f, 1f);
            }

            if (lastPhase != director.Phase)
            {
                lastPhase = director.Phase;
                bool finished = director.Phase == BattlePhase.Victory || director.Phase == BattlePhase.Defeat;
                resultPanel.gameObject.SetActive(finished);

                if (finished)
                {
                    resultText.text = director.Phase == BattlePhase.Victory ? "VICTORY" : "DEFEAT";
                }
            }
        }

        private static void EnsureEventSystem()
        {
            EventSystem existing = FindFirstObjectByType<EventSystem>();
            if (existing != null)
            {
                if (existing.GetComponent<BaseInputModule>() == null)
                {
                    existing.gameObject.AddComponent<StandaloneInputModule>();
                }

                return;
            }

            GameObject eventSystemObject = new GameObject(
                "EventSystem",
                typeof(EventSystem),
                typeof(StandaloneInputModule));

            eventSystemObject.transform.SetAsLastSibling();
        }

        private RectTransform CreatePanel(
            RectTransform parent,
            string objectName,
            Color colour,
            Vector2 anchorMin,
            Vector2 anchorMax,
            Vector2 offsetMin,
            Vector2 offsetMax)
        {
            Image image = CreateImage(parent, objectName, colour, anchorMin, anchorMax, offsetMin, offsetMax);
            image.raycastTarget = true;
            return image.rectTransform;
        }

        private Image CreateImage(
            RectTransform parent,
            string objectName,
            Color colour,
            Vector2 anchorMin,
            Vector2 anchorMax,
            Vector2 offsetMin,
            Vector2 offsetMax)
        {
            GameObject imageObject = new GameObject(objectName, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            imageObject.transform.SetParent(parent, false);

            RectTransform rect = imageObject.GetComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;

            Image image = imageObject.GetComponent<Image>();
            image.color = colour;
            return image;
        }

        private Text CreateText(
            RectTransform parent,
            string objectName,
            string value,
            int fontSize,
            FontStyle fontStyle,
            TextAnchor alignment,
            Color colour,
            Vector2 anchorMin,
            Vector2 anchorMax)
        {
            GameObject textObject = new GameObject(objectName, typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            textObject.transform.SetParent(parent, false);

            RectTransform rect = textObject.GetComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            Text text = textObject.GetComponent<Text>();
            text.font = uiFont;
            text.text = value;
            text.fontSize = fontSize;
            text.fontStyle = fontStyle;
            text.alignment = alignment;
            text.color = colour;
            text.raycastTarget = false;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Truncate;
            return text;
        }

        private static string FormatCore(DefenceTower tower)
        {
            if (tower == null || tower.Health == null) return "0";
            return Mathf.CeilToInt(Mathf.Max(0f, tower.Health.Current)).ToString();
        }

        private sealed class CardSlot
        {
            public CardSlot(Image image, Text text)
            {
                Image = image;
                Text = text;
            }

            public Image Image { get; }
            public Text Text { get; }
        }
    }
}
