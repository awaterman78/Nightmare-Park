using UnityEngine;
using TMPro;

namespace NightmarePark
{
    public class FloatingCombatText : MonoBehaviour
    {
        public TMP_Text Text;
        public float Lifetime = 0.9f;
        public float RiseSpeed = 50f;

        private float timer;
        private RectTransform rectTransform;

        private void Awake()
        {
            rectTransform = transform as RectTransform;
        }

        public void SetText(string value, Color colour)
        {
            if (Text != null)
            {
                Text.text = value;
                Text.color = colour;
            }
        }

        private void Update()
        {
            timer += Time.deltaTime;

            if (rectTransform != null)
            {
                rectTransform.anchoredPosition += Vector2.up * RiseSpeed * Time.deltaTime;
            }

            if (Text != null)
            {
                Color c = Text.color;
                c.a = Mathf.Lerp(1f, 0f, timer / Lifetime);
                Text.color = c;
            }

            if (timer >= Lifetime)
            {
                Destroy(gameObject);
            }
        }
    }
}
