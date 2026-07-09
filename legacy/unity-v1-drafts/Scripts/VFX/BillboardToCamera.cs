using UnityEngine;

namespace NightmarePark
{
    public class BillboardToCamera : MonoBehaviour
    {
        public Camera TargetCamera;

        private void LateUpdate()
        {
            if (TargetCamera == null)
            {
                TargetCamera = Camera.main;
            }

            if (TargetCamera == null) return;

            transform.forward = TargetCamera.transform.forward;
        }
    }
}
