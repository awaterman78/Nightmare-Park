using System.Collections.Generic;
using UnityEngine;

namespace NightmarePark
{
    public class NightmareParkArenaOneController : MonoBehaviour
    {
        private enum Team { Player, Enemy }

        private class Unit
        {
            public Team team;
            public GameObject root;
            public Transform transform;
            public float hp;
            public float maxHp;
            public float speed;
            public float damage;
            public float range;
            public float cooldown;
            public float timer;
            public bool ranged;
            public GameObject barFill;
            public float barWidth;
        }

        private class Building
        {
            public Team team;
            public string name;
            public bool core;
            public GameObject root;
            public Transform transform;
            public float hp;
            public float maxHp;
            public float range;
            public float damage;
            public float cooldown;
            public float timer;
            public GameObject barFill;
            public float barWidth;
        }

        private readonly List<Unit> units = new List<Unit>();
        private readonly List<Building> buildings = new List<Building>();

        private Camera cam;
        private Material playerMat;
        private Material enemyMat;
        private Material goblinMat;
        private Material impMat;
        private Material floorMat;
        private Material riverMat;
        private Material bridgeMat;
        private Material boneMat;
        private Material blackMat;
        private Material healthBackMat;
        private Material healthPlayerMat;
        private Material healthEnemyMat;

        private Building playerCore;
        private Building enemyCore;

        private float energy = 5f;
        private const float MaxEnergy = 10f;
        private const float GoblinCost = 2f;
        private float waveTimer = 2.5f;
        private int waveCount;
        private bool cardSelected;
        private bool gameEnded;
        private string status = "Select Grave Goblin, then tap your green half.";
        private float statusTimer = 6f;

        private GUIStyle titleStyle;
        private GUIStyle hudStyle;
        private GUIStyle cardStyle;
        private GUIStyle statusStyle;
        private GUIStyle endStyle;

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;

            CreateMaterials();
            EnsureCamera();
            EnsureStaticScene();
            FindOrCreateBuildings();

            SetStatus("Arena One loaded. Deploy Grave Goblins in your half.", 5f);
        }

        private void Update()
        {
            float dt = Mathf.Min(Time.deltaTime, 0.05f);

            if (!gameEnded)
            {
                energy = Mathf.Min(MaxEnergy, energy + dt * 0.9f);

                waveTimer -= dt;
                if (waveTimer <= 0f)
                {
                    SpawnEnemyWave();
                    waveTimer = Mathf.Max(3.3f, 6.2f - waveCount * 0.15f);
                }

                HandleInput();
                UpdateUnits(dt);
                UpdateTowers(dt);
                RemoveDead();
                UpdateBars();
                CheckGameEnd();
            }

            statusTimer -= dt;
        }

