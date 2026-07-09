using UnityEngine;

namespace NightmarePark
{
    public class TowerBoltVfx : MonoBehaviour
    {
        public LineRenderer Line;
        public float Lifetime = 0.12f;
        public AnimationCurve WidthCurve = AnimationCurve.EaseInOut(0f, 1f, 1f, 0f);

        private float timer;

        public void Setup(Vector3 start, Vector3 end)
        {
            if (Line == null)
            {
                Line = GetComponent<LineRenderer>();
            }

            if (Line != null)
            {
                Line.positionCount = 2;
                Line.SetPosition(0, start);
                Line.SetPosition(1, end);
            }
        }

        private void Update()
        {
            timer += Time.deltaTime;
            float t = Mathf.Clamp01(timer / Lifetime);

            if (Line != null)
            {
                float width = WidthCurve.Evaluate(t);
                Line.widthMultiplier = width;
            }

            if (timer >= Lifetime)
            {
                Destroy(gameObject);
            }
        }
    }
}
