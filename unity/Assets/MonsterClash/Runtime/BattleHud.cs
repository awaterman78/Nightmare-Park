using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace MonsterClash
{
    public sealed class BattleHud : MonoBehaviour
    {
        private const string LayoutBuildLabel = "BUILD 13";
        private const float PortraitDockTop = 0.235f;
        private const float PortraitTopBottom = 0.89f;
        private const float WideDockTop = 0.30f;
        private const float WideTopBottom = 0.84f;

        private readonly List<CardSlot> cardSlots = new List<CardSlot>();

        private BattleDirector director;
        private Camera battleCamera;
        private CanvasScaler canvasScaler;
        private RectTransform safeRoot;
        private RectTransform topPanel;
        private RectTransform dockPanel;
        private RectTransform resultPanel;
        private Text enemyText;
        private Text timerText;
        private Text playerText;
        private Text statusText;
        private Text energyText;
        private Text nextText;
        private Text resultText;
        private Image energyFill;
        private Font uiFont;
        private BattlePhase lastPhase = BattlePhase.Preparing;
        private Rect lastSafeArea;
        private int lastScreenWidth;
        private int lastScreenHeight;

        public void Initialise(BattleDirector battleDirector)
        {
            director = battleDirector;
            battleCamera = Camera.main;
            uiFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            EnsureEventSystem();
            BuildInterface();
            ApplyResponsiveLayout(true);
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

            ApplyResponsiveLayout(false);
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

            canvasScaler = canvasObject.GetComponent<CanvasScaler>();
            canvasScaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasScaler.referenceResolution = new Vector2(430f, 932f);
            canvasScaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            canvasScaler.matchWidthOrHeight = 0f;

            RectTransform canvasRect = canvasObject.GetComponent<RectTransform>();

            Image safeRootImage = CreateImage(
                canvasRect,
                "Safe Area",
                new Color(0f, 0f, 0f, 0f),
                Vector2.zero,
                Vector2.one,
                Vector2.zero,
                Vector2.zero);
            safeRootImage.raycastTarget = false;
            safeRoot = safeRootImage.rectTransform;

            RectTransform arenaSurface = CreatePanel(
                safeRoot,
                "Arena Touch Surface",
                new Color(0f, 0f, 0f, 0.001f),
                Vector2.zero,
                Vector2.one,
                Vector2.zero,
                Vector2.zero);
            arenaSurface.gameObject.AddComponent<ArenaPointerSurface>().Initialise(this);

            topPanel = CreatePanel(
                safeRoot,
                "Top HUD",
                new Color(0.018f, 0.012f, 0.036f, 0.97f),
                new Vector2(0f, PortraitTopBottom),
                Vector2.one,
                new Vector2(6f, 4f),
                new Vector2(-6f, -4f));

            Image topAccent = CreateImage(
                topPanel,
                "Top Accent",
                new Color(0.28f, 0.95f, 0.66f, 1f),
                new Vector2(0f, 0.965f),
                Vector2.one,
                Vector2.zero,
                Vector2.zero);
            topAccent.raycastTarget = false;

            Text brandText = CreateText(
                topPanel,
                "Brand",
                "MONSTER CLASH",
                17,
                FontStyle.Bold,
                TextAnchor.MiddleLeft,
                new Color(0.78f, 1f, 0.87f, 1f),
                new Vector2(0.035f, 0.66f),
                new Vector2(0.58f, 0.96f));
            ConfigureBestFit(brandText, 11, 20);

            Text buildText = CreateText(
                topPanel,
                "Build",
                LayoutBuildLabel,
                10,
                FontStyle.Bold,
                TextAnchor.MiddleRight,
                new Color(0.46f, 0.72f, 0.64f, 1f),
                new Vector2(0.58f, 0.68f),
                new Vector2(0.965f, 0.94f));
            ConfigureBestFit(buildText, 8, 12);

            enemyText = CreateText(
                topPanel,
                "Enemy Core",
                string.Empty,
                13,
                FontStyle.Bold,
                TextAnchor.MiddleLeft,
                new Color(0.94f, 0.58f, 1f, 1f),
                new Vector2(0.035f, 0.31f),
                new Vector2(0.34f, 0.68f));
            ConfigureBestFit(enemyText, 9, 15);

            timerText = CreateText(
                topPanel,
                "Timer",
                string.Empty,
                18,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                Color.white,
                new Vector2(0.34f, 0.31f),
                new Vector2(0.66f, 0.68f));
            ConfigureBestFit(timerText, 12, 20);

            playerText = CreateText(
                topPanel,
                "Player Core",
                string.Empty,
                13,
                FontStyle.Bold,
                TextAnchor.MiddleRight,
                new Color(0.34f, 1f, 0.68f, 1f),
                new Vector2(0.66f, 0.31f),
                new Vector2(0.965f, 0.68f));
            ConfigureBestFit(playerText, 9, 15);

            Image statusBand = CreateImage(
                topPanel,
                "Status Band",
                new Color(0.055f, 0.045f, 0.09f, 0.96f),
                new Vector2(0.025f, 0.045f),
                new Vector2(0.975f, 0.31f),
                Vector2.zero,
                Vector2.zero);
            statusBand.raycastTarget = false;

            statusText = CreateText(
                statusBand.rectTransform,
                "Status",
                string.Empty,
                11,
                FontStyle.Normal,
                TextAnchor.MiddleCenter,
                new Color(0.82f, 0.91f, 1f, 1f),
                new Vector2(0.02f, 0.05f),
                new Vector2(0.98f, 0.95f));
            ConfigureBestFit(statusText, 8, 13);

            dockPanel = CreatePanel(
                safeRoot,
                "Card Dock",
                new Color(0.012f, 0.008f, 0.026f, 0.985f),
                Vector2.zero,
                new Vector2(1f, PortraitDockTop),
                new Vector2(6f, 4f),
                new Vector2(-6f, -3f));

            Image dockAccent = CreateImage(
                dockPanel,
                "Dock Accent",
                new Color(0.28f, 0.95f, 0.66f, 0.85f),
                new Vector2(0f, 0.975f),
                Vector2.one,
                Vector2.zero,
                Vector2.zero);
            dockAccent.raycastTarget = false;

            RectTransform energyTrack = CreatePanel(
                dockPanel,
                "Energy Track",
                new Color(0.045f, 0.036f, 0.075f, 1f),
                new Vector2(0.025f, 0.79f),
                new Vector2(0.74f, 0.95f),
                Vector2.zero,
                Vector2.zero);

            energyFill = CreateImage(
                energyTrack,
                "Energy Fill",
                new Color(0.26f, 0.96f, 0.67f, 1f),
                Vector2.zero,
                Vector2.one,
                new Vector2(2f, 2f),
                new Vector2(-2f, -2f));
            energyFill.rectTransform.pivot = new Vector2(0f, 0.5f);
            energyFill.rectTransform.anchorMax = new Vector2(0f, 1f);
            energyFill.raycastTarget = false;

            for (int i = 1; i < 10; i++)
            {
                float x = i / 10f;
                Image tick = CreateImage(
                    energyTrack,
                    "Energy Tick " + i,
                    new Color(0.02f, 0.02f, 0.035f, 0.35f),
                    new Vector2(x - 0.002f, 0.08f),
                    new Vector2(x + 0.002f, 0.92f),
                    Vector2.zero,
                    Vector2.zero);
                tick.raycastTarget = false;
            }

            energyText = CreateText(
                energyTrack,
                "Energy Text",
                string.Empty,
                12,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                Color.white,
                Vector2.zero,
                Vector2.one);
            ConfigureBestFit(energyText, 9, 14);

            Image nextPanel = CreateImage(
                dockPanel,
                "Next Panel",
                new Color(0.06f, 0.05f, 0.10f, 1f),
                new Vector2(0.76f, 0.79f),
                new Vector2(0.975f, 0.95f),
                Vector2.zero,
                Vector2.zero);
            nextPanel.raycastTarget = false;

            nextText = CreateText(
                nextPanel.rectTransform,
                "Next Card",
                string.Empty,
                10,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                new Color(0.78f, 0.9f, 1f, 1f),
                new Vector2(0.04f, 0.05f),
                new Vector2(0.96f, 0.95f));
            ConfigureBestFit(nextText, 7, 11);

            for (int i = 0; i < BattleBalance.HandSize; i++)
            {
                float minimumX = 0.015f + i * 0.2475f;
                float maximumX = minimumX + 0.2325f;

                RectTransform cardRect = CreatePanel(
                    dockPanel,
                    "Card " + (i + 1),
                    new Color(0.13f, 0.11f, 0.19f, 1f),
                    new Vector2(minimumX, 0.055f),
                    new Vector2(maximumX, 0.73f),
                    Vector2.zero,
                    Vector2.zero);

                Image cardImage = cardRect.GetComponent<Image>();
                Outline outline = cardRect.gameObject.AddComponent<Outline>();
                outline.effectDistance = new Vector2(1.5f, -1.5f);
                outline.effectColor = new Color(0.14f, 0.12f, 0.22f, 1f);

                Image portrait = CreateImage(
                    cardRect,
                    "Portrait",
                    new Color(0.16f, 0.14f, 0.23f, 1f),
                    new Vector2(0.055f, 0.31f),
                    new Vector2(0.945f, 0.83f),
                    Vector2.zero,
                    Vector2.zero);
                portrait.raycastTarget = false;
                portrait.preserveAspect = true;

                Image accentBar = CreateImage(
                    cardRect,
                    "Accent",
                    new Color(0.3f, 0.9f, 0.65f, 1f),
                    new Vector2(0f, 0.965f),
                    Vector2.one,
                    Vector2.zero,
                    Vector2.zero);
                accentBar.raycastTarget = false;

                Image costBadge = CreateImage(
                    cardRect,
                    "Cost Badge",
                    new Color(0.035f, 0.025f, 0.07f, 0.98f),
                    new Vector2(0.045f, 0.72f),
                    new Vector2(0.31f, 0.955f),
                    Vector2.zero,
                    Vector2.zero);
                costBadge.raycastTarget = false;

                Text costText = CreateText(
                    costBadge.rectTransform,
                    "Cost",
                    string.Empty,
                    15,
                    FontStyle.Bold,
                    TextAnchor.MiddleCenter,
                    Color.white,
                    Vector2.zero,
                    Vector2.one);
                ConfigureBestFit(costText, 10, 18);

                Text cardName = CreateText(
                    cardRect,
                    "Name",
                    string.Empty,
                    11,
                    FontStyle.Bold,
                    TextAnchor.MiddleCenter,
                    Color.white,
                    new Vector2(0.055f, 0.045f),
                    new Vector2(0.945f, 0.30f));
                ConfigureBestFit(cardName, 8, 13);

                Text placeholder = CreateText(
                    portrait.rectTransform,
                    "Portrait Initial",
                    string.Empty,
                    24,
                    FontStyle.Bold,
                    TextAnchor.MiddleCenter,
                    new Color(1f, 1f, 1f, 0.82f),
                    Vector2.zero,
                    Vector2.one);
                ConfigureBestFit(placeholder, 14, 30);

                CardPointerHandler pointerHandler = cardRect.gameObject.AddComponent<CardPointerHandler>();
                pointerHandler.Initialise(this, i);

                cardSlots.Add(new CardSlot(
                    cardRect,
                    cardImage,
                    portrait,
                    accentBar,
                    outline,
                    cardName,
                    costText,
                    placeholder));
            }

            resultPanel = CreatePanel(
                safeRoot,
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
                42,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                new Color(0.72f, 1f, 0.84f, 1f),
                new Vector2(0.04f, 0.48f),
                new Vector2(0.96f, 0.94f));
            ConfigureBestFit(resultText, 24, 48);

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

            Text restartText = CreateText(
                restartRect,
                "Label",
                "PLAY AGAIN",
                17,
                FontStyle.Bold,
                TextAnchor.MiddleCenter,
                Color.white,
                Vector2.zero,
                Vector2.one);
            ConfigureBestFit(restartText, 11, 20);

            resultPanel.gameObject.SetActive(false);
        }

        private void ApplyResponsiveLayout(bool force)
        {
            Rect safeArea = Screen.safeArea;
            if (!force
                && lastScreenWidth == Screen.width
                && lastScreenHeight == Screen.height
                && lastSafeArea == safeArea)
            {
                return;
            }

            lastScreenWidth = Screen.width;
            lastScreenHeight = Screen.height;
            lastSafeArea = safeArea;

            float width = Mathf.Max(1f, Screen.width);
            float height = Mathf.Max(1f, Screen.height);
            safeRoot.anchorMin = new Vector2(safeArea.xMin / width, safeArea.yMin / height);
            safeRoot.anchorMax = new Vector2(safeArea.xMax / width, safeArea.yMax / height);
            safeRoot.offsetMin = Vector2.zero;
            safeRoot.offsetMax = Vector2.zero;

            bool wideLayout = safeArea.width / Mathf.Max(1f, safeArea.height) > 0.85f;
            float dockTop = wideLayout ? WideDockTop : PortraitDockTop;
            float topBottom = wideLayout ? WideTopBottom : PortraitTopBottom;

            dockPanel.anchorMin = Vector2.zero;
            dockPanel.anchorMax = new Vector2(1f, dockTop);
            dockPanel.offsetMin = new Vector2(6f, 4f);
            dockPanel.offsetMax = new Vector2(-6f, -3f);

            topPanel.anchorMin = new Vector2(0f, topBottom);
            topPanel.anchorMax = Vector2.one;
            topPanel.offsetMin = new Vector2(6f, 3f);
            topPanel.offsetMax = new Vector2(-6f, -4f);

            canvasScaler.matchWidthOrHeight = 0f;

            PortraitCameraFit cameraFit = FindFirstObjectByType<PortraitCameraFit>();
            if (cameraFit != null)
            {
                cameraFit.SetHudViewport(dockTop, topBottom);
            }
        }

        private void RefreshInterface()
        {
            int totalSeconds = Mathf.CeilToInt(director.TimeRemaining);
            timerText.text = (totalSeconds / 60).ToString("0") + ":" + (totalSeconds % 60).ToString("00");
            enemyText.text = "ENEMY  " + FormatCore(director.EnemyCore);
            playerText.text = "YOU  " + FormatCore(director.PlayerCore);
            statusText.text = director.StatusMessage;

            float normalisedEnergy = Mathf.Clamp01(director.PlayerEnergy / director.MaximumEnergy);
            energyFill.rectTransform.anchorMax = new Vector2(normalisedEnergy, 1f);
            energyText.text = "ENERGY  " + director.PlayerEnergy.ToString("0.0") + " / 10";
            nextText.text = director.NextPlayerCard == null
                ? string.Empty
                : "NEXT  " + director.NextPlayerCard.DisplayName.ToUpperInvariant();

            IReadOnlyList<MonsterCard> hand = director.PlayerHand;
            for (int i = 0; i < cardSlots.Count; i++)
            {
                CardSlot slot = cardSlots[i];
                MonsterCard card = i < hand.Count ? hand[i] : null;

                if (card == null)
                {
                    slot.NameText.text = string.Empty;
                    slot.CostText.text = string.Empty;
                    slot.InitialText.text = string.Empty;
                    slot.Background.color = new Color(0.08f, 0.07f, 0.1f, 1f);
                    slot.Portrait.color = new Color(0.08f, 0.07f, 0.1f, 1f);
                    continue;
                }

                bool selected = director.SelectedHandIndex == i;
                bool affordable = director.PlayerEnergy + 0.001f >= card.EnergyCost;
                Color accent = card.AccentColour;

                slot.NameText.text = card.DisplayName.ToUpperInvariant();
                slot.CostText.text = card.EnergyCost.ToString();
                slot.InitialText.text = string.IsNullOrEmpty(card.DisplayName)
                    ? "?"
                    : card.DisplayName.Substring(0, 1).ToUpperInvariant();

                slot.Portrait.sprite = card.CardPortrait;
                slot.Portrait.color = card.CardPortrait != null
                    ? Color.white
                    : Color.Lerp(new Color(0.09f, 0.075f, 0.14f, 1f), accent, affordable ? 0.52f : 0.20f);
                slot.AccentBar.color = affordable || selected
                    ? accent
                    : Color.Lerp(accent, new Color(0.12f, 0.11f, 0.15f, 1f), 0.66f);
                slot.Background.color = selected
                    ? Color.Lerp(new Color(0.11f, 0.09f, 0.17f, 1f), accent, 0.34f)
                    : affordable
                        ? new Color(0.15f, 0.13f, 0.22f, 1f)
                        : new Color(0.085f, 0.075f, 0.11f, 1f);
                slot.Outline.effectColor = selected
                    ? accent
                    : new Color(0.17f, 0.14f, 0.25f, 1f);
                slot.Rect.localScale = selected ? Vector3.one * 1.018f : Vector3.one;
                slot.NameText.color = affordable || selected
                    ? Color.white
                    : new Color(0.55f, 0.55f, 0.62f, 1f);
                slot.CostText.color = affordable || selected
                    ? Color.white
                    : new Color(0.56f, 0.56f, 0.64f, 1f);
                slot.InitialText.color = affordable || selected
                    ? new Color(1f, 1f, 1f, 0.86f)
                    : new Color(0.55f, 0.55f, 0.62f, 0.72f);
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

        private static void ConfigureBestFit(Text text, int minimumSize, int maximumSize)
        {
            text.resizeTextForBestFit = true;
            text.resizeTextMinSize = minimumSize;
            text.resizeTextMaxSize = maximumSize;
        }

        private static string FormatCore(DefenceTower tower)
        {
            if (tower == null || tower.Health == null) return "0";
            return Mathf.CeilToInt(Mathf.Max(0f, tower.Health.Current)).ToString();
        }

        private sealed class CardSlot
        {
            public CardSlot(
                RectTransform rect,
                Image background,
                Image portrait,
                Image accentBar,
                Outline outline,
                Text nameText,
                Text costText,
                Text initialText)
            {
                Rect = rect;
                Background = background;
                Portrait = portrait;
                AccentBar = accentBar;
                Outline = outline;
                NameText = nameText;
                CostText = costText;
                InitialText = initialText;
            }

            public RectTransform Rect { get; }
            public Image Background { get; }
            public Image Portrait { get; }
            public Image AccentBar { get; }
            public Outline Outline { get; }
            public Text NameText { get; }
            public Text CostText { get; }
            public Text InitialText { get; }
        }
    }
}
