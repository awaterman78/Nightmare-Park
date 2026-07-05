#if UNITY_EDITOR
using System.IO;
using NightmarePark;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace NightmarePark.Editor
{
    [InitializeOnLoad]
    public static class CloudBuildAutoSceneSetup
    {
        private const string ScenePath = "Assets/Scenes/ArenaOne_VisualSlice_v4.unity";
        private static bool hasRun;

        static CloudBuildAutoSceneSetup()
        {
            Run();
            EditorApplication.delayCall += Run;
        }

        [InitializeOnLoadMethod]
        private static void OnLoad()
        {
            Run();
            EditorApplication.delayCall += Run;
        }

        private static void Run()
        {
            if (hasRun) return;
            hasRun = true;

            try
            {
                Directory.CreateDirectory("Assets/Scenes");

                Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

                GameObject controller = new GameObject("Nightmare Park Arena One Visual Slice v4");
                controller.AddComponent<NightmareParkArenaOneController>();

                EditorSceneManager.SaveScene(scene, ScenePath);

                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                Debug.Log("Nightmare Park: Arena One Visual Slice v4 created and added to Build Settings.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Visual Slice v4 scene setup failed: " + ex);
            }
        }
    }
}
#endif