        private void OnGUI()
        {
            EnsureStyles();

            float w = Screen.width;
            float h = Screen.height;

            GUI.color = new Color(0f, 0f, 0f, 0.78f);
            GUI.Box(new Rect(6, 6, w - 12, 96), GUIContent.none);
            GUI.Box(new Rect(6, h - 160, w - 12, 154), GUIContent.none);
            GUI.color = Color.white;

            GUI.Label(new Rect(12, 10, w - 24, 36), "NIGHTMARE PARK: MONSTER ROYALE", titleStyle);

            string coreText = "Enemy Core " + Mathf.CeilToInt(Mathf.Max(0, enemyCore.hp)) + " / " + Mathf.CeilToInt(enemyCore.maxHp)
                            + "     Energy " + energy.ToString("0.0") + " / 10"
                            + "     Player Core " + Mathf.CeilToInt(Mathf.Max(0, playerCore.hp)) + " / " + Mathf.CeilToInt(playerCore.maxHp);

            GUI.Label(new Rect(12, 48, w - 24, 28), coreText, hudStyle);
            GUI.Label(new Rect(12, 76, w - 24, 22), "Arena One  |  Grave Goblin vs Candle Imps", statusStyle);

            DrawEnergy(new Rect(24, h - 132, w - 48, 20));

            string message = statusTimer > 0 ? status : "Tap card. Tap green half. Break the enemy core.";
            GUI.Label(new Rect(18, h - 106, w - 36, 24), message, statusStyle);

            GUI.enabled = !gameEnded && energy >= GoblinCost;
            string cardText = cardSelected ? "GRAVE GOBLIN\nREADY TO DEPLOY" : "GRAVE GOBLIN\n2 ENERGY";
            if (GUI.Button(new Rect(w / 2 - 100, h - 78, 200, 66), cardText, cardStyle))
            {
                cardSelected = true;
                SetStatus("Grave Goblin selected. Tap the green lower half.", 4f);
            }
            GUI.enabled = true;

            if (gameEnded)
            {
                GUI.color = new Color(0f, 0f, 0f, 0.82f);
                GUI.Box(new Rect(0, h * 0.34f, w, h * 0.28f), GUIContent.none);
                GUI.color = Color.white;

                string result = enemyCore.hp <= 0 ? "VICTORY" : "DEFEAT";
                GUI.Label(new Rect(0, h * 0.39f, w, 70), result, endStyle);
                GUI.Label(new Rect(0, h * 0.50f, w, 34), "Refresh to play again.", hudStyle);
            }
        }

        private void DrawEnergy(Rect rect)
        {
            GUI.color = new Color(0.08f, 0.08f, 0.10f, 1f);
            GUI.DrawTexture(rect, Texture2D.whiteTexture);

            float pct = Mathf.Clamp01(energy / MaxEnergy);
            GUI.color = new Color(0.05f, 0.95f, 0.45f, 1f);
            GUI.DrawTexture(new Rect(rect.x + 2, rect.y + 2, (rect.width - 4) * pct, rect.height - 4), Texture2D.whiteTexture);

            GUI.color = Color.white;
        }

        private void EnsureStyles()
        {
            if (titleStyle != null) return;

            titleStyle = new GUIStyle(GUI.skin.label);
            titleStyle.alignment = TextAnchor.MiddleCenter;
            titleStyle.fontStyle = FontStyle.Bold;
            titleStyle.fontSize = Mathf.Max(18, Screen.height / 36);
            titleStyle.normal.textColor = new Color(0.9f, 1f, 0.95f, 1f);

            hudStyle = new GUIStyle(GUI.skin.label);
            hudStyle.alignment = TextAnchor.MiddleCenter;
            hudStyle.fontStyle = FontStyle.Bold;
            hudStyle.fontSize = Mathf.Max(13, Screen.height / 55);
            hudStyle.normal.textColor = Color.white;

            statusStyle = new GUIStyle(GUI.skin.label);
            statusStyle.alignment = TextAnchor.MiddleCenter;
            statusStyle.fontSize = Mathf.Max(12, Screen.height / 62);
            statusStyle.normal.textColor = new Color(0.78f, 1f, 0.86f, 1f);

            cardStyle = new GUIStyle(GUI.skin.button);
            cardStyle.alignment = TextAnchor.MiddleCenter;
            cardStyle.fontStyle = FontStyle.Bold;
            cardStyle.fontSize = Mathf.Max(13, Screen.height / 58);

            endStyle = new GUIStyle(GUI.skin.label);
            endStyle.alignment = TextAnchor.MiddleCenter;
            endStyle.fontStyle = FontStyle.Bold;
            endStyle.fontSize = Mathf.Max(44, Screen.height / 10);
            endStyle.normal.textColor = new Color(0.95f, 1f, 0.95f, 1f);
        }

