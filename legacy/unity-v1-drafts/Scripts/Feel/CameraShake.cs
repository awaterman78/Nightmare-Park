using UnityEngine;

namespace NightmarePark
{
    public class CameraShake : MonoBehaviour
    {
        public float RecoverySpeed = 8f;
        public float MaxOffset = 0.14f;

        private Vector3 originalLocalPosition;
        private float trauma;

        private void Awake()
        {
            originalLocalPosition = transform.localPosition;
        }

        public void Shake(float amount)
        {
            trauma = Mathf.Clamp01(trauma + amount);
        }

        private void LateUpdate()
        {
            if (trauma <= 0.001f)
            {
                transform.localPosition = Vector3.Lerp(transform.localPosition, originalLocalPosition, Time.deltaTime * RecoverySpeed);
                return;
            }

            float shake = trauma * trauma;
            Vector3 offset = new Vector3(
                Random.Range(-1f, 1f),
                Random.Range(-1f, 1f),
                0f
            ) * MaxOffset * shake;

            transform.localPosition = originalLocalPosition + offset;
            trauma = Mathf.Max(0f, trauma - Time.deltaTime * RecoverySpeed);
        }
    }
}
