#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterClash.Editor
{
    public static class MonsterClashBuild
    {
        private const string ScenePath = "Assets/Scenes/MonsterClash_ArenaOne.unity";
        private const string BuildOutput = "../builds/MonsterClashWebGL";

        [MenuItem("Monster Clash/Prepare Arena One")]
        public static void PrepareArenaOne()
        {
            EnsureBuildScene();
            Debug.Log("Monster Clash Arena One is ready for play mode or cloud build.");
        }

        // Unity Build Automation calls this after script compilation and before export.
        public static void PreExport()
        {
            EnsureBuildScene();
            Debug.Log("Monster Clash cloud pre export completed.");
        }

        [MenuItem("Monster Clash/Build WebGL")]
        public static void BuildWebGL()
        {
            EnsureBuildScene();
            Directory.CreateDirectory(BuildOutput);

            PlayerSettings.productName = "Monster Clash";
            PlayerSettings.companyName = "DT Games";

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = BuildOutput,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };

            BuildReport report = BuildPipeline.BuildPlayer(options);
            if (report.summary.result != BuildResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Monster Clash WebGL build failed with " + report.summary.totalErrors + " errors.");
            }

            Debug.Log("Monster Clash WebGL build completed at " + Path.GetFullPath(BuildOutput));
        }

        private static void EnsureBuildScene()
        {
            Directory.CreateDirectory("Assets/Scenes");

            if (!File.Exists(ScenePath))
            {
                Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                GameObject note = new GameObject("Runtime bootstrap creates Arena One");
                note.transform.position = Vector3.zero;
                EditorSceneManager.SaveScene(scene, ScenePath);
            }

            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(ScenePath, true)
            };

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }
    }
}
#endif
