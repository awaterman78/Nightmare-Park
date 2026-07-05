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
                Debug.Log("Nightmare Park: WebGL compression disabled for static hosting compatibility.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Failed to set WebGL Pages-friendly settings: " + ex);
            }
        }
    }
}
#endif
