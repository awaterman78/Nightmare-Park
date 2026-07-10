using UnityEngine;

namespace MonsterClash
{
    public sealed class DeploymentOverlay : MonoBehaviour
    {
        private BattleDirector director;
        private Renderer overlayRenderer;
        private Color baseColour;

        public void Initialise(BattleDirector battleDirector, Renderer targetRenderer, Color colour)
        {
            director = battleDirector;
            overlayRenderer = targetRenderer;
            baseColour = colour;
            if (overlayRenderer != null) overlayRenderer.enabled = false;
        }

        private void Update()
        {
            if (director == null || overlayRenderer == null) return;

            bool show = director.Phase == BattlePhase.Playing && director.SelectedHandIndex >= 0;
            overlayRenderer.enabled = show;

            if (!show) return;
            float pulse = 0.12f + Mathf.Sin(Time.time * 4.5f) * 0.035f;
            Color colour = baseColour;
            colour.a = pulse;
            overlayRenderer.sharedMaterial.color = colour;
        }
    }
}
