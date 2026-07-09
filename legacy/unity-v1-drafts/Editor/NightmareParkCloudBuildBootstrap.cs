#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace NightmarePark.Editor
{
    [InitializeOnLoad]
    public static class NightmareParkCloudBuildBootstrap
    {
        private const string ScenePath = "Assets/Scenes/ArenaOne_Test.unity";
        private const string BuildOutputPath = "Builds/WebGL";

        static NightmareParkCloudBuildBootstrap()
        {
            EditorApplication.delayCall += EnsureProjectIsBuildable;
        }

        public static void EnsureProjectIsBuildable()
        {
            try
            {
                Directory.CreateDirectory("Assets/Scenes");
                Directory.CreateDirectory("Assets/Editor");

                if (!File.Exists(ScenePath))
                {
                    CreateBootstrapScene();
                }

                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();
                Debug.Log("Nightmare Park cloud bootstrap completed.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park cloud bootstrap failed: " + ex);
            }
        }

        private static void CreateBootstrapScene()
        {
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            GameObject cameraGo = new GameObject("Main Camera");
            Camera camera = cameraGo.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.03f, 0.03f, 0.08f, 1f);
            camera.orthographic = true;
            camera.orthographicSize = 7.3f;
            camera.transform.position = new Vector3(0f, 10f, -8f);
            camera.transform.rotation = Quaternion.Euler(60f, 0f, 0f);
            cameraGo.tag = "MainCamera";

            GameObject lightGo = new GameObject("Directional Light");
            Light light = lightGo.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1f;
            light.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

            GameObject arena = GameObject.CreatePrimitive(PrimitiveType.Plane);
            arena.name = "Arena One Placeholder";
            arena.transform.position = Vector3.zero;
            arena.transform.localScale = new Vector3(1.0f, 1.0f, 1.4f);

            Material arenaMat = new Material(Shader.Find("Standard"));
            arenaMat.color = new Color(0.08f, 0.11f, 0.16f, 1f);
            arena.GetComponent<Renderer>().sharedMaterial = arenaMat;

            CreateTower("Enemy Core", new Vector3(0f, 0.45f, 6.2f), Color.magenta, 1.4f);
            CreateTower("Enemy Tower Left", new Vector3(-2.4f, 0.35f, 4.2f), Color.magenta, 0.9f);
            CreateTower("Enemy Tower Right", new Vector3(2.4f, 0.35f, 4.2f), Color.magenta, 0.9f);

            CreateTower("Player Core", new Vector3(0f, 0.45f, -6.2f), Color.green, 1.4f);
            CreateTower("Player Tower Left", new Vector3(-2.4f, 0.35f, -4.2f), Color.cyan, 0.9f);
            CreateTower("Player Tower Right", new Vector3(2.4f, 0.35f, -4.2f), Color.cyan, 0.9f);

            GameObject label = new GameObject("Bootstrap Note");
            TextMesh text = label.AddComponent<TextMesh>();
            text.text = "Nightmare Park Cloud Build Bootstrap\nScene generated successfully";
            text.alignment = TextAlignment.Center;
            text.anchor = TextAnchor.MiddleCenter;
            text.characterSize = 0.28f;
            label.transform.position = new Vector3(0f, 0.05f, 0f);
            label.transform.rotation = Quaternion.Euler(90f, 0f, 0f);

            EditorSceneManager.SaveScene(scene, ScenePath);
            Debug.Log("Created bootstrap scene at " + ScenePath);
        }

        private static void CreateTower(string name, Vector3 position, Color colour, float scale)
        {
            GameObject tower = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            tower.name = name;
            tower.transform.position = position;
            tower.transform.localScale = new Vector3(scale, scale, scale);

            Material mat = new Material(Shader.Find("Standard"));
            mat.color = colour;
            tower.GetComponent<Renderer>().sharedMaterial = mat;
        }

        public static void PerformWebGLBuild()
        {
            EnsureProjectIsBuildable();

            Directory.CreateDirectory(BuildOutputPath);

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = BuildOutputPath,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };

            BuildPipeline.BuildPlayer(options);
        }
    }
}
#endif
