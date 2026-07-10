using System.Collections.Generic;
using System.Globalization;
using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleInputController : MonoBehaviour
    {
        private enum WebPointerPhase
        {
            Down,
            Move,
            Up,
            Cancel
        }

        private readonly struct WebPointerSample
        {
            public WebPointerSample(WebPointerPhase phase, Vector2 screenPoint)
            {
                Phase = phase;
                ScreenPoint = screenPoint;
            }

            public WebPointerPhase Phase { get; }
            public Vector2 ScreenPoint { get; }
        }

        private const int MaximumQueuedWebEvents = 64;

        private readonly Queue<WebPointerSample> webPointerEvents = new Queue<WebPointerSample>();

        private BattleDirector director;
        private Camera battleCamera;
        private BattleHud hud;
        private bool draggingFromCard;
        private bool pressedCardWasAlreadySelected;
        private int pressedCardIndex = -1;
        private bool nativePointerHeld;

        public void Initialise(BattleDirector battleDirector, Camera cameraToUse, BattleHud battleHud)
        {
            director = battleDirector;
            battleCamera = cameraToUse;
            hud = battleHud;
        }

        private void Update()
        {
            if (director == null || battleCamera == null || hud == null) return;

            if (Input.GetKeyDown(KeyCode.Escape) || Input.GetMouseButtonDown(1))
            {
                ResetPointerState();
                director.CancelSelection();
                return;
            }

#if UNITY_WEBGL && !UNITY_EDITOR
            while (webPointerEvents.Count > 0)
            {
                WebPointerSample sample = webPointerEvents.Dequeue();
                HandlePointer(sample.Phase, sample.ScreenPoint);
            }
#else
            HandleNativeInput();
#endif
        }

        [UnityEngine.Scripting.Preserve]
        public void OnWebPointerEvent(string payload)
        {
            if (!TryParseWebPointer(payload, out WebPointerSample sample)) return;

            if (webPointerEvents.Count >= MaximumQueuedWebEvents)
            {
                webPointerEvents.Dequeue();
            }

            webPointerEvents.Enqueue(sample);
        }

        // Kept as a harmless compatibility hook for older scenes. Browser input no longer uses GUI hover state.
        public void ObserveGuiPointer(Vector2 guiPoint)
        {
        }

        private void HandleNativeInput()
        {
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                switch (touch.phase)
                {
                    case TouchPhase.Began:
                        nativePointerHeld = true;
                        HandlePointer(WebPointerPhase.Down, touch.position);
                        break;
                    case TouchPhase.Moved:
                    case TouchPhase.Stationary:
                        if (nativePointerHeld) HandlePointer(WebPointerPhase.Move, touch.position);
                        break;
                    case TouchPhase.Ended:
                        if (nativePointerHeld) HandlePointer(WebPointerPhase.Up, touch.position);
                        nativePointerHeld = false;
                        break;
                    case TouchPhase.Canceled:
                        HandlePointer(WebPointerPhase.Cancel, touch.position);
                        nativePointerHeld = false;
                        break;
                }

                return;
            }

            if (Input.GetMouseButtonDown(0))
            {
                nativePointerHeld = true;
                HandlePointer(WebPointerPhase.Down, Input.mousePosition);
            }
            else if (nativePointerHeld && Input.GetMouseButton(0))
            {
                HandlePointer(WebPointerPhase.Move, Input.mousePosition);
            }
            else if (nativePointerHeld && Input.GetMouseButtonUp(0))
            {
                HandlePointer(WebPointerPhase.Up, Input.mousePosition);
                nativePointerHeld = false;
            }
        }

        private void HandlePointer(WebPointerPhase phase, Vector2 screenPoint)
        {
            switch (phase)
            {
                case WebPointerPhase.Down:
                    HandlePointerDown(screenPoint);
                    break;
                case WebPointerPhase.Move:
                    break;
                case WebPointerPhase.Up:
                    HandlePointerUp(screenPoint);
                    break;
                case WebPointerPhase.Cancel:
                    ResetPointerState();
                    break;
            }
        }

        private void HandlePointerDown(Vector2 screenPoint)
        {
            if (director.Phase == BattlePhase.Victory || director.Phase == BattlePhase.Defeat)
            {
                ResetPointerState();
                if (hud.IsPointOverRestart(screenPoint)) director.Restart();
                return;
            }

            if (director.Phase != BattlePhase.Playing) return;

            if (hud.TryGetHandIndex(screenPoint, out int handIndex))
            {
                draggingFromCard = true;
                pressedCardIndex = handIndex;
                pressedCardWasAlreadySelected = director.SelectedHandIndex == handIndex;

                if (!pressedCardWasAlreadySelected)
                {
                    director.SelectPlayerCard(handIndex);
                }

                return;
            }

            ResetPointerState();
            if (director.SelectedHandIndex < 0 || hud.IsPointOverInterface(screenPoint)) return;
            TryDeployAt(screenPoint);
        }

        private void HandlePointerUp(Vector2 screenPoint)
        {
            if (!draggingFromCard)
            {
                if (director.Phase == BattlePhase.Playing
                    && director.SelectedHandIndex >= 0
                    && !hud.IsPointOverInterface(screenPoint))
                {
                    TryDeployAt(screenPoint);
                }

                ResetPointerState();
                return;
            }

            bool releasedOverSameCard = hud.TryGetHandIndex(screenPoint, out int handIndex)
                && handIndex == pressedCardIndex;

            if (releasedOverSameCard)
            {
                if (pressedCardWasAlreadySelected)
                {
                    director.CancelSelection();
                }

                ResetPointerState();
                return;
            }

            if (director.Phase == BattlePhase.Playing
                && director.SelectedHandIndex >= 0
                && !hud.IsPointOverInterface(screenPoint))
            {
                TryDeployAt(screenPoint);
            }

            ResetPointerState();
        }

        private void TryDeployAt(Vector2 screenPoint)
        {
            Rect pixelRect = battleCamera.pixelRect;
            screenPoint.x = Mathf.Clamp(screenPoint.x, pixelRect.xMin, pixelRect.xMax);
            screenPoint.y = Mathf.Clamp(screenPoint.y, pixelRect.yMin, pixelRect.yMax);

            Ray ray = battleCamera.ScreenPointToRay(screenPoint);
            Plane floor = new Plane(Vector3.up, Vector3.zero);
            if (!floor.Raycast(ray, out float distance)) return;

            director.TryDeploySelected(ray.GetPoint(distance));
        }

        private void ResetPointerState()
        {
            draggingFromCard = false;
            pressedCardWasAlreadySelected = false;
            pressedCardIndex = -1;
        }

        private static bool TryParseWebPointer(string payload, out WebPointerSample sample)
        {
            sample = default;
            if (string.IsNullOrWhiteSpace(payload)) return false;

            string[] parts = payload.Split(',');
            if (parts.Length != 3) return false;
            if (!TryParsePhase(parts[0], out WebPointerPhase phase)) return false;
            if (!float.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out float normalisedX)) return false;
            if (!float.TryParse(parts[2], NumberStyles.Float, CultureInfo.InvariantCulture, out float normalisedY)) return false;

            float width = Mathf.Max(1f, Screen.width - 1f);
            float height = Mathf.Max(1f, Screen.height - 1f);
            Vector2 screenPoint = new Vector2(
                Mathf.Clamp01(normalisedX) * width,
                Mathf.Clamp01(normalisedY) * height);

            sample = new WebPointerSample(phase, screenPoint);
            return true;
        }

        private static bool TryParsePhase(string value, out WebPointerPhase phase)
        {
            switch (value)
            {
                case "down":
                    phase = WebPointerPhase.Down;
                    return true;
                case "move":
                    phase = WebPointerPhase.Move;
                    return true;
                case "up":
                    phase = WebPointerPhase.Up;
                    return true;
                case "cancel":
                    phase = WebPointerPhase.Cancel;
                    return true;
                default:
                    phase = default;
                    return false;
            }
        }
    }
}
