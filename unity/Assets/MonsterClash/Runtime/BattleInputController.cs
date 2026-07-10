using System.Globalization;
using System.Runtime.InteropServices;
using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleInputController : MonoBehaviour
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern int MonsterClashInput_Install();

        [DllImport("__Internal")]
        private static extern int MonsterClashInput_HasPointerDown();

        [DllImport("__Internal")]
        private static extern float MonsterClashInput_GetPointerDownX();

        [DllImport("__Internal")]
        private static extern float MonsterClashInput_GetPointerDownY();

        [DllImport("__Internal")]
        private static extern void MonsterClashInput_ConsumePointerDown();

        [DllImport("__Internal")]
        private static extern int MonsterClashInput_HasPointerUp();

        [DllImport("__Internal")]
        private static extern float MonsterClashInput_GetPointerUpX();

        [DllImport("__Internal")]
        private static extern float MonsterClashInput_GetPointerUpY();

        [DllImport("__Internal")]
        private static extern void MonsterClashInput_ConsumePointerUp();
#endif

        private BattleDirector director;
        private Camera battleCamera;
        private BattleHud hud;
        private bool hasWebPointerDown;
        private bool hasWebPointerUp;
        private bool compiledWebInputActive;
        private bool draggingFromCard;
        private Vector2 webPointerDown;
        private Vector2 webPointerUp;
        private float lastDownTime = -10f;
        private float lastUpTime = -10f;
        private Vector2 lastDownPosition;
        private Vector2 lastUpPosition;

        public void Initialise(BattleDirector battleDirector, Camera cameraToUse, BattleHud battleHud)
        {
            director = battleDirector;
            battleCamera = cameraToUse;
            hud = battleHud;
        }

        private void Start()
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            compiledWebInputActive = MonsterClashInput_Install() != 0;
#endif
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
                HandlePointerDown(downPoint);
                return;
            }

            if (TryGetPrimaryUp(out Vector2 upPoint))
            {
                HandlePointerUp(upPoint);
            }
        }

        [UnityEngine.Scripting.Preserve]
        public void OnWebPointerDown(string payload)
        {
            if (compiledWebInputActive) return;
            if (!TryParseWebPoint(payload, out Vector2 point)) return;
            webPointerDown = point;
            hasWebPointerDown = true;
        }

        [UnityEngine.Scripting.Preserve]
        public void OnWebPointerUp(string payload)
        {
            if (compiledWebInputActive) return;
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
#if UNITY_WEBGL && !UNITY_EDITOR
            if (compiledWebInputActive)
            {
                if (MonsterClashInput_HasPointerDown() == 0)
                {
                    screenPoint = default;
                    return false;
                }

                screenPoint = new Vector2(
                    MonsterClashInput_GetPointerDownX(),
                    MonsterClashInput_GetPointerDownY());
                MonsterClashInput_ConsumePointerDown();
                return AcceptPointer(screenPoint, false);
            }
#endif

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
#if UNITY_WEBGL && !UNITY_EDITOR
            if (compiledWebInputActive)
            {
                if (MonsterClashInput_HasPointerUp() == 0)
                {
                    screenPoint = default;
                    return false;
                }

                screenPoint = new Vector2(
                    MonsterClashInput_GetPointerUpX(),
                    MonsterClashInput_GetPointerUpY());
                MonsterClashInput_ConsumePointerUp();
                return AcceptPointer(screenPoint, true);
            }
#endif

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
