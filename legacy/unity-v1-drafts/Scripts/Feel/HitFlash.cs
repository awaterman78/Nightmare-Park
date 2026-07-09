using System.Collections;
using UnityEngine;

namespace NightmarePark
{
    public class HitFlash : MonoBehaviour
    {
        public Renderer[] Renderers;
        public Color FlashColour = Color.white;
        public float FlashDuration = 0.08f;

        private MaterialPropertyBlock block;
        private Coroutine flashRoutine;

        private void Awake()
        {
            block = new MaterialPropertyBlock();

            if (Renderers == null || Renderers.Length == 0)
            {
                Renderers = GetComponentsInChildren<Renderer>();
            }
        }

        public void Flash()
        {
            if (flashRoutine != null)
            {
                StopCoroutine(flashRoutine);
            }

            flashRoutine = StartCoroutine(FlashRoutine());
        }

        private IEnumerator FlashRoutine()
        {
            SetFlash(1f);
            yield return new WaitForSeconds(FlashDuration);
            SetFlash(0f);
        }

        private void SetFlash(float amount)
        {
            foreach (Renderer r in Renderers)
            {
                if (r == null) continue;

                r.GetPropertyBlock(block);
                block.SetColor("_FlashColour", FlashColour);
                block.SetFloat("_FlashAmount", amount);
                r.SetPropertyBlock(block);
            }
        }
    }
}
