using System.Globalization;
using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleInputController : MonoBehaviour
    {
        private BattleDirector director;
        private Camera battleCamera;
        private BattleHud hud;
        private bool hasWebPointerDown;
        private bool hasWebPointerUp;
        private bool draggingFromCard;
        private bool hasGuiPointer;
        private bool hasGuiPointerCandidate;
        private bool directPointerHeld;
        private bool guiCardLatched;
        private int guiLatchedCardIndex = -1;
        private Vector2 webPointerDown;
        private Vector2 webPointerUp;
        private Vector2 lastGuiPointer;
        private Vector2 guiPointerCandidate;
        private float lastDownTime = -10f;
        private float lastUpTime = -10f;
        private float lastDirectPointerTime = -10f;
        private Vector2 lastDownPosition;
        private Vector2 lastUpPosition;

        private const float GuiPointerMoveThresholdSquared = 16f;
        private const float DirectPointerGraceSeconds = 0.25f;

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
                draggingFromCard = false;
                director.CancelSelection();
                return;
            }

            if (TryGetPrimaryDown(out Vector2 downPoint))
            {
                directPointerHeld = true;
                lastDirectPointerTime = Time.realtimeSinceStartup;
                hasGuiPointerCandidate = false;
                HandlePointerDown(downPoint);
                return;
            }

            if (TryGetPrimaryUp(out Vector2 upPoint))
            {
                if (directPointerHeld)
                {
                    directPointerHeld = false;
                    lastDirectPointerTime = Time.realtimeSinceStartup;
                    hasGuiPointerCandidate = false;
                    HandlePointerUp(upPoint);
                    return;
                }
            }

            TryHandleGuiPointerFallback();
        }

        public void ObserveGuiPointer(Vector2 guiPoint)
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            if (!Input.touchSupported || Screen.height <= Screen.width) return;

            Vector2 screenPoint = new Vector2(guiPoint.x, Screen.height - guiPoint.y);
            if (!hasGuiPointer)
            {
                hasGuiPointer = true;
                lastGuiPointer = screenPoint;
                return;
            }

            if (Vector2.SqrMagnitude(screenPoint - lastGuiPointer) < GuiPointerMoveThresholdSquared) return;

            lastGuiPointer = screenPoint;
            guiPointerCandidate = screenPoint;
            hasGuiPointerCandidate = true;
#endif
        }

        [UnityEngine.Scripting.Preserve]
        public void OnWebPointerDown(string payload)
        {
            if (!TryParseWebPoint(payload, out Vector2 point)) return;
            webPointerDown = point;
            hasWebPointerDown = true;
        }

        [UnityEngine.Scripting.Preserve]
        public void OnWebPointerUp(string payload)
        {
            if (!TryParseWebPoint(payload, out Vector2 point)) return;
            webPointerUp = point;
            hasWebPointerUp = true;
        }

        private void HandlePointerDown(Vector2 screenPoint)
        {
            if (director.Phase == BattlePhase.Victory || director.Phase == BattlePhase.Defeat)
            {
                draggingFromCard = false;
                if (hud.IsPointOverRestart(screenPoint)) director.Restart();
                return;
            }

            if (director.Phase != BattlePhase.Playing) return;

            if (hud.TryGetHandIndex(screenPoint, out int handIndex))
            {
                draggingFromCard = true;
                director.SelectPlayerCard(handIndex);
                return;
            }

            draggingFromCard = false;
            if (director.SelectedHandIndex < 0 || hud.IsPointOverInterface(screenPoint)) return;
            TryDeployAt(screenPoint);
        }

        private void HandlePointerUp(Vector2 screenPoint)
        {
            if (!draggingFromCard) return;
            draggingFromCard = false;

            if (director.Phase != BattlePhase.Playing || director.SelectedHandIndex < 0) return;
            if (hud.IsPointOverInterface(screenPoint)) return;
            TryDeployAt(screenPoint);
        }

        private void TryDeployAt(Vector2 screenPoint)
        {
            Ray ray = battleCamera.ScreenPointToRay(screenPoint);
            Plane floor = new Plane(Vector3.up, Vector3.zero);
            if (!floor.Raycast(ray, out float distance)) return;
            director.TryDeploySelected(ray.GetPoint(distance));
        }

        private bool TryGetPrimaryDown(out Vector2 screenPoint)
        {
            if (hasWebPointerDown)
            {
                hasWebPointerDown = false;
                screenPoint = webPointerDown;
                return AcceptPointer(screenPoint, false);
            }

            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                screenPoint = touch.position;
                return touch.phase == TouchPhase.Began && AcceptPointer(screenPoint, false);
            }

            if (Input.GetMouseButtonDown(0))
            {
                screenPoint = Input.mousePosition;
                return AcceptPointer(screenPoint, false);
            }

            screenPoint = default;
            return false;
        }

        private bool TryGetPrimaryUp(out Vector2 screenPoint)
        {
            if (hasWebPointerUp)
            {
                hasWebPointerUp = false;
                screenPoint = webPointerUp;
                return AcceptPointer(screenPoint, true);
            }

            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                screenPoint = touch.position;
                return (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
                    && AcceptPointer(screenPoint, true);
            }

            if (Input.GetMouseButtonUp(0))
            {
                screenPoint = Input.mousePosition;
                return AcceptPointer(screenPoint, true);
            }

            screenPoint = default;
            return false;
        }

        private void TryHandleGuiPointerFallback()
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            if (!hasGuiPointerCandidate) return;

            hasGuiPointerCandidate = false;
            if (Time.realtimeSinceStartup - lastDirectPointerTime < DirectPointerGraceSeconds) return;

            Vector2 screenPoint = guiPointerCandidate;
            if (hud.TryGetHandIndex(screenPoint, out int handIndex))
            {
                if (guiCardLatched && guiLatchedCardIndex == handIndex) return;

                guiCardLatched = true;
                guiLatchedCardIndex = handIndex;
                HandlePointerDown(screenPoint);
                return;
            }

            if (hud.IsPointOverInterface(screenPoint)) return;

            guiCardLatched = false;
            guiLatchedCardIndex = -1;
            HandlePointerDown(screenPoint);
#endif
        }

        private bool AcceptPointer(Vector2 screenPoint, bool released)
        {
            float now = Time.realtimeSinceStartup;
            float lastTime = released ? lastUpTime : lastDownTime;
            Vector2 lastPosition = released ? lastUpPosition : lastDownPosition;
            bool duplicate = now - lastTime < 0.2f
                && Vector2.SqrMagnitude(screenPoint - lastPosition) < 1600f;

            if (duplicate) return false;

            if (released)
            {
                lastUpTime = now;
                lastUpPosition = screenPoint;
            }
            else
            {
                lastDownTime = now;
                lastDownPosition = screenPoint;
            }

            return true;
        }

        private static bool TryParseWebPoint(string payload, out Vector2 point)
        {
            point = default;
            if (string.IsNullOrWhiteSpace(payload)) return false;

            string[] parts = payload.Split(',');
            if (parts.Length != 2) return false;
            if (!float.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out float x)) return false;
            if (!float.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out float y)) return false;

            point = new Vector2(x, y);
            return true;
        }
    }
}
