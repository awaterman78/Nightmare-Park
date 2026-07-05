using System.Collections.Generic;
using UnityEngine;

namespace NightmarePark
{
    public class NightmareParkGame : MonoBehaviour
    {
        private enum Team
        {
            Player,
            Enemy
        }

        private class Building
        {
            public string name;
            public Team team;
            public bool core;
            public GameObject go;
            public Transform transform;
            public float hp;
            public float maxHp;
            public float range;
            public float damage;
            public float fireCooldown;
            public float fireTimer;
            public GameObject barBack;
            public GameObject barFill;
        }

        private class Unit
        {
            public string name;
            public Team team;
            public GameObject go;
            public Transform transform;
            public float hp;
            public float maxHp;
            public float speed;
            public float damage;
            public float attackRange;
            public float attackCooldown;
            public float attackTimer;
            public float bobSeed;
            public bool isImp;
            public GameObject barBack;
            public GameObject barFill;
        }

        private readonly List<Unit> units = new List<Unit>();
        private readonly List<Building> buildings = new List<Building>();
        private readonly List<GameObject> temporaryObjects = new List<GameObject>();

        private Material arenaMat;
        private Material playerMat;
        private Material enemyMat;
        private Material goblinMat;
        private Material impMat;
        private Material bridgeMat;
        private Material riverMat;
        private Material graveMat;
        private Material boneMat;
        private Material healthBackMat;
        private Material healthPlayerMat;
        private Material healthEnemyMat;
        private Material darkMat;
        private Material boltPlayerMat;
        private Material boltEnemyMat;

        private Building playerCore;
        private Building enemyCore;

        private float energy = 5f;
        private const float MaxEnergy = 10f;
        private const float GraveGoblinCost = 2f;
        private float enemyWaveTimer = 3f;
        private float matchTimer = 180f;
        private bool cardSelected;
        private bool gameOver;
        private string statusMessage = "Select Grave Goblin, then deploy in your half.";
        private float statusTimer = 4f;
        private int playerDeployments;
        private int enemyWaves;

        private GUIStyle hudStyle;
        private GUIStyle titleStyle;
        private GUIStyle cardStyle;
        private GUIStyle bigStyle;
        private GUIStyle smallStyle;

        private Camera mainCamera;

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;

            CreateMaterials();
            CreateCamera();
            CreateArena();
            CreateBuildings();
            CreateWorldTitle();

            SetStatus("Arena One ready. Select Grave Goblin and tap your half.", 4f);
        }

        private void Update()
        {
            float dt = Time.deltaTime;

            if (!gameOver)
            {
                matchTimer -= dt;
                energy = Mathf.Min(MaxEnergy, energy + dt * 0.85f);

                enemyWaveTimer -= dt;
                if (enemyWaveTimer <= 0f)
                {
                    SpawnEnemyWave();
                    enemyWaveTimer = Mathf.Max(3.2f, 6.5f - enemyWaves * 0.18f);
                }

                HandleWorldInput();
                UpdateUnits(dt);
                UpdateTowers(dt);
                CleanupDead();
                CheckWinLose();
            }

            statusTimer -= dt;
            UpdateHealthBars();
            UpdateTemporaryObjects(dt);
        }

        private void OnGUI()
        {
            EnsureGuiStyles();

            float w = Screen.width;
            float h = Screen.height;

            GUI.color = new Color(0f, 0f, 0f, 0.72f);
            GUI.Box(new Rect(8f, 8f, w - 16f, 82f), GUIContent.none);
            GUI.Box(new Rect(8f, h - 148f, w - 16f, 140f), GUIContent.none);
            GUI.color = Color.white;

            GUI.Label(new Rect(20f, 12f, w - 40f, 30f), "Nightmare Park: Monster Royale", titleStyle);

            string topLine = "Enemy Core " + Mathf.CeilToInt(enemyCore.hp) + " / " + Mathf.CeilToInt(enemyCore.maxHp)
                             + "     Time " + Mathf.CeilToInt(matchTimer)
                             + "     Player Core " + Mathf.CeilToInt(playerCore.hp) + " / " + Mathf.CeilToInt(playerCore.maxHp);
            GUI.Label(new Rect(20f, 45f, w - 40f, 24f), topLine, hudStyle);

            DrawEnergyBar(new Rect(24f, h - 124f, w - 48f, 22f));

            string msg = statusTimer > 0f ? statusMessage : "Destroy the enemy core. Deploy in your half only.";
            GUI.Label(new Rect(24f, h - 96f, w - 48f, 22f), msg, smallStyle);

            Rect cardRect = new Rect((w * 0.5f) - 86f, h - 74f, 172f, 62f);
            GUI.enabled = !gameOver && energy >= GraveGoblinCost;
            string cardLabel = cardSelected
                ? "GRAVE GOBLIN\nSELECTED"
                : "GRAVE GOBLIN\n2 ENERGY";

            if (GUI.Button(cardRect, cardLabel, cardStyle))
            {
                cardSelected = true;
                SetStatus("Grave Goblin selected. Tap the green player half.", 3f);
            }

            GUI.enabled = true;

            if (gameOver)
            {
                GUI.color = new Color(0f, 0f, 0f, 0.78f);
                GUI.Box(new Rect(0f, h * 0.34f, w, h * 0.28f), GUIContent.none);
                GUI.color = Color.white;

                string result = enemyCore.hp <= 0f ? "VICTORY" : "DEFEAT";
                GUI.Label(new Rect(0f, h * 0.39f, w, 58f), result, bigStyle);
                GUI.Label(new Rect(0f, h * 0.49f, w, 30f), "Refresh the page to play again.", hudStyle);
            }
        }