        private void CreateMaterials()
        {
            floorMat = MakeMat("Haunted floor", new Color(0.045f, 0.065f, 0.095f, 1f));
            playerMat = MakeMat("Player green", new Color(0.05f, 0.75f, 0.42f, 1f));
            enemyMat = MakeMat("Enemy purple", new Color(0.65f, 0.12f, 0.92f, 1f));
            goblinMat = MakeMat("Grave Goblin", new Color(0.25f, 1.0f, 0.34f, 1f));
            impMat = MakeMat("Candle Imp", new Color(1.0f, 0.38f, 0.08f, 1f));
            riverMat = MakeMat("Cursed green", new Color(0.02f, 1.0f, 0.48f, 1f));
            bridgeMat = MakeMat("Bridge wood", new Color(0.36f, 0.24f, 0.13f, 1f));
            boneMat = MakeMat("Bone", new Color(0.88f, 0.82f, 0.62f, 1f));
            blackMat = MakeMat("Black", new Color(0.01f, 0.01f, 0.02f, 1f));
            healthBackMat = MakeMat("Health back", new Color(0.05f, 0.01f, 0.02f, 1f));
            healthPlayerMat = MakeMat("Health player", new Color(0.05f, 1f, 0.3f, 1f));
            healthEnemyMat = MakeMat("Health enemy", new Color(1f, 0.08f, 0.18f, 1f));
        }

        private Material MakeMat(string name, Color color)
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

        private void EnsureCamera()
        {
            cam = Camera.main;
            if (cam == null)
            {
                GameObject cameraObject = new GameObject("Main Camera");
                cameraObject.tag = "MainCamera";
                cam = cameraObject.AddComponent<Camera>();
            }

            cam.orthographic = true;
            cam.orthographicSize = 7.45f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.014f, 0.014f, 0.035f, 1f);
            cam.transform.position = new Vector3(0f, 10.4f, -8.65f);
            cam.transform.rotation = Quaternion.Euler(61f, 0f, 0f);

