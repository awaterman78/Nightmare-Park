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
        private const string ScenePath = "Assets/Scenes/ArenaOne_Playable_v3.unity";
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

                GameObject controller = new GameObject("Arena One Playable Controller");
                controller.AddComponent<NightmareParkArenaOneController>();

                EditorSceneManager.SaveScene(scene, ScenePath);

                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                Debug.Log("Nightmare Park: Arena One playable v3 scene created with lane-button deployment and added to Build Settings.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Arena One v3 scene setup failed: " + ex);
            }
        }
    }
}
#endif
