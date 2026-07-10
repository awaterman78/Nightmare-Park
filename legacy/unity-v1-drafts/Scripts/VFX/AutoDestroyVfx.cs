using UnityEngine;

namespace NightmarePark
{
    public class AutoDestroyVfx : MonoBehaviour
    {
        public float Lifetime = 1.5f;

        private void Start()
        {
            Destroy(gameObject, Lifetime);
        }
    }
}
