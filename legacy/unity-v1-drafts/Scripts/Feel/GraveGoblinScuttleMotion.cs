using UnityEngine;

namespace NightmarePark
{
    public class GraveGoblinScuttleMotion : MonoBehaviour
    {
        [Header("Model")]
        public Transform ModelRoot;

        [Header("Scuttle")]
        public float BobAmount = 0.035f;
        public float BobSpeed = 15f;
        public float SideLeanAmount = 6f;
        public float SideLeanSpeed = 12f;
        public float SquashAmount = 0.06f;

        [Header("State")]
        public bool IsMoving;

        private Vector3 baseLocalPosition;
        private Vector3 baseLocalScale;
        private Quaternion baseLocalRotation;
        private float seed;

        private void Awake()
        {
            if (ModelRoot == null)
            {
                ModelRoot = transform;
            }

            baseLocalPosition = ModelRoot.localPosition;
            baseLocalScale = ModelRoot.localScale;
            baseLocalRotation = ModelRoot.localRotation;
            seed = Random.Range(0f, 100f);
        }

        private void LateUpdate()
        {
            if (ModelRoot == null) return;

            if (!IsMoving)
            {
                ModelRoot.localPosition = Vector3.Lerp(ModelRoot.localPosition, baseLocalPosition, Time.deltaTime * 10f);
                ModelRoot.localScale = Vector3.Lerp(ModelRoot.localScale, baseLocalScale, Time.deltaTime * 10f);
                ModelRoot.localRotation = Quaternion.Slerp(ModelRoot.localRotation, baseLocalRotation, Time.deltaTime * 10f);
                return;
            }

            float bob = Mathf.Sin((Time.time + seed) * BobSpeed);
            float lean = Mathf.Sin((Time.time + seed) * SideLeanSpeed);

            ModelRoot.localPosition = baseLocalPosition + Vector3.up * bob * BobAmount;

            Vector3 scale = baseLocalScale;
            scale.x *= 1f + Mathf.Abs(bob) * SquashAmount;
            scale.y *= 1f - Mathf.Abs(bob) * SquashAmount;

            ModelRoot.localScale = scale;
            ModelRoot.localRotation = baseLocalRotation * Quaternion.Euler(0f, 0f, -lean * SideLeanAmount);
        }

        public void SetMoving(bool moving)
        {
            IsMoving = moving;
        }
    }
}