            if (FindObjectOfType<Light>() == null)
            {
                GameObject lightObject = new GameObject("Moonlight");
                Light light = lightObject.AddComponent<Light>();
                light.type = LightType.Directional;
                light.intensity = 1.3f;
                light.color = new Color(0.85f, 0.95f, 1f, 1f);
                lightObject.transform.rotation = Quaternion.Euler(48f, -30f, 10f);
            }
        }

        private void EnsureStaticScene()
        {
            if (GameObject.Find("Arena One Floor") != null) return;

            CreateCube("Arena One Floor", new Vector3(0f, -0.08f, 0f), new Vector3(8.9f, 0.12f, 13.7f), floorMat);
            CreateCube("Player Deployment Zone", new Vector3(0f, 0.005f, -3.45f), new Vector3(8.55f, 0.02f, 5.95f), MakeMat("Player zone", new Color(0.02f, 0.20f, 0.14f, 1f)));
            CreateCube("Enemy Zone", new Vector3(0f, 0.004f, 3.45f), new Vector3(8.55f, 0.02f, 5.95f), MakeMat("Enemy zone", new Color(0.16f, 0.035f, 0.20f, 1f)));
            CreateCube("Cursed Separator", new Vector3(0f, 0.07f, 0f), new Vector3(8.75f, 0.10f, 0.72f), riverMat);

            CreateBridge(-2.2f);
            CreateBridge(2.2f);

            CreateWorldText("NIGHTMARE PARK", new Vector3(0f, 0.22f, 6.72f), 0.46f, new Color(0.95f, 0.95f, 1f, 1f));
            CreateWorldText("ARENA ONE", new Vector3(0f, 0.18f, -0.92f), 0.34f, new Color(0.75f, 1f, 0.86f, 1f));

            for (int i = 0; i < 18; i++)
            {
                float x = DeterministicRange(i + 4, -4.05f, 4.05f);
                float z = DeterministicRange(i + 44, -5.9f, 5.9f);
                if (Mathf.Abs(z) < 0.9f) z += z < 0 ? -1.25f : 1.25f;
                if (Mathf.Abs(x) < 1.0f && Mathf.Abs(z) < 2.0f) x += x < 0 ? -1.35f : 1.35f;

                GameObject grave = CreateCube("Wonky Gravestone", new Vector3(x, 0.18f, z), new Vector3(0.32f, 0.48f, 0.09f), MakeMat("Gravestone", new Color(0.36f, 0.38f, 0.42f, 1f)));
                grave.transform.rotation = Quaternion.Euler(0f, DeterministicRange(i + 77, -18f, 18f), DeterministicRange(i + 89, -7f, 7f));
            }

            for (int i = 0; i < 12; i++)
            {
                float x = i % 2 == 0 ? -4.22f : 4.22f;
                float z = -5.7f + i * 1.05f;
                CreateSphere("Glowing Pumpkin", new Vector3(x, 0.19f, z), new Vector3(0.24f, 0.17f, 0.24f), i % 2 == 0 ? impMat : riverMat);
            }
        }

        private GameObject CreateCube(string name, Vector3 position, Vector3 scale, Material material)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = scale;
            Renderer renderer = go.GetComponent<Renderer>();
            renderer.sharedMaterial = material;
            return go;
        }

        private GameObject CreateSphere(string name, Vector3 position, Vector3 scale, Material material)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = scale;
            go.GetComponent<Renderer>().sharedMaterial = material;
            return go;
        }

        private void CreateBridge(float x)
        {
            CreateCube("Rotten Bridge", new Vector3(x, 0.13f, 0f), new Vector3(1.28f, 0.16f, 1.42f), bridgeMat);
            for (int i = -1; i <= 1; i++)
            {
                CreateCube("Bridge Bone Plank", new Vector3(x + i * 0.38f, 0.24f, 0f), new Vector3(0.12f, 0.055f, 1.52f), boneMat);
            }
        }

        private void CreateWorldText(string text, Vector3 position, float size, Color color)
        {
            GameObject go = new GameObject(text);
            TextMesh mesh = go.AddComponent<TextMesh>();
            mesh.text = text;
            mesh.anchor = TextAnchor.MiddleCenter;
            mesh.alignment = TextAlignment.Center;
            mesh.characterSize = size;
            mesh.color = color;
            go.transform.position = position;
            go.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
        }

        private float DeterministicRange(int seed, float min, float max)
        {
            float v = Mathf.Sin(seed * 12.9898f) * 43758.5453f;
            v = v - Mathf.Floor(v);
            return Mathf.Lerp(min, max, v);
        }

        private void FindOrCreateBuildings()
        {
            if (playerCore != null) return;

            playerCore = CreateBuilding("Player Core", Team.Player, true, new Vector3(0f, 0f, -6.08f), 460f, 0f, 0f, 0f, 1.18f);
            CreateBuilding("Player Left Tower", Team.Player, false, new Vector3(-2.45f, 0f, -4.15f), 220f, 3.25f, 18f, 1.0f, 0.78f);
            CreateBuilding("Player Right Tower", Team.Player, false, new Vector3(2.45f, 0f, -4.15f), 220f, 3.25f, 18f, 1.0f, 0.78f);

            enemyCore = CreateBuilding("Enemy Core", Team.Enemy, true, new Vector3(0f, 0f, 6.08f), 460f, 0f, 0f, 0f, 1.18f);
            CreateBuilding("Enemy Left Tower", Team.Enemy, false, new Vector3(-2.45f, 0f, 4.15f), 220f, 3.25f, 17f, 1.05f, 0.78f);
            CreateBuilding("Enemy Right Tower", Team.Enemy, false, new Vector3(2.45f, 0f, 4.15f), 220f, 3.25f, 17f, 1.05f, 0.78f);
        }

        private Building CreateBuilding(string name, Team team, bool core, Vector3 position, float hp, float range, float damage, float cooldown, float scale)
        {
            GameObject root = new GameObject(name);
            root.transform.position = position;

            Material mat = team == Team.Player ? playerMat : enemyMat;

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            body.name = name + " Body";
            body.transform.SetParent(root.transform, false);
            body.transform.localPosition = new Vector3(0f, core ? 0.62f : 0.48f, 0f);
            body.transform.localScale = new Vector3(scale, core ? 0.92f : 0.66f, scale);
            body.GetComponent<Renderer>().sharedMaterial = mat;

            GameObject glow = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            glow.name = name + " Glow";
            glow.transform.SetParent(root.transform, false);
            glow.transform.localPosition = new Vector3(0f, core ? 1.42f : 1.12f, 0f);
            glow.transform.localScale = new Vector3(scale * 0.54f, scale * 0.54f, scale * 0.54f);
            glow.GetComponent<Renderer>().sharedMaterial = core ? mat : boneMat;

            Building b = new Building();
            b.team = team;
            b.name = name;
            b.core = core;
            b.root = root;
            b.transform = root.transform;
            b.hp = hp;
            b.maxHp = hp;
            b.range = range;
            b.damage = damage;
            b.cooldown = cooldown;
            b.timer = DeterministicRange(name.Length + 23, 0f, Mathf.Max(0.1f, cooldown));
            b.barWidth = core ? 1.15f : 0.82f;

            CreateHealthBar(root.transform, team, core ? 1.92f : 1.48f, b.barWidth, out b.barFill);
            buildings.Add(b);
            return b;
        }

        private void CreateHealthBar(Transform parent, Team team, float height, float width, out GameObject fill)
        {
            GameObject back = CreateCube("Health Bar Back", Vector3.zero, new Vector3(width, 0.08f, 0.08f), healthBackMat);
            back.transform.SetParent(parent, false);
            back.transform.localPosition = new Vector3(0f, height, 0f);

            fill = CreateCube("Health Bar Fill", Vector3.zero, new Vector3(width, 0.09f, 0.09f), team == Team.Player ? healthPlayerMat : healthEnemyMat);
            fill.transform.SetParent(parent, false);
            fill.transform.localPosition = new Vector3(0f, height + 0.012f, -0.015f);
        }

        private void HandleInput()
        {
            bool pressed = false;
            Vector2 screen = Vector2.zero;

            if (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)
            {
                pressed = true;
                screen = Input.GetTouch(0).position;
            }
            else if (Input.GetMouseButtonDown(0))
            {
                pressed = true;
                screen = Input.mousePosition;
            }

            if (!pressed || !cardSelected) return;

            if (screen.y < 150f || screen.y > Screen.height - 110f) return;

            if (!ScreenToArena(screen, out Vector3 point)) return;

            if (!InPlayerDeployment(point))
            {
                SetStatus("Invalid placement. Use the green player half.", 2.6f);
                return;
            }

            if (energy < GoblinCost)
            {
                SetStatus("Not enough energy.", 2.0f);
                return;
            }

            energy -= GoblinCost;
            cardSelected = false;
            SpawnGraveGoblin(point);
            SetStatus("Grave Goblin deployed.", 2.0f);
        }

        private bool ScreenToArena(Vector2 screen, out Vector3 point)
        {
            point = Vector3.zero;
            Ray ray = cam.ScreenPointToRay(screen);
            Plane plane = new Plane(Vector3.up, Vector3.zero);
            if (plane.Raycast(ray, out float enter))
            {
                point = ray.GetPoint(enter);
                return true;
            }
            return false;
        }

        private bool InPlayerDeployment(Vector3 point)
        {
            return point.x > -4.15f && point.x < 4.15f && point.z > -6.2f && point.z < -0.85f;
        }

        private void SpawnGraveGoblin(Vector3 position)
        {
            Unit unit = new Unit();
            unit.team = Team.Player;
            unit.hp = 88f;
            unit.maxHp = 88f;
            unit.speed = 1.82f;
            unit.damage = 24f;
            unit.range = 0.62f;
            unit.cooldown = 0.72f;
            unit.timer = 0.15f;
            unit.ranged = false;
            unit.barWidth = 0.62f;

            unit.root = new GameObject("Player Grave Goblin");
            unit.transform = unit.root.transform;
            unit.transform.position = new Vector3(position.x, 0f, position.z);

            CreateGoblinVisual(unit.root.transform);
            CreateHealthBar(unit.root.transform, unit.team, 1.16f, unit.barWidth, out unit.barFill);

            units.Add(unit);
            SpawnPuff(unit.transform.position + Vector3.up * 0.4f, goblinMat);
        }

        private void SpawnEnemyWave()
        {
            waveCount++;

            int count = waveCount % 3 == 0 ? 3 : 2;
            for (int i = 0; i < count; i++)
            {
                float x = count == 3 ? -1.25f + i * 1.25f : (i == 0 ? -1.35f : 1.35f);
                SpawnCandleImp(new Vector3(x, 0f, 5.35f + i * 0.15f));
            }

            SetStatus("Candle Imp wave incoming.", 2.6f);
        }

        private void SpawnCandleImp(Vector3 position)
        {
            Unit unit = new Unit();
            unit.team = Team.Enemy;
            unit.hp = 58f + waveCount * 1.8f;
            unit.maxHp = unit.hp;
            unit.speed = 1.32f;
            unit.damage = 10f + waveCount * 0.35f;
            unit.range = 0.92f;
            unit.cooldown = 0.92f;
            unit.timer = 0.2f;
            unit.ranged = true;
            unit.barWidth = 0.58f;

            unit.root = new GameObject("Enemy Candle Imp");
            unit.transform = unit.root.transform;
            unit.transform.position = position;

            CreateImpVisual(unit.root.transform);
            CreateHealthBar(unit.root.transform, unit.team, 1.12f, unit.barWidth, out unit.barFill);

            units.Add(unit);
            SpawnPuff(unit.transform.position + Vector3.up * 0.4f, impMat);
        }

        private void CreateGoblinVisual(Transform parent)
        {
            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Goblin Body";
            body.transform.SetParent(parent, false);
            body.transform.localPosition = new Vector3(0f, 0.42f, 0f);
            body.transform.localScale = new Vector3(0.34f, 0.42f, 0.34f);
            body.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            head.name = "Goblin Head";
            head.transform.SetParent(parent, false);
            head.transform.localPosition = new Vector3(0f, 0.89f, 0.04f);
            head.transform.localScale = new Vector3(0.42f, 0.33f, 0.35f);
            head.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject dagger = GameObject.CreatePrimitive(PrimitiveType.Cube);
            dagger.name = "Bone Dagger";
            dagger.transform.SetParent(parent, false);
            dagger.transform.localPosition = new Vector3(0.28f, 0.54f, 0.34f);
            dagger.transform.localScale = new Vector3(0.08f, 0.08f, 0.54f);
            dagger.GetComponent<Renderer>().sharedMaterial = boneMat;

            GameObject eye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            eye.name = "Goblin Eyes";
            eye.transform.SetParent(parent, false);
            eye.transform.localPosition = new Vector3(0f, 0.94f, 0.22f);
            eye.transform.localScale = new Vector3(0.16f, 0.055f, 0.04f);
            eye.GetComponent<Renderer>().sharedMaterial = blackMat;
        }

        private void CreateImpVisual(Transform parent)
        {
            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Candle Body";
            body.transform.SetParent(parent, false);
            body.transform.localPosition = new Vector3(0f, 0.38f, 0f);
            body.transform.localScale = new Vector3(0.30f, 0.36f, 0.30f);
            body.GetComponent<Renderer>().sharedMaterial = impMat;

            GameObject flame = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            flame.name = "Green Flame";
            flame.transform.SetParent(parent, false);
            flame.transform.localPosition = new Vector3(0f, 0.88f, 0f);
            flame.transform.localScale = new Vector3(0.23f, 0.35f, 0.23f);
            flame.GetComponent<Renderer>().sharedMaterial = riverMat;
        }

        private void UpdateUnits(float dt)
        {
            foreach (Unit unit in units)
            {
                if (unit.hp <= 0) continue;

                unit.timer -= dt;

                object target = FindTarget(unit);
                if (target == null) continue;

                Vector3 targetPos = TargetPosition(target);
                float distance = Vector3.Distance(Flat(unit.transform.position), Flat(targetPos));

                if (distance <= unit.range)
                {
                    if (unit.timer <= 0f)
                    {
                        unit.timer = unit.cooldown;
                        ApplyDamage(target, unit.damage);
                        SpawnStrike(unit.transform.position + Vector3.up * 0.55f, targetPos + Vector3.up * 0.7f, unit.team);
                    }
                }
                else
                {
                    MoveTowards(unit, targetPos, dt);
                }
            }
        }

        private object FindTarget(Unit unit)
        {
            Team enemy = unit.team == Team.Player ? Team.Enemy : Team.Player;

            Unit nearestUnit = null;
            float nearestUnitDistance = 999f;
            foreach (Unit other in units)
            {
                if (other.hp <= 0 || other.team != enemy) continue;

                float d = Vector3.Distance(Flat(unit.transform.position), Flat(other.transform.position));
                if (d < nearestUnitDistance)
                {
                    nearestUnitDistance = d;
                    nearestUnit = other;
                }
            }

            Building nearestBuilding = null;
            float nearestBuildingDistance = 999f;
            foreach (Building building in buildings)
            {
                if (building.hp <= 0 || building.team != enemy) continue;

                float d = Vector3.Distance(Flat(unit.transform.position), Flat(building.transform.position));
                if (d < nearestBuildingDistance)
                {
                    nearestBuildingDistance = d;
                    nearestBuilding = building;
                }
            }

            if (nearestUnit != null && nearestUnitDistance < 2.2f) return nearestUnit;
            if (nearestBuilding != null) return nearestBuilding;
            return nearestUnit;
        }

        private Vector3 TargetPosition(object target)
        {
            Unit unit = target as Unit;
            if (unit != null) return unit.transform.position;

            Building building = target as Building;
            if (building != null) return building.transform.position;

            return Vector3.zero;
        }

        private Vector3 Flat(Vector3 v)
        {
            return new Vector3(v.x, 0f, v.z);
        }

        private void MoveTowards(Unit unit, Vector3 targetPos, float dt)
        {
            Vector3 current = unit.transform.position;
            Vector3 waypoint = BridgeWaypoint(current, targetPos);
            Vector3 direction = Flat(waypoint) - Flat(current);

            if (direction.sqrMagnitude < 0.04f)
            {
                direction = Flat(targetPos) - Flat(current);
            }

            if (direction.sqrMagnitude < 0.001f) return;

            direction.Normalize();

            Vector3 next = current + direction * unit.speed * dt;
            next.x = Mathf.Clamp(next.x, -4.2f, 4.2f);
            next.z = Mathf.Clamp(next.z, -6.25f, 6.25f);

            unit.transform.position = next;
            unit.transform.rotation = Quaternion.Slerp(unit.transform.rotation, Quaternion.LookRotation(direction, Vector3.up), dt * 12f);
        }

        private Vector3 BridgeWaypoint(Vector3 current, Vector3 target)
        {
            bool crossing = (current.z < -0.45f && target.z > 0.45f) || (current.z > 0.45f && target.z < -0.45f);
            if (!crossing) return target;

            float bridgeX = Mathf.Abs(current.x + 2.2f) < Mathf.Abs(current.x - 2.2f) ? -2.2f : 2.2f;

            if (current.z < -0.45f)
            {
                if (current.z < -0.72f || Mathf.Abs(current.x - bridgeX) > 0.22f)
                {
                    return new Vector3(bridgeX, 0f, -0.72f);
                }
                return new Vector3(bridgeX, 0f, 0.72f);
            }

            if (current.z > 0.45f)
            {
                if (current.z > 0.72f || Mathf.Abs(current.x - bridgeX) > 0.22f)
                {
                    return new Vector3(bridgeX, 0f, 0.72f);
                }
                return new Vector3(bridgeX, 0f, -0.72f);
            }

            return target;
        }

        private void ApplyDamage(object target, float damage)
        {
            Unit unit = target as Unit;
            if (unit != null)
            {
                unit.hp -= damage;
                return;
            }

            Building building = target as Building;
            if (building != null)
            {
                building.hp -= damage;
            }
        }

        private void UpdateTowers(float dt)
        {
            foreach (Building building in buildings)
            {
                if (building.hp <= 0 || building.core || building.range <= 0) continue;

                building.timer -= dt;
                if (building.timer > 0) continue;

                Unit target = NearestEnemyUnit(building);
                if (target == null) continue;

                building.timer = building.cooldown;
                target.hp -= building.damage;
                SpawnStrike(building.transform.position + Vector3.up * 1.25f, target.transform.position + Vector3.up * 0.55f, building.team);
            }
        }

        private Unit NearestEnemyUnit(Building building)
        {
            Team enemy = building.team == Team.Player ? Team.Enemy : Team.Player;
            Unit best = null;
            float bestDistance = building.range;

            foreach (Unit unit in units)
            {
                if (unit.hp <= 0 || unit.team != enemy) continue;

                float d = Vector3.Distance(Flat(building.transform.position), Flat(unit.transform.position));
                if (d < bestDistance)
                {
                    bestDistance = d;
                    best = unit;
                }
            }

            return best;
        }

        private void SpawnStrike(Vector3 start, Vector3 end, Team team)
        {
            GameObject go = new GameObject("Spectral Strike");
            LineRenderer line = go.AddComponent<LineRenderer>();
            line.positionCount = 2;
            line.SetPosition(0, start);
            line.SetPosition(1, end);
            line.startWidth = 0.08f;
            line.endWidth = 0.02f;
            line.material = team == Team.Player ? healthPlayerMat : healthEnemyMat;
            Destroy(go, 0.14f);
        }

        private void SpawnPuff(Vector3 position, Material material)
        {
            GameObject puff = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            puff.name = "Puff";
            puff.transform.position = position;
            puff.transform.localScale = new Vector3(0.22f, 0.22f, 0.22f);
            puff.GetComponent<Renderer>().sharedMaterial = material;
            Destroy(puff, 0.55f);
        }

        private void RemoveDead()
        {
            for (int i = units.Count - 1; i >= 0; i--)
            {
                if (units[i].hp > 0) continue;

                SpawnPuff(units[i].transform.position + Vector3.up * 0.45f, units[i].team == Team.Player ? goblinMat : impMat);
                Destroy(units[i].root);
                units.RemoveAt(i);
            }

            foreach (Building building in buildings)
            {
                if (building.hp <= 0 && building.root.activeSelf)
                {
                    SpawnPuff(building.transform.position + Vector3.up * 0.8f, building.team == Team.Player ? playerMat : enemyMat);
                    building.root.SetActive(false);
                }
            }
        }

        private void UpdateBars()
        {
            foreach (Unit unit in units)
            {
                UpdateBar(unit.barFill, unit.hp, unit.maxHp, unit.barWidth);
            }

            foreach (Building building in buildings)
            {
                UpdateBar(building.barFill, building.hp, building.maxHp, building.barWidth);
            }
        }

        private void UpdateBar(GameObject fill, float hp, float maxHp, float width)
        {
            if (fill == null) return;

            float pct = Mathf.Clamp01(hp / maxHp);
            Vector3 scale = fill.transform.localScale;
            scale.x = Mathf.Max(0.01f, width * pct);
            fill.transform.localScale = scale;
        }

        private void CheckGameEnd()
        {
            if (enemyCore.hp <= 0)
            {
                gameEnded = true;
                SetStatus("Victory. Enemy core destroyed.", 999f);
                return;
            }

            if (playerCore.hp <= 0)
            {
                gameEnded = true;
                SetStatus("Defeat. Player core destroyed.", 999f);
            }
        }

        private void SetStatus(string text, float seconds)
        {
            status = text;
            statusTimer = seconds;
        }
    }
}
