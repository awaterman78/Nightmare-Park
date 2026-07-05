using UnityEngine;

public class DeploymentController : MonoBehaviour
{
    public Camera mainCamera;
    public EnergySystem energySystem;
    public GameObject graveGoblinPrefab;
    public int graveGoblinCost = 2;

    [Header("World-space deployment bounds")]
    public float minX = -4f;
    public float maxX = 4f;
    public float minZ = -6f;
    public float maxZ = -0.5f;

    private bool graveGoblinSelected;

    public void SelectGraveGoblin()
    {
        graveGoblinSelected = true;
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
        Ray ray = mainCamera.ScreenPointToRay(screenPosition);

        if (Physics.Raycast(ray, out RaycastHit hit, 100f))
        {
            Vector3 point = hit.point;

            if (!IsInPlayerHalf(point))
            {
                return;
            }

            if (!energySystem.TrySpend(graveGoblinCost))
            {
                return;
            }

            Instantiate(graveGoblinPrefab, point, Quaternion.identity);
            graveGoblinSelected = false;
        }
    }

    private bool IsInPlayerHalf(Vector3 point)
    {
        return point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ;
    }
}
