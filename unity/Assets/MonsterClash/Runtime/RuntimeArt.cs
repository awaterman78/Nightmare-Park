using System.Collections.Generic;
using UnityEngine;

namespace MonsterClash
{
    public static class RuntimeArt
    {
        private static readonly Dictionary<string, Material> Materials = new Dictionary<string, Material>();

        public static Material CreateMaterial(string name, Color colour, bool emissive = false, bool transparent = false)
        {
            string key = name + "_" + ColorUtility.ToHtmlStringRGBA(colour) + "_" + emissive + "_" + transparent;
            if (Materials.TryGetValue(key, out Material existing) && existing != null) return existing;

            Shader shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader == null) shader = Shader.Find("Standard");
            if (shader == null) shader = Shader.Find("Unlit/Color");
            if (shader == null) shader = Shader.Find("Sprites/Default");

            Material material = new Material(shader) { name = name };
            SetColour(material, colour);

            if (emissive)
            {
                material.EnableKeyword("_EMISSION");
                if (material.HasProperty("_EmissionColor")) material.SetColor("_EmissionColor", colour * 1.8f);
            }

            if (transparent || colour.a < 0.999f)
            {
                ConfigureTransparency(material);
            }

            Materials[key] = material;
            return material;
        }

        public static GameObject Part(
            PrimitiveType primitive,
            string name,
            Transform parent,
            Vector3 localPosition,
            Vector3 localScale,
            Material material,
            Vector3 localEuler = default)
        {
            GameObject part = GameObject.CreatePrimitive(primitive);
            part.name = name;
            part.transform.SetParent(parent, false);
            part.transform.localPosition = localPosition;
            part.transform.localScale = localScale;
            part.transform.localRotation = Quaternion.Euler(localEuler);

            Collider collider = part.GetComponent<Collider>();
            if (collider != null) Object.Destroy(collider);

            Renderer renderer = part.GetComponent<Renderer>();
            if (renderer != null) renderer.sharedMaterial = material;
            return part;
        }

        private static void SetColour(Material material, Color colour)
        {
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", colour);
            if (material.HasProperty("_Color")) material.SetColor("_Color", colour);
            material.color = colour;
        }

        private static void ConfigureTransparency(Material material)
        {
            if (material.HasProperty("_Surface")) material.SetFloat("_Surface", 1f);
            if (material.HasProperty("_Mode")) material.SetFloat("_Mode", 3f);
            if (material.HasProperty("_SrcBlend")) material.SetFloat("_SrcBlend", (float)UnityEngine.Rendering.BlendMode.SrcAlpha);
            if (material.HasProperty("_DstBlend")) material.SetFloat("_DstBlend", (float)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            if (material.HasProperty("_ZWrite")) material.SetFloat("_ZWrite", 0f);
            material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            material.EnableKeyword("_ALPHABLEND_ON");
            material.renderQueue = 3000;
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void ResetCache()
        {
            Materials.Clear();
        }
    }
}
