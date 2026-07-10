using UnityEngine;

namespace NightmarePark
{
    public class SimplePulseVfx : MonoBehaviour
    {
        public float Lifetime = 0.45f;
        public float StartScale = 0.25f;
        public float EndScale = 1.2f;
        public AnimationCurve AlphaCurve = AnimationCurve.EaseInOut(0f, 1f, 1f, 0f);

        public CanvasGroup CanvasGroup;

        private float timer;
        private Vector3 baseScale;

        private void Awake()
        {
            baseScale = transform.localScale;
            transform.localScale = baseScale * StartScale;
        }

        private void Update()
        {
            timer += Time.deltaTime;
            float t = Mathf.Clamp01(timer / Lifetime);

            transform.localScale = Vector3.Lerp(baseScale * StartScale, baseScale * EndScale, t);

            if (CanvasGroup != null)
            {
                CanvasGroup.alpha = AlphaCurve.Evaluate(t);
            }

            if (timer >= Lifetime)
            {
                Destroy(gameObject);
            }
        }
    }
}
