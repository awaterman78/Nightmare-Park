#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace NightmarePark.Editor
{
    public static class CloudBuild
    {
        private const string ScenePath = "Assets/Scenes/CloudBuild_Minimal_Test.unity";
        private const string BuildOutput = "Builds/WebGL/NightmarePark";

        public static void PerformWebGLBuild()
        {
            Debug.Log("Nightmare Park minimal WebGL build started.");

            EnsureScene();

            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(ScenePath, true)
            };

            Directory.CreateDirectory(BuildOutput);

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = BuildOutput,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };

            BuildPipeline.BuildPlayer(options);

            Debug.Log("Nightmare Park minimal WebGL build finished.");
        }

        private static void EnsureScene()
        {
            Directory.CreateDirectory("Assets/Scenes");

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            CreateCamera();
            CreateLight();
            CreateArena();
            CreateTowers();
            CreateTitleText();

            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("Created minimal cloud build scene at " + ScenePath);
        }

        private static void CreateCamera()
        {
            GameObject go = new GameObject("Main Camera");
            Camera cam = go.AddComponent<Camera>();
            cam.orthographic = true;
            cam.orthographicSize = 7.5f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.025f, 0.025f, 0.06f, 1f);
            go.transform.position = new Vector3(0f, 10f, -8f);
            go.transform.rotation = Quaternion.Euler(60f, 0f, 0f);
            go.tag = "MainCamera";
        }

        private static void CreateLight()
        {
            GameObject go = new GameObject("Directional Light");
            Light light = go.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.2f;
            go.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
        }

        private static void CreateArena()
        {
            GameObject arena = GameObject.CreatePrimitive(PrimitiveType.Plane);
            arena.name = "Arena One Minimal Placeholder";
            arena.transform.position = Vector3.zero;
            arena.transform.localScale = new Vector3(1f, 1f, 1.45f);

            Material mat = new Material(Shader.Find("Standard"));
            mat.color = new Color(0.07f, 0.10f, 0.15f, 1f);
            arena.GetComponent<Renderer>().sharedMaterial = mat;

            CreateBridge(-1.8f);
            CreateBridge(1.8f);
            CreateRiver();
        }

        private static void CreateRiver()
        {
            GameObject river = GameObject.CreatePrimitive(PrimitiveType.Cube);
            river.name = "Cursed Green Separator";
            river.transform.position = new Vector3(0f, 0.04f, 0f);
            river.transform.localScale = new Vector3(8.5f, 0.05f, 0.55f);

            Material mat = new Material(Shader.Find("Standard"));
            mat.color = new Color(0.05f, 0.8f, 0.45f, 1f);
            river.GetComponent<Renderer>().sharedMaterial = mat;
        }

        private static void CreateBridge(float x)
        {
            GameObject bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridge.name = x < 0f ? "Left Bridge" : "Right Bridge";
            bridge.transform.position = new Vector3(x, 0.08f, 0f);
            bridge.transform.localScale = new Vector3(1.1f, 0.1f, 1.1f);

            Material mat = new Material(Shader.Find("Standard"));
            mat.color = new Color(0.35f, 0.28f, 0.20f, 1f);
            bridge.GetComponent<Renderer>().sharedMaterial = mat;
        }

        private static void CreateTowers()
        {
            CreateTower("Enemy Core", new Vector3(0f, 0.55f, 6.1f), Color.magenta, 1.2f);
            CreateTower("Enemy Tower Left", new Vector3(-2.4f, 0.45f, 4.1f), new Color(0.75f, 0.25f, 1f), 0.8f);
            CreateTower("Enemy Tower Right", new Vector3(2.4f, 0.45f, 4.1f), new Color(0.75f, 0.25f, 1f), 0.8f);

            CreateTower("Player Core", new Vector3(0f, 0.55f, -6.1f), Color.green, 1.2f);
            CreateTower("Player Tower Left", new Vector3(-2.4f, 0.45f, -4.1f), Color.cyan, 0.8f);
            CreateTower("Player Tower Right", new Vector3(2.4f, 0.45f, -4.1f), Color.cyan, 0.8f);
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

        private static void CreateTitleText()
        {
            GameObject textGo = new GameObject("Title Text");
            TextMesh text = textGo.AddComponent<TextMesh>();
            text.text = "Nightmare Park\nCloud Build Minimal Test";
            text.anchor = TextAnchor.MiddleCenter;
            text.alignment = TextAlignment.Center;
            text.characterSize = 0.35f;
            text.color = Color.white;

            textGo.transform.position = new Vector3(0f, 0.12f, -0.2f);
            textGo.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
        }
    }
}
#endif
