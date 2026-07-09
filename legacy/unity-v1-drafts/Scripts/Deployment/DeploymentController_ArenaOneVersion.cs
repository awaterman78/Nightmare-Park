using UnityEngine;

namespace NightmarePark
{
    public class DeploymentController_ArenaOneVersion : MonoBehaviour
    {
        [Header("References")]
        public Camera MainCamera;
        public EnergySystem EnergySystem;
        public PlacementValidator PlacementValidator;
        public DeploymentAreaVisual DeploymentAreaVisual;

        [Header("Grave Goblin")]
        public GameObject GraveGoblinPrefab;
        public UnitStats GraveGoblinStats;

        [Header("Runtime")]
        public Transform SpawnedUnitsParent;

        private bool graveGoblinSelected;

        public void SelectGraveGoblin()
        {
            graveGoblinSelected = true;

            if (DeploymentAreaVisual != null)
            {
                DeploymentAreaVisual.ShowPlayerDeployment(true);
            }
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
                Debug.LogWarning("Deployment controller missing references.");
                return;
            }

            Ray ray = MainCamera.ScreenPointToRay(screenPosition);

            if (!Physics.Raycast(ray, out RaycastHit hit, 100f))
            {
                return;
            }

            Vector3 point = hit.point;

            if (PlacementValidator != null && !PlacementValidator.IsValidPlacement(point, Team.Player))
            {
                DeploymentAreaVisual?.PulseInvalid();
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

            Health health = unit.GetComponent<Health>();
            if (health != null)
            {
                health.Team = Team.Player;
            }

            graveGoblinSelected = false;

            if (DeploymentAreaVisual != null)
            {
                DeploymentAreaVisual.ShowPlayerDeployment(false);
            }
        }
    }
}