        private void DrawEnergyBar(Rect rect)
        {
            GUI.Box(rect, GUIContent.none);
            float pct = Mathf.Clamp01(energy / MaxEnergy);

            GUI.color = new Color(0.1f, 0.85f, 0.45f, 0.9f);
            GUI.DrawTexture(new Rect(rect.x + 2f, rect.y + 2f, (rect.width - 4f) * pct, rect.height - 4f), Texture2D.whiteTexture);
            GUI.color = Color.white;

            GUI.Label(rect, "Energy " + energy.ToString("0.0") + " / " + MaxEnergy.ToString("0"), hudStyle);
        }

        private void EnsureGuiStyles()
        {
            if (hudStyle != null) return;

            hudStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Max(14, Screen.height / 42),
                normal = { textColor = Color.white }
            };

            smallStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Max(12, Screen.height / 55),
                normal = { textColor = new Color(0.82f, 1f, 0.88f, 1f) }
            };

            titleStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Max(18, Screen.height / 34),
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.9f, 1f, 0.92f, 1f) }
            };

            cardStyle = new GUIStyle(GUI.skin.button)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Max(13, Screen.height / 52),
                fontStyle = FontStyle.Bold
            };

            bigStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Max(42, Screen.height / 10),
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.92f, 1f, 0.95f, 1f) }
            };
        }

        private void CreateMaterials()
        {
            arenaMat = MakeMat("Arena dark stone", new Color(0.055f, 0.075f, 0.105f, 1f));
            playerMat = MakeMat("Player spectral green", new Color(0.05f, 0.7f, 0.45f, 1f));
            enemyMat = MakeMat("Enemy haunted purple", new Color(0.65f, 0.16f, 0.9f, 1f));
            goblinMat = MakeMat("Grave Goblin green", new Color(0.2f, 0.95f, 0.36f, 1f));
            impMat = MakeMat("Candle Imp orange", new Color(1f, 0.34f, 0.08f, 1f));
            bridgeMat = MakeMat("Rotten bridge", new Color(0.34f, 0.23f, 0.14f, 1f));
            riverMat = MakeMat("Cursed river", new Color(0.05f, 0.95f, 0.5f, 1f));
            graveMat = MakeMat("Grave stone", new Color(0.35f, 0.38f, 0.42f, 1f));
            boneMat = MakeMat("Bone", new Color(0.86f, 0.82f, 0.65f, 1f));
            healthBackMat = MakeMat("Health back", new Color(0.06f, 0.02f, 0.02f, 1f));
            healthPlayerMat = MakeMat("Health player", new Color(0.05f, 0.95f, 0.35f, 1f));
            healthEnemyMat = MakeMat("Health enemy", new Color(1f, 0.15f, 0.25f, 1f));
            darkMat = MakeMat("Dark prop", new Color(0.025f, 0.025f, 0.045f, 1f));
            boltPlayerMat = MakeMat("Player bolt", new Color(0.15f, 1f, 0.75f, 1f));
            boltEnemyMat = MakeMat("Enemy bolt", new Color(1f, 0.25f, 0.95f, 1f));
        }

        private Material MakeMat(string name, Color color)
        {
            Shader shader = Shader.Find("Standard");
            Material mat = new Material(shader);
            mat.name = name;
            mat.color = color;
            return mat;
        }

        private void CreateCamera()
        {
            GameObject cameraGo = new GameObject("Main Camera");
            mainCamera = cameraGo.AddComponent<Camera>();
            mainCamera.orthographic = true;
            mainCamera.orthographicSize = 7.25f;
            mainCamera.clearFlags = CameraClearFlags.SolidColor;
            mainCamera.backgroundColor = new Color(0.018f, 0.018f, 0.04f, 1f);
            cameraGo.transform.position = new Vector3(0f, 10.2f, -8.6f);
            cameraGo.transform.rotation = Quaternion.Euler(61f, 0f, 0f);
            cameraGo.tag = "MainCamera";

            GameObject lightGo = new GameObject("Moonlight");
            Light light = lightGo.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.35f;
            light.color = new Color(0.82f, 0.95f, 1f, 1f);
            lightGo.transform.rotation = Quaternion.Euler(48f, -32f, 8f);

            GameObject fillGo = new GameObject("Green fog fill");
            Light fill = fillGo.AddComponent<Light>();
            fill.type = LightType.Point;
            fill.intensity = 2.1f;
            fill.range = 9f;
            fill.color = new Color(0.1f, 1f, 0.48f, 1f);
            fillGo.transform.position = new Vector3(0f, 3f, 0f);
        }

        private void CreateArena()
        {
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ground.name = "Arena One haunted battlefield";
            ground.transform.position = new Vector3(0f, -0.08f, 0f);
            ground.transform.localScale = new Vector3(8.8f, 0.12f, 13.6f);
            ground.GetComponent<Renderer>().sharedMaterial = arenaMat;

            CreateZone("Player deployment half", new Vector3(0f, 0.005f, -3.35f), new Vector3(8.5f, 0.02f, 6.1f), new Color(0.02f, 0.22f, 0.18f, 1f));
            CreateZone("Enemy half", new Vector3(0f, 0.003f, 3.35f), new Vector3(8.5f, 0.02f, 6.1f), new Color(0.16f, 0.05f, 0.22f, 1f));

            GameObject river = GameObject.CreatePrimitive(PrimitiveType.Cube);
            river.name = "Cursed green separator";
            river.transform.position = new Vector3(0f, 0.04f, 0f);
            river.transform.localScale = new Vector3(8.6f, 0.08f, 0.68f);
            river.GetComponent<Renderer>().sharedMaterial = riverMat;

            CreateBridge("Left bridge", -2.25f);
            CreateBridge("Right bridge", 2.25f);

            CreateFence(-4.55f);
            CreateFence(4.55f);

            for (int i = 0; i < 18; i++)
            {
                float x = RandomRangeDeterministic(i, -4.0f, 4.0f);
                float z = RandomRangeDeterministic(i + 100, -5.8f, 5.8f);
                if (Mathf.Abs(z) < 0.9f) z += z < 0f ? -1.1f : 1.1f;
                if (Mathf.Abs(x) < 0.8f && Mathf.Abs(z) < 2.2f) x += x < 0f ? -1.3f : 1.3f;
                CreateGrave(new Vector3(x, 0.15f, z), i);
            }

            for (int i = 0; i < 12; i++)
            {
                float x = i % 2 == 0 ? -4.1f : 4.1f;
                float z = -5.6f + i * 1.02f;
                CreatePumpkin(new Vector3(x, 0.18f, z), i);
            }
        }

        private void CreateZone(string name, Vector3 position, Vector3 scale, Color color)
        {
            GameObject zone = GameObject.CreatePrimitive(PrimitiveType.Cube);
            zone.name = name;
            zone.transform.position = position;
            zone.transform.localScale = scale;
            zone.GetComponent<Renderer>().sharedMaterial = MakeMat(name + " material", color);
        }

        private void CreateBridge(string name, float x)
        {
            GameObject bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridge.name = name;
            bridge.transform.position = new Vector3(x, 0.11f, 0f);
            bridge.transform.localScale = new Vector3(1.22f, 0.16f, 1.35f);
            bridge.GetComponent<Renderer>().sharedMaterial = bridgeMat;

            for (int i = -1; i <= 1; i++)
            {
                GameObject plank = GameObject.CreatePrimitive(PrimitiveType.Cube);
                plank.name = name + " plank";
                plank.transform.position = new Vector3(x + i * 0.36f, 0.21f, 0f);
                plank.transform.localScale = new Vector3(0.13f, 0.05f, 1.42f);
                plank.GetComponent<Renderer>().sharedMaterial = boneMat;
            }
        }

        private void CreateFence(float x)
        {
            for (int i = 0; i < 9; i++)
            {
                GameObject post = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                post.name = "Crooked fence post";
                post.transform.position = new Vector3(x, 0.28f, -6.1f + i * 1.5f);
                post.transform.localScale = new Vector3(0.08f, 0.38f, 0.08f);
                post.transform.rotation = Quaternion.Euler(0f, 0f, (i % 2 == 0 ? 8f : -8f));
                post.GetComponent<Renderer>().sharedMaterial = bridgeMat;
            }
        }

        private void CreateGrave(Vector3 position, int index)
        {
            GameObject grave = GameObject.CreatePrimitive(PrimitiveType.Cube);
            grave.name = "Wonky gravestone";
            grave.transform.position = position;
            grave.transform.localScale = new Vector3(0.32f, 0.44f, 0.08f);
            grave.transform.rotation = Quaternion.Euler(0f, RandomRangeDeterministic(index + 11, -18f, 18f), RandomRangeDeterministic(index + 22, -8f, 8f));
            grave.GetComponent<Renderer>().sharedMaterial = graveMat;
        }

        private void CreatePumpkin(Vector3 position, int index)
        {
            GameObject pumpkin = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            pumpkin.name = "Glowing pumpkin";
            pumpkin.transform.position = position;
            pumpkin.transform.localScale = new Vector3(0.22f, 0.16f, 0.22f);
            pumpkin.GetComponent<Renderer>().sharedMaterial = index % 2 == 0 ? impMat : riverMat;
        }

        private float RandomRangeDeterministic(int seed, float min, float max)
        {
            float v = Mathf.Sin(seed * 12.9898f) * 43758.5453f;
            v = v - Mathf.Floor(v);
            return Mathf.Lerp(min, max, v);
        }

        private void CreateBuildings()
        {
            playerCore = CreateBuilding("Player Core", Team.Player, true, new Vector3(0f, 0f, -6.08f), 420f, 0f, 0f, 0f, playerMat, 1.25f);
            CreateBuilding("Player Left Tower", Team.Player, false, new Vector3(-2.4f, 0f, -4.15f), 190f, 3.35f, 16f, 1.05f, playerMat, 0.82f);
            CreateBuilding("Player Right Tower", Team.Player, false, new Vector3(2.4f, 0f, -4.15f), 190f, 3.35f, 16f, 1.05f, playerMat, 0.82f);

            enemyCore = CreateBuilding("Enemy Core", Team.Enemy, true, new Vector3(0f, 0f, 6.08f), 420f, 0f, 0f, 0f, enemyMat, 1.25f);
            CreateBuilding("Enemy Left Tower", Team.Enemy, false, new Vector3(-2.4f, 0f, 4.15f), 190f, 3.35f, 15f, 1.1f, enemyMat, 0.82f);
            CreateBuilding("Enemy Right Tower", Team.Enemy, false, new Vector3(2.4f, 0f, 4.15f), 190f, 3.35f, 15f, 1.1f, enemyMat, 0.82f);
        }

        private Building CreateBuilding(string name, Team team, bool core, Vector3 position, float hp, float range, float damage, float cooldown, Material mat, float scale)
        {
            GameObject root = new GameObject(name);
            root.transform.position = position;

            GameObject basePart = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            basePart.name = name + " base";
            basePart.transform.SetParent(root.transform, false);
            basePart.transform.localPosition = new Vector3(0f, 0.42f, 0f);
            basePart.transform.localScale = new Vector3(scale, core ? 0.82f : 0.62f, scale);
            basePart.GetComponent<Renderer>().sharedMaterial = mat;

            GameObject top = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            top.name = name + " glow";
            top.transform.SetParent(root.transform, false);
            top.transform.localPosition = new Vector3(0f, core ? 1.25f : 1.0f, 0f);
            top.transform.localScale = new Vector3(scale * 0.62f, scale * 0.62f, scale * 0.62f);
            top.GetComponent<Renderer>().sharedMaterial = core ? (team == Team.Player ? riverMat : enemyMat) : boneMat;

            Building b = new Building
            {
                name = name,
                team = team,
                core = core,
                go = root,
                transform = root.transform,
                hp = hp,
                maxHp = hp,
                range = range,
                damage = damage,
                fireCooldown = cooldown,
                fireTimer = RandomRangeDeterministic(name.Length, 0f, cooldown)
            };

            CreateHealthBar(root.transform, team, out b.barBack, out b.barFill, core ? 1.85f : 1.45f, core ? 1.15f : 0.85f);
            buildings.Add(b);
            return b;
        }

        private void CreateHealthBar(Transform parent, Team team, out GameObject back, out GameObject fill, float height, float width)
        {
            back = GameObject.CreatePrimitive(PrimitiveType.Cube);
            back.name = "Health bar back";
            back.transform.SetParent(parent, false);
            back.transform.localPosition = new Vector3(0f, height, 0f);
            back.transform.localScale = new Vector3(width, 0.08f, 0.08f);
            back.GetComponent<Renderer>().sharedMaterial = healthBackMat;

            fill = GameObject.CreatePrimitive(PrimitiveType.Cube);
            fill.name = "Health bar fill";
            fill.transform.SetParent(parent, false);
            fill.transform.localPosition = new Vector3(0f, height + 0.01f, -0.01f);
            fill.transform.localScale = new Vector3(width, 0.09f, 0.09f);
            fill.GetComponent<Renderer>().sharedMaterial = team == Team.Player ? healthPlayerMat : healthEnemyMat;
        }

        private void CreateWorldTitle()
        {
            GameObject textGo = new GameObject("World title");
            TextMesh tm = textGo.AddComponent<TextMesh>();
            tm.text = "Arena One";
            tm.anchor = TextAnchor.MiddleCenter;
            tm.alignment = TextAlignment.Center;
            tm.characterSize = 0.42f;
            tm.color = new Color(0.9f, 1f, 0.92f, 1f);
            textGo.transform.position = new Vector3(0f, 0.16f, -0.78f);
            textGo.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
        }

        private void HandleWorldInput()
        {
            bool pressed = false;
            Vector2 screenPos = Vector2.zero;

            if (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)
            {
                pressed = true;
                screenPos = Input.GetTouch(0).position;
            }
            else if (Input.GetMouseButtonDown(0))
            {
                pressed = true;
                screenPos = Input.mousePosition;
            }

            if (!pressed || !cardSelected) return;

            if (screenPos.y < 155f || screenPos.y > Screen.height - 95f)
            {
                return;
            }

            if (!TryGetArenaPoint(screenPos, out Vector3 point))
            {
                return;
            }

            if (!IsInsidePlayerDeployment(point))
            {
                SetStatus("Invalid placement. Deploy in the green player half.", 2.2f);
                return;
            }

            if (energy < GraveGoblinCost)
            {
                SetStatus("Not enough energy.", 2f);
                return;
            }

            energy -= GraveGoblinCost;
            cardSelected = false;
            playerDeployments++;
            SpawnGraveGoblin(Team.Player, point + new Vector3(0f, 0f, 0.05f));
            SetStatus("Grave Goblin deployed.", 2f);
        }

        private bool TryGetArenaPoint(Vector2 screenPos, out Vector3 point)
        {
            point = Vector3.zero;
            Ray ray = mainCamera.ScreenPointToRay(screenPos);
            Plane plane = new Plane(Vector3.up, Vector3.zero);

            if (plane.Raycast(ray, out float enter))
            {
                point = ray.GetPoint(enter);
                return true;
            }

            return false;
        }

        private bool IsInsidePlayerDeployment(Vector3 point)
        {
            return point.x > -4.15f && point.x < 4.15f && point.z > -6.25f && point.z < -0.85f;
        }

        private void SpawnEnemyWave()
        {
            enemyWaves++;

            int count = enemyWaves % 3 == 0 ? 3 : 2;
            for (int i = 0; i < count; i++)
            {
                float x = count == 3 ? -1.15f + i * 1.15f : (i == 0 ? -1.25f : 1.25f);
                SpawnCandleImp(new Vector3(x, 0f, 5.25f + i * 0.2f));
            }

            SetStatus("Enemy Candle Imps incoming.", 2.5f);
        }

        private void SpawnGraveGoblin(Team team, Vector3 position)
        {
            Unit unit = CreateUnitBase("Grave Goblin", team, position, 78f, 1.72f, 22f, 0.78f, 0.58f, false);
            CreateGoblinModel(unit);
            units.Add(unit);
            SpawnPuff(position + Vector3.up * 0.28f, goblinMat.color);
        }

        private void SpawnCandleImp(Vector3 position)
        {
            Unit unit = CreateUnitBase("Candle Imp", Team.Enemy, position, 52f + enemyWaves * 1.5f, 1.28f, 9f + enemyWaves * 0.28f, 0.92f, 0.52f, true);
            CreateImpModel(unit);
            units.Add(unit);
            SpawnPuff(position + Vector3.up * 0.28f, impMat.color);
        }

        private Unit CreateUnitBase(string name, Team team, Vector3 position, float hp, float speed, float damage, float cooldown, float range, bool isImp)
        {
            GameObject root = new GameObject(team + " " + name);
            root.transform.position = new Vector3(position.x, 0f, position.z);

            Unit unit = new Unit
            {
                name = name,
                team = team,
                go = root,
                transform = root.transform,
                hp = hp,
                maxHp = hp,
                speed = speed,
                damage = damage,
                attackCooldown = cooldown,
                attackRange = range,
                attackTimer = RandomRangeDeterministic(units.Count + 30, 0f, cooldown),
                bobSeed = RandomRangeDeterministic(units.Count + 90, 0f, 10f),
                isImp = isImp
            };

            CreateHealthBar(root.transform, team, out unit.barBack, out unit.barFill, 1.18f, 0.62f);
            return unit;
        }

        private void CreateGoblinModel(Unit unit)
        {
            Transform root = unit.transform;

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Goblin body";
            body.transform.SetParent(root, false);
            body.transform.localPosition = new Vector3(0f, 0.42f, 0f);
            body.transform.localScale = new Vector3(0.34f, 0.42f, 0.34f);
            body.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            head.name = "Goblin head";
            head.transform.SetParent(root, false);
            head.transform.localPosition = new Vector3(0f, 0.88f, 0.02f);
            head.transform.localScale = new Vector3(0.42f, 0.32f, 0.34f);
            head.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject earL = GameObject.CreatePrimitive(PrimitiveType.Cube);
            earL.name = "Goblin left ear";
            earL.transform.SetParent(root, false);
            earL.transform.localPosition = new Vector3(-0.28f, 0.9f, 0f);
            earL.transform.localScale = new Vector3(0.22f, 0.08f, 0.12f);
            earL.transform.localRotation = Quaternion.Euler(0f, 0f, 18f);
            earL.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject earR = GameObject.CreatePrimitive(PrimitiveType.Cube);
            earR.name = "Goblin right ear";
            earR.transform.SetParent(root, false);
            earR.transform.localPosition = new Vector3(0.28f, 0.9f, 0f);
            earR.transform.localScale = new Vector3(0.22f, 0.08f, 0.12f);
            earR.transform.localRotation = Quaternion.Euler(0f, 0f, -18f);
            earR.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject dagger = GameObject.CreatePrimitive(PrimitiveType.Cube);
            dagger.name = "Bone dagger";
            dagger.transform.SetParent(root, false);
            dagger.transform.localPosition = new Vector3(0.28f, 0.52f, 0.34f);
            dagger.transform.localScale = new Vector3(0.08f, 0.08f, 0.52f);
            dagger.GetComponent<Renderer>().sharedMaterial = boneMat;

            GameObject eyeL = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            eyeL.name = "Left eye";
            eyeL.transform.SetParent(root, false);
            eyeL.transform.localPosition = new Vector3(-0.1f, 0.93f, 0.19f);
            eyeL.transform.localScale = new Vector3(0.055f, 0.055f, 0.055f);
            eyeL.GetComponent<Renderer>().sharedMaterial = darkMat;

            GameObject eyeR = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            eyeR.name = "Right eye";
            eyeR.transform.SetParent(root, false);
            eyeR.transform.localPosition = new Vector3(0.1f, 0.93f, 0.19f);
            eyeR.transform.localScale = new Vector3(0.055f, 0.055f, 0.055f);
            eyeR.GetComponent<Renderer>().sharedMaterial = darkMat;
        }

        private void CreateImpModel(Unit unit)
        {
            Transform root = unit.transform;

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Imp body";
            body.transform.SetParent(root, false);
            body.transform.localPosition = new Vector3(0f, 0.38f, 0f);
            body.transform.localScale = new Vector3(0.28f, 0.34f, 0.28f);
            body.GetComponent<Renderer>().sharedMaterial = impMat;

            GameObject flame = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            flame.name = "Candle flame";
            flame.transform.SetParent(root, false);
            flame.transform.localPosition = new Vector3(0f, 0.88f, 0f);
            flame.transform.localScale = new Vector3(0.22f, 0.34f, 0.22f);
            flame.GetComponent<Renderer>().sharedMaterial = riverMat;

            GameObject wick = GameObject.CreatePrimitive(PrimitiveType.Cube);
            wick.name = "Wick";
            wick.transform.SetParent(root, false);
            wick.transform.localPosition = new Vector3(0f, 0.67f, 0f);
            wick.transform.localScale = new Vector3(0.05f, 0.18f, 0.05f);
            wick.GetComponent<Renderer>().sharedMaterial = darkMat;
        }

        private void UpdateUnits(float dt)
        {
            foreach (Unit unit in units)
            {
                if (unit.hp <= 0f) continue;

                unit.attackTimer -= dt;

                Transform visual = unit.transform;
                float bob = Mathf.Sin(Time.time * (unit.isImp ? 5.5f : 9.5f) + unit.bobSeed) * (unit.isImp ? 0.035f : 0.055f);
                visual.position = new Vector3(visual.position.x, bob, visual.position.z);

                object target = FindTargetFor(unit);
                if (target == null) continue;

                Vector3 targetPosition = GetTargetPosition(target);
                float distanceToActualTarget = Vector3.Distance(Flat(unit.transform.position), Flat(targetPosition));

                if (distanceToActualTarget <= unit.attackRange)
                {
                    TryUnitAttack(unit, target);
                }
                else
                {
                    MoveUnitTowards(unit, targetPosition, dt);
                }
            }
        }

        private object FindTargetFor(Unit unit)
        {
            Team enemyTeam = unit.team == Team.Player ? Team.Enemy : Team.Player;

            Unit nearestUnit = null;
            float nearestUnitDist = float.MaxValue;
            foreach (Unit other in units)
            {
                if (other.hp <= 0f || other.team != enemyTeam) continue;
                float d = Vector3.Distance(Flat(unit.transform.position), Flat(other.transform.position));
                if (d < nearestUnitDist)
                {
                    nearestUnitDist = d;
                    nearestUnit = other;
                }
            }

            Building nearestBuilding = null;
            float nearestBuildingDist = float.MaxValue;
            foreach (Building b in buildings)
            {
                if (b.hp <= 0f || b.team != enemyTeam) continue;
                float d = Vector3.Distance(Flat(unit.transform.position), Flat(b.transform.position));
                if (d < nearestBuildingDist)
                {
                    nearestBuildingDist = d;
                    nearestBuilding = b;
                }
            }

            if (nearestUnit != null && nearestUnitDist < 2.4f)
            {
                return nearestUnit;
            }

            return nearestBuilding != null ? (object)nearestBuilding : nearestUnit;
        }

        private Vector3 GetTargetPosition(object target)
        {
            if (target is Unit u) return u.transform.position;
            if (target is Building b) return b.transform.position;
            return Vector3.zero;
        }

        private Vector3 Flat(Vector3 v)
        {
            return new Vector3(v.x, 0f, v.z);
        }

        private void MoveUnitTowards(Unit unit, Vector3 targetPosition, float dt)
        {
            Vector3 position = unit.transform.position;
            Vector3 waypoint = GetBridgeAwareWaypoint(position, targetPosition);

            Vector3 direction = Flat(waypoint) - Flat(position);
            if (direction.sqrMagnitude < 0.03f)
            {
                direction = Flat(targetPosition) - Flat(position);
            }

            if (direction.sqrMagnitude < 0.001f) return;

            direction.Normalize();
            Vector3 next = position + direction * unit.speed * dt;
            next.x = Mathf.Clamp(next.x, -4.18f, 4.18f);
            next.z = Mathf.Clamp(next.z, -6.32f, 6.32f);

            unit.transform.position = next;
            unit.transform.rotation = Quaternion.Slerp(unit.transform.rotation, Quaternion.LookRotation(direction, Vector3.up), dt * 12f);
        }

        private Vector3 GetBridgeAwareWaypoint(Vector3 position, Vector3 target)
        {
            bool crossing = (position.z < -0.42f && target.z > 0.42f) || (position.z > 0.42f && target.z < -0.42f);
            if (!crossing) return target;

            float leftBridgeX = -2.25f;
            float rightBridgeX = 2.25f;
            float bridgeX = Mathf.Abs(position.x - leftBridgeX) < Mathf.Abs(position.x - rightBridgeX) ? leftBridgeX : rightBridgeX;

            if (position.z < -0.42f)
            {
                if (Mathf.Abs(position.x - bridgeX) > 0.22f || position.z < -0.75f)
                {
                    return new Vector3(bridgeX, 0f, -0.75f);
                }
                return new Vector3(bridgeX, 0f, 0.75f);
            }

            if (position.z > 0.42f)
            {
                if (Mathf.Abs(position.x - bridgeX) > 0.22f || position.z > 0.75f)
                {
                    return new Vector3(bridgeX, 0f, 0.75f);
                }
                return new Vector3(bridgeX, 0f, -0.75f);
            }

            return target;
        }

        private void TryUnitAttack(Unit unit, object target)
        {
            if (unit.attackTimer > 0f) return;
            unit.attackTimer = unit.attackCooldown;

            Vector3 hitPoint = GetTargetPosition(target) + Vector3.up * 0.6f;

            if (target is Unit targetUnit)
            {
                targetUnit.hp -= unit.damage;
                SpawnFloatingText("-" + Mathf.CeilToInt(unit.damage), hitPoint, unit.team == Team.Player ? healthPlayerMat.color : healthEnemyMat.color);
                SpawnStrike(unit.transform.position + Vector3.up * 0.5f, hitPoint, unit.team);
            }
            else if (target is Building targetBuilding)
            {
                targetBuilding.hp -= unit.damage;
                SpawnFloatingText("-" + Mathf.CeilToInt(unit.damage), hitPoint + Vector3.up * 0.45f, unit.team == Team.Player ? healthPlayerMat.color : healthEnemyMat.color);
                SpawnStrike(unit.transform.position + Vector3.up * 0.5f, hitPoint, unit.team);
            }
        }

        private void UpdateTowers(float dt)
        {
            foreach (Building b in buildings)
            {
                if (b.hp <= 0f || b.core || b.range <= 0f) continue;

                b.fireTimer -= dt;
                if (b.fireTimer > 0f) continue;

                Unit target = FindNearestEnemyUnit(b.team, b.transform.position, b.range);
                if (target == null) continue;

                b.fireTimer = b.fireCooldown;
                target.hp -= b.damage;

                Vector3 start = b.transform.position + Vector3.up * 1.25f;
                Vector3 end = target.transform.position + Vector3.up * 0.55f;
                SpawnStrike(start, end, b.team);
                SpawnFloatingText("-" + Mathf.CeilToInt(b.damage), end + Vector3.up * 0.2f, b.team == Team.Player ? healthPlayerMat.color : healthEnemyMat.color);
            }
        }

        private Unit FindNearestEnemyUnit(Team team, Vector3 from, float range)
        {
            Team enemy = team == Team.Player ? Team.Enemy : Team.Player;
            Unit best = null;
            float bestDist = range;

            foreach (Unit unit in units)
            {
                if (unit.hp <= 0f || unit.team != enemy) continue;
                float d = Vector3.Distance(Flat(from), Flat(unit.transform.position));
                if (d <= bestDist)
                {
                    bestDist = d;
                    best = unit;
                }
            }

            return best;
        }

        private void SpawnStrike(Vector3 start, Vector3 end, Team team)
        {
            GameObject go = new GameObject("Spectral strike");
            LineRenderer lr = go.AddComponent<LineRenderer>();
            lr.positionCount = 2;
            lr.SetPosition(0, start);
            lr.SetPosition(1, end);
            lr.startWidth = 0.08f;
            lr.endWidth = 0.02f;
            lr.material = team == Team.Player ? boltPlayerMat : boltEnemyMat;
            temporaryObjects.Add(go);
            Destroy(go, 0.12f);
        }

        private void SpawnPuff(Vector3 position, Color color)
        {
            GameObject puff = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            puff.name = "Spawn puff";
            puff.transform.position = position;
            puff.transform.localScale = new Vector3(0.15f, 0.15f, 0.15f);
            puff.GetComponent<Renderer>().sharedMaterial = MakeMat("Puff", color);
            temporaryObjects.Add(puff);
            Destroy(puff, 0.45f);
        }

        private void SpawnFloatingText(string text, Vector3 position, Color color)
        {
            GameObject go = new GameObject("Floating text");
            TextMesh tm = go.AddComponent<TextMesh>();
            tm.text = text;
            tm.anchor = TextAnchor.MiddleCenter;
            tm.alignment = TextAlignment.Center;
            tm.characterSize = 0.22f;
            tm.color = color;

            go.transform.position = position;
            go.transform.rotation = mainCamera.transform.rotation;
            FloatingText floating = go.AddComponent<FloatingText>();
            floating.velocity = new Vector3(0f, 0.8f, 0f);
            floating.life = 0.75f;
            temporaryObjects.Add(go);
        }

        private void UpdateTemporaryObjects(float dt)
        {
            temporaryObjects.RemoveAll(item => item == null);
        }

        private void CleanupDead()
        {
            for (int i = units.Count - 1; i >= 0; i--)
            {
                Unit unit = units[i];
                if (unit.hp > 0f) continue;

                SpawnPuff(unit.transform.position + Vector3.up * 0.4f, unit.team == Team.Player ? goblinMat.color : impMat.color);
                Destroy(unit.go);
                units.RemoveAt(i);
            }

            foreach (Building b in buildings)
            {
                if (b.hp <= 0f && b.go.activeSelf)
                {
                    b.go.SetActive(false);
                    SpawnPuff(b.transform.position + Vector3.up * 0.7f, b.team == Team.Player ? playerMat.color : enemyMat.color);
                }
            }
        }

        private void CheckWinLose()
        {
            if (enemyCore.hp <= 0f)
            {
                gameOver = true;
                SetStatus("Victory. Enemy core destroyed.", 99f);
                return;
            }

            if (playerCore.hp <= 0f)
            {
                gameOver = true;
                SetStatus("Defeat. Player core destroyed.", 99f);
                return;
            }

            if (matchTimer <= 0f)
            {
                gameOver = true;
                if (enemyCore.hp < playerCore.hp)
                {
                    enemyCore.hp = 0f;
                    SetStatus("Victory on core health.", 99f);
                }
                else
                {
                    playerCore.hp = 0f;
                    SetStatus("Defeat on core health.", 99f);
                }
            }
        }

        private void UpdateHealthBars()
        {
            foreach (Unit unit in units)
            {
                UpdateBar(unit.hp, unit.maxHp, unit.barFill);
            }

            foreach (Building b in buildings)
            {
                UpdateBar(b.hp, b.maxHp, b.barFill);
            }
        }

        private void UpdateBar(float hp, float maxHp, GameObject fill)
        {
            if (fill == null) return;

            float pct = Mathf.Clamp01(hp / maxHp);
            Vector3 scale = fill.transform.localScale;
            scale.x = Mathf.Max(0.001f, pct) * 0.75f;
            fill.transform.localScale = scale;
            fill.SetActive(hp > 0f);
        }

        private void SetStatus(string msg, float seconds)
        {
            statusMessage = msg;
            statusTimer = seconds;
        }
    }

    public class FloatingText : MonoBehaviour
    {
        public Vector3 velocity = Vector3.up;
        public float life = 1f;

        private void Update()
        {
            transform.position += velocity * Time.deltaTime;
            life -= Time.deltaTime;

            Camera cam = Camera.main;
            if (cam != null)
            {
                transform.rotation = cam.transform.rotation;
            }

            if (life <= 0f)
            {
                Destroy(gameObject);
            }
        }
    }
}
