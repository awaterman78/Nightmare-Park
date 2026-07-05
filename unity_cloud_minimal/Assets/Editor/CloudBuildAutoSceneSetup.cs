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
        private const string ScenePath = "Assets/Scenes/ArenaOne_Playable_v2.unity";
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

                CreateVisibleCamera();
                CreateVisibleLight();
                CreateVisibleFallbackMap();

                GameObject controller = new GameObject("Arena One Playable Controller");
                controller.AddComponent<NightmareParkArenaOneController>();

                EditorSceneManager.SaveScene(scene, ScenePath);

                EditorBuildSettings.scenes = new[]
                {
                    new EditorBuildSettingsScene(ScenePath, true)
                };

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                Debug.Log("Nightmare Park: Arena One playable v2 scene created, visible map included, and scene added to Build Settings.");
            }
            catch (System.Exception ex)
            {
                Debug.LogError("Nightmare Park: v2 scene setup failed: " + ex);
            }
        }

        private static Material Mat(string name, Color color)
        {
            Shader shader = Shader.Find("Unlit/Color");
            if (shader == null) shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader == null) shader = Shader.Find("Standard");
            if (shader == null) shader = Shader.Find("Sprites/Default");

            Material mat = new Material(shader);
            mat.name = name;
            if (mat.HasProperty("_Color")) mat.SetColor("_Color", color);
            if (mat.HasProperty("_BaseColor")) mat.SetColor("_BaseColor", color);
            mat.color = color;
            return mat;
        }

        private static void CreateVisibleCamera()
        {
            GameObject cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.orthographic = true;
            camera.orthographicSize = 7.45f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.014f, 0.014f, 0.035f, 1f);
            cameraObject.transform.position = new Vector3(0f, 10.4f, -8.65f);
            cameraObject.transform.rotation = Quaternion.Euler(61f, 0f, 0f);
        }

        private static void CreateVisibleLight()
        {
            GameObject lightObject = new GameObject("Moonlight");
            Light light = lightObject.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.35f;
            light.color = new Color(0.85f, 0.95f, 1f, 1f);
            lightObject.transform.rotation = Quaternion.Euler(48f, -30f, 10f);
        }

        private static void CreateVisibleFallbackMap()
        {
            Material floor = Mat("Editor floor", new Color(0.045f, 0.065f, 0.095f, 1f));
            Material green = Mat("Editor green", new Color(0.02f, 1.0f, 0.48f, 1f));
            Material player = Mat("Editor player", new Color(0.05f, 0.75f, 0.42f, 1f));
            Material enemy = Mat("Editor enemy", new Color(0.65f, 0.12f, 0.92f, 1f));
            Material wood = Mat("Editor wood", new Color(0.36f, 0.24f, 0.13f, 1f));

            Cube("Arena One Floor", new Vector3(0f, -0.08f, 0f), new Vector3(8.9f, 0.12f, 13.7f), floor);
            Cube("Player Deployment Zone", new Vector3(0f, 0.005f, -3.45f), new Vector3(8.55f, 0.02f, 5.95f), Mat("Editor player zone", new Color(0.02f, 0.20f, 0.14f, 1f)));
            Cube("Enemy Zone", new Vector3(0f, 0.004f, 3.45f), new Vector3(8.55f, 0.02f, 5.95f), Mat("Editor enemy zone", new Color(0.16f, 0.035f, 0.20f, 1f)));
            Cube("Cursed Separator", new Vector3(0f, 0.07f, 0f), new Vector3(8.75f, 0.10f, 0.72f), green);

            Cube("Left Bridge", new Vector3(-2.2f, 0.13f, 0f), new Vector3(1.28f, 0.16f, 1.42f), wood);
            Cube("Right Bridge", new Vector3(2.2f, 0.13f, 0f), new Vector3(1.28f, 0.16f, 1.42f), wood);

            Cylinder("Player Core Marker", new Vector3(0f, 0.62f, -6.08f), new Vector3(1.18f, 0.92f, 1.18f), player);
            Cylinder("Enemy Core Marker", new Vector3(0f, 0.62f, 6.08f), new Vector3(1.18f, 0.92f, 1.18f), enemy);

            WorldText("NIGHTMARE PARK", new Vector3(0f, 0.22f, 6.72f), 0.46f, Color.white);
            WorldText("ARENA ONE", new Vector3(0f, 0.18f, -0.92f), 0.34f, new Color(0.75f, 1f, 0.86f, 1f));
        }

        private static GameObject Cube(string name, Vector3 pos, Vector3 scale, Material mat)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.position = pos;
            go.transform.localScale = scale;
            go.GetComponent<Renderer>().sharedMaterial = mat;
            return go;
        }

        private static GameObject Cylinder(string name, Vector3 pos, Vector3 scale, Material mat)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            go.name = name;
            go.transform.position = pos;
            go.transform.localScale = scale;
            go.GetComponent<Renderer>().sharedMaterial = mat;
            return go;
        }

        private static void WorldText(string text, Vector3 pos, float size, Color color)
        {
            GameObject go = new GameObject(text);
            TextMesh mesh = go.AddComponent<TextMesh>();
            mesh.text = text;
            mesh.anchor = TextAnchor.MiddleCenter;
            mesh.alignment = TextAlignment.Center;
            mesh.characterSize = size;
            mesh.color = color;
            go.transform.position = pos;
            go.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
        }
    }
}
#endif
