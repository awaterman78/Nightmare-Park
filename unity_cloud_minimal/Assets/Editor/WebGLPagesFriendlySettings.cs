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
        private static void OnEditorLoaded()
        {
            Apply();
        }

        private static void Apply()
        {
            try
            {
                PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
                PlayerSettings.WebGL.dataCaching = false;
                Debug.Log("Nightmare Park: WebGL compression disabled for easier static hosting.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Failed to apply WebGL static hosting settings: " + ex);
            }
        }
    }
}
#endif
