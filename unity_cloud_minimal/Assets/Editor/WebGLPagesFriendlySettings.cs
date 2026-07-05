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
                PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.FullWithoutStacktrace;
                Debug.Log("Nightmare Park: WebGL v2 settings applied.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Failed to apply WebGL v2 settings: " + ex);
            }
        }
    }
}
#endif
