#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace NightmarePark.Editor
{
    [InitializeOnLoad]
    public static class CloudBuildAutoSceneSetup
    {
        private const string ScenePath = "Assets/Scenes/CloudBuild_Minimal_Test.unity";
        private static bool hasRun;

        static CloudBuildAutoSceneSetup()
        {
            EnsureSceneAndBuildSettings();
            EditorApplication.delayCall += EnsureSceneAndBuildSettings;
        }

        [InitializeOnLoadMethod]
        private static void OnEditorLoad()
        {
            EnsureSceneAndBuildSettings();
            EditorApplication.delayCall += EnsureSceneAndBuildSettings;
        }

        public static void EnsureSceneAndBuildSettings()
        {
            if (hasRun) return;
            hasRun = true;

            try
            {
                Directory.CreateDirectory("Assets/Scenes");

                CreateOrReplaceMinimalScene();

                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                Debug.Log("Nightmare Park: Cloud Build scene created and added to Build Settings.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: Cloud Build scene setup failed: " + ex);
            }
        }

        private static void CreateOrReplaceMinimalScene()
        {
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            CreateCamera();
            CreateLight();
            CreateArena();
            CreateTowersAndCores();
            CreateTitleText();

            EditorSceneManager.SaveScene(scene, ScenePath);
        }

        private static Material MakeMat(string name, Color colour)
        {
            Material mat = new Material(Shader.Find("Standard"));
            mat.name = name;
            mat.color = colour;
            return mat;
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
            arena.transform.localScale = new Vector3(1.0f, 1.0f, 1.45f);
            arena.GetComponent<Renderer>().sharedMaterial = MakeMat("Arena Dark Stone", new Color(0.07f, 0.10f, 0.15f, 1f));

            GameObject river = GameObject.CreatePrimitive(PrimitiveType.Cube);
            river.name = "Cursed Green Separator";
            river.transform.position = new Vector3(0f, 0.04f, 0f);
            river.transform.localScale = new Vector3(8.5f, 0.05f, 0.55f);
            river.GetComponent<Renderer>().sharedMaterial = MakeMat("Cursed Green", new Color(0.05f, 0.85f, 0.48f, 1f));

            CreateBridge("Left Bridge", -1.8f);
            CreateBridge("Right Bridge", 1.8f);
        }

        private static void CreateBridge(string name, float x)
        {
            GameObject bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridge.name = name;
            bridge.transform.position = new Vector3(x, 0.08f, 0f);
            bridge.transform.localScale = new Vector3(1.1f, 0.1f, 1.15f);
            bridge.GetComponent<Renderer>().sharedMaterial = MakeMat(name + " Wood", new Color(0.36f, 0.28f, 0.19f, 1f));
        }

        private static void CreateTowersAndCores()
        {
            CreateTower("Enemy Core", new Vector3(0f, 0.55f, 6.1f), Color.magenta, 1.25f);
            CreateTower("Enemy Tower Left", new Vector3(-2.4f, 0.45f, 4.1f), new Color(0.8f, 0.25f, 1f), 0.8f);
            CreateTower("Enemy Tower Right", new Vector3(2.4f, 0.45f, 4.1f), new Color(0.8f, 0.25f, 1f), 0.8f);

            CreateTower("Player Core", new Vector3(0f, 0.55f, -6.1f), Color.green, 1.25f);
            CreateTower("Player Tower Left", new Vector3(-2.4f, 0.45f, -4.1f), Color.cyan, 0.8f);
            CreateTower("Player Tower Right", new Vector3(2.4f, 0.45f, -4.1f), Color.cyan, 0.8f);
        }

        private static void CreateTower(string name, Vector3 position, Color colour, float scale)
        {
            GameObject tower = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            tower.name = name;
            tower.transform.position = position;
            tower.transform.localScale = new Vector3(scale, scale, scale);
            tower.GetComponent<Renderer>().sharedMaterial = MakeMat(name + " Material", colour);
        }

        private static void CreateTitleText()
        {
            GameObject textGo = new GameObject("Title Text");
            TextMesh text = textGo.AddComponent<TextMesh>();
            text.text = "Nightmare Park\nUnity Cloud Build Test";
            text.anchor = TextAnchor.MiddleCenter;
            text.alignment = TextAlignment.Center;
            text.characterSize = 0.35f;
            text.color = Color.white;

            textGo.transform.position = new Vector3(0f, 0.12f, -0.25f);
            textGo.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
        }
    }
}
#endif
