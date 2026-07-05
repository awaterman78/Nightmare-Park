#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace NightmarePark.Editor
{
    [InitializeOnLoad]
    public static class WebGLPagesFriendlySettings
    {
        static WebGLPagesFriendlySettings()
        {
            Apply();
            EditorApplication.delayCall += Apply;
        }

        [InitializeOnLoadMethod]
        private static void OnLoad()
        {
            Apply();
        }

        private static void Apply()
        {
            try
            {
                PlayerSettings.productName = "Nightmare Park Monster Royale";
                PlayerSettings.companyName = "Nightmare Park";
                PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
                PlayerSettings.WebGL.dataCaching = false;
                Debug.Log("Nightmare Park: WebGL Visual Slice v4 settings applied.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Failed to apply WebGL Visual Slice v4 settings: " + ex);
            }
        }
    }
}
#endif
