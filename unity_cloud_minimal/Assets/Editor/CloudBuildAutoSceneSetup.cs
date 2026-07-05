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
        private const string ScenePath = "Assets/Scenes/ArenaOne_Playable.unity";
        private static bool hasRun;

        static CloudBuildAutoSceneSetup()
        {
            EnsurePlayableScene();
            EditorApplication.delayCall += EnsurePlayableScene;
        }

        [InitializeOnLoadMethod]
        private static void OnEditorLoad()
        {
            EnsurePlayableScene();
            EditorApplication.delayCall += EnsurePlayableScene;
        }

        public static void EnsurePlayableScene()
        {
            if (hasRun) return;
            hasRun = true;

            try
            {
                Directory.CreateDirectory("Assets/Scenes");

                Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

                GameObject bootstrap = new GameObject("Nightmare Park Playable Game");
                bootstrap.AddComponent<NightmareParkGame>();

                EditorSceneManager.SaveScene(scene, ScenePath);

                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                Debug.Log("Nightmare Park: Arena One playable scene created and added to Build Settings.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Arena One playable scene setup failed: " + ex);
            }
        }
    }
}
#endif
