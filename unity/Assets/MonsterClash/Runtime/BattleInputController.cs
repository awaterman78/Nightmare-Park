using System.Globalization;
using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleInputController : MonoBehaviour
    {
        private BattleDirector director;
        private Camera battleCamera;
        private BattleHud hud;
        private bool hasWebPointer;
        private Vector2 webPointer;
        private float lastPointerTime = -10f;
        private Vector2 lastPointerPosition;

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
                director.CancelSelection();
                return;
            }

            if (!TryGetPrimaryDown(out Vector2 screenPoint)) return;

            if (director.Phase == BattlePhase.Victory || director.Phase == BattlePhase.Defeat)
            {
                if (hud.IsPointOverRestart(screenPoint)) director.Restart();
                return;
            }

            if (director.Phase != BattlePhase.Playing) return;

            if (hud.TryGetHandIndex(screenPoint, out int handIndex))
            {
                director.SelectPlayerCard(handIndex);
                return;
            }

            if (director.SelectedHandIndex < 0 || hud.IsPointOverInterface(screenPoint)) return;

            Ray ray = battleCamera.ScreenPointToRay(screenPoint);
            Plane floor = new Plane(Vector3.up, Vector3.zero);
            if (!floor.Raycast(ray, out float distance)) return;

            director.TryDeploySelected(ray.GetPoint(distance));
        }

        [UnityEngine.Scripting.Preserve]
        public void OnWebPointerDown(string payload)
        {
            if (string.IsNullOrWhiteSpace(payload)) return;

            string[] parts = payload.Split(',');
            if (parts.Length != 2) return;

            if (!float.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out float x)) return;
            if (!float.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out float y)) return;

            webPointer = new Vector2(x, y);
            hasWebPointer = true;
        }

        private bool TryGetPrimaryDown(out Vector2 screenPoint)
        {
            if (hasWebPointer)
            {
                hasWebPointer = false;
                screenPoint = webPointer;
                return AcceptPointer(screenPoint);
            }

            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                screenPoint = touch.position;
                return touch.phase == TouchPhase.Began && AcceptPointer(screenPoint);
            }

            if (Input.GetMouseButtonDown(0))
            {
                screenPoint = Input.mousePosition;
                return AcceptPointer(screenPoint);
            }

            screenPoint = default;
            return false;
        }

        private bool AcceptPointer(Vector2 screenPoint)
        {
            float now = Time.realtimeSinceStartup;
            bool duplicate = now - lastPointerTime < 0.2f
                && Vector2.SqrMagnitude(screenPoint - lastPointerPosition) < 1600f;

            if (duplicate) return false;

            lastPointerTime = now;
            lastPointerPosition = screenPoint;
            return true;
        }
    }
}
