using UnityEngine;

namespace NightmarePark
{
    public class DeploymentController : MonoBehaviour
    {
        [Header("References")]
        public Camera MainCamera;
        public EnergySystem EnergySystem;
        public GameObject GraveGoblinPrefab;
        public UnitStats GraveGoblinStats;
        public Transform SpawnedUnitsParent;

        [Header("Player deployment bounds")]
        public float MinX = -4f;
        public float MaxX = 4f;
        public float MinZ = -6f;
        public float MaxZ = -0.6f;

        private bool graveGoblinSelected;

        public void SelectGraveGoblin()
        {
            graveGoblinSelected = true;
            // TODO, show subtle valid deployment overlay.
        }

        private void Update()
        {
            if (!graveGoblinSelected) return;

            if (Input.GetMouseButtonDown(0))
            {
                TryDeploy(Input.mousePosition);
            }
        }

        private void TryDeploy(Vector3 screenPosition)
        {
            if (MainCamera == null || EnergySystem == null || GraveGoblinPrefab == null || GraveGoblinStats == null)
            {
                Debug.LogWarning("DeploymentController is missing references.");
                return;
            }

            Ray ray = MainCamera.ScreenPointToRay(screenPosition);

            if (!Physics.Raycast(ray, out RaycastHit hit, 100f))
            {
                return;
            }

            Vector3 point = hit.point;

            if (!IsValidPlayerDeploymentPoint(point))
            {
                Debug.Log("Invalid placement.");
                return;
            }

            if (!EnergySystem.TrySpend(GraveGoblinStats.EnergyCost))
            {
                Debug.Log("Not enough energy.");
                return;
            }

            GameObject unit = Instantiate(GraveGoblinPrefab, point, Quaternion.identity, SpawnedUnitsParent);
            UnitController controller = unit.GetComponent<UnitController>();

            if (controller != null)
            {
                controller.Team = Team.Player;
                controller.Stats = GraveGoblinStats;
            }

            graveGoblinSelected = false;
            // TODO, hide deployment overlay.
        }

        private bool IsValidPlayerDeploymentPoint(Vector3 point)
        {
            return point.x >= MinX && point.x <= MaxX && point.z >= MinZ && point.z <= MaxZ;
        }
    }
}
