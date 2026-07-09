using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleInputController : MonoBehaviour
    {
        private BattleDirector director;
        private Camera battleCamera;

        public void Initialise(BattleDirector battleDirector, Camera cameraToUse)
        {
            director = battleDirector;
            battleCamera = cameraToUse;
        }

        private void Update()
        {
            if (director == null || battleCamera == null || director.Phase != BattlePhase.Playing) return;

            if (Input.GetKeyDown(KeyCode.Escape) || Input.GetMouseButtonDown(1))
            {
                director.CancelSelection();
                return;
            }

            if (director.SelectedHandIndex < 0 || !TryGetPrimaryDown(out Vector2 screenPoint)) return;
            if (IsOverHud(screenPoint)) return;

            Ray ray = battleCamera.ScreenPointToRay(screenPoint);
            Plane floor = new Plane(Vector3.up, Vector3.zero);
            if (!floor.Raycast(ray, out float distance)) return;

            director.TryDeploySelected(ray.GetPoint(distance));
        }

        private static bool TryGetPrimaryDown(out Vector2 screenPoint)
        {
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                screenPoint = touch.position;
                return touch.phase == TouchPhase.Began;
            }

            if (Input.GetMouseButtonDown(0))
            {
                screenPoint = Input.mousePosition;
                return true;
            }

            screenPoint = default;
            return false;
        }

        private static bool IsOverHud(Vector2 screenPoint)
        {
            float bottomHud = Mathf.Min(220f, Screen.height * 0.25f);
            float topHud = Mathf.Min(115f, Screen.height * 0.14f);
            return screenPoint.y < bottomHud || screenPoint.y > Screen.height - topHud;
        }
    }
}
