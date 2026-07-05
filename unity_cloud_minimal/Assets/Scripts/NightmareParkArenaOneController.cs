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
            public float bobSeed;
            public GameObject barFill;
            public float barWidth;
        }

        private class Building
        {
            public Team team;
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

        private Material arenaMat, wallMat, playerZoneMat, enemyZoneMat, riverMat, riverGlowMat, bridgeMat, plankMat;
        private Material playerMat, enemyMat, goblinMat, goblinDarkMat, impMat, flameMat, boneMat, darkMat, stoneMat;
        private Material healthBackMat, healthPlayerMat, healthEnemyMat, goldMat, laneMat;

        private Building playerCore;
        private Building enemyCore;

        private readonly float[] laneXs = { -2.35f, 0f, 2.35f };

        private float energy = 6f;
        private const float MaxEnergy = 10f;
        private const float GoblinCost = 2f;
        private float waveTimer = 3f;
        private int waveCount;
        private int skulls;
        private bool gameEnded;
        private string status = "Deploy a Grave Goblin.";
        private float statusTimer = 6f;

        private GUIStyle titleStyle, hudStyle, smallStyle, buttonStyle, endStyle, cardStyle;

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;

            CreateMaterials();
            SetupCamera();
            CreateArena();
            CreateBuildings();

            SetStatus("Arena One v4 loaded. Use the deploy buttons.", 6f);
        }

        private void Update()
        {
            float dt = Mathf.Min(Time.deltaTime, 0.05f);

            if (!gameEnded)
            {
                energy = Mathf.Min(MaxEnergy, energy + dt * 0.95f);

                waveTimer -= dt;
                if (waveTimer <= 0f)
                {
                    SpawnEnemyWave();
                    waveTimer = Mathf.Max(3.1f, 6.2f - waveCount * 0.12f);
                }

                UpdateUnits(dt);
                UpdateTowers(dt);
                RemoveDead();
                UpdateHealthBars();
                CheckEnd();
            }

            statusTimer -= dt;
        }

        private void OnGUI()
        {
            EnsureStyles();

            float w = Screen.width;
            float h = Screen.height;

            Panel(new Rect(10f, 8f, w - 20f, 108f), new Color(0.018f, 0.014f, 0.032f, 0.90f));
            Panel(new Rect(10f, h - 186f, w - 20f, 176f), new Color(0.018f, 0.014f, 0.032f, 0.92f));

            GUI.Label(new Rect(18f, 14f, w - 36f, 34f), "NIGHTMARE PARK: MONSTER ROYALE", titleStyle);
            GUI.Label(new Rect(18f, 48f, w - 36f, 24f), "Arena One  |  Grave Goblin vs Candle Imps", smallStyle);

            string top = "Enemy Core " + Mathf.CeilToInt(Mathf.Max(0f, enemyCore.hp)) + "/" + Mathf.CeilToInt(enemyCore.maxHp)
                + "     Wave " + waveCount
                + "     Skulls " + skulls
                + "     Player Core " + Mathf.CeilToInt(Mathf.Max(0f, playerCore.hp)) + "/" + Mathf.CeilToInt(playerCore.maxHp);

            GUI.Label(new Rect(18f, 74f, w - 36f, 28f), top, hudStyle);

            DrawEnergyBar(new Rect(26f, h - 158f, w - 52f, 20f));

            string msg = statusTimer > 0f ? status : "Deploy goblins. Defend your shrine. Break the enemy crypt.";
            GUI.Label(new Rect(22f, h - 134f, w - 44f, 22f), msg, smallStyle);
            GUI.Label(new Rect(22f, h - 110f, w - 44f, 22f), "GRAVE GOBLIN CARD  •  Cost 2  •  Fast melee pressure", cardStyle);

            GUI.enabled = !gameEnded && energy >= GoblinCost;

            float gap = 8f;
            float buttonW = Mathf.Min(174f, (w - 54f) / 3f);
            float totalW = buttonW * 3f + gap * 2f;
            float startX = (w - totalW) * 0.5f;
            float y = h - 86f;

            if (GUI.Button(new Rect(startX, y, buttonW, 68f), "DEPLOY\nLEFT", buttonStyle)) TryDeploy(laneXs[0], "left");
            if (GUI.Button(new Rect(startX + buttonW + gap, y, buttonW, 68f), "DEPLOY\nCENTRE", buttonStyle)) TryDeploy(laneXs[1], "centre");
            if (GUI.Button(new Rect(startX + (buttonW + gap) * 2f, y, buttonW, 68f), "DEPLOY\nRIGHT", buttonStyle)) TryDeploy(laneXs[2], "right");

            GUI.enabled = true;

            if (gameEnded)
            {
                Panel(new Rect(0f, h * 0.33f, w, h * 0.30f), new Color(0f, 0f, 0f, 0.88f));
                string result = enemyCore.hp <= 0f ? "VICTORY" : "DEFEAT";
                GUI.Label(new Rect(0f, h * 0.38f, w, 78f), result, endStyle);
                GUI.Label(new Rect(0f, h * 0.50f, w, 32f), "Refresh to play again.", hudStyle);
            }
        }

        private void Panel(Rect rect, Color color)
        {
            GUI.color = color;
            GUI.DrawTexture(rect, Texture2D.whiteTexture);
            GUI.color = Color.white;
        }

        private void DrawEnergyBar(Rect rect)
        {
            GUI.color = new Color(0.08f, 0.08f, 0.10f, 1f);
            GUI.DrawTexture(rect, Texture2D.whiteTexture);

            float pct = Mathf.Clamp01(energy / MaxEnergy);
            GUI.color = new Color(0.05f, 0.95f, 0.45f, 1f);
            GUI.DrawTexture(new Rect(rect.x + 2f, rect.y + 2f, (rect.width - 4f) * pct, rect.height - 4f), Texture2D.whiteTexture);
            GUI.color = Color.white;

            GUI.Label(rect, "ENERGY " + energy.ToString("0.0") + " / 10", hudStyle);
        }

        private void EnsureStyles()
        {
            if (titleStyle != null) return;

            titleStyle = new GUIStyle(GUI.skin.label);
            titleStyle.alignment = TextAnchor.MiddleCenter;
            titleStyle.fontStyle = FontStyle.Bold;
            titleStyle.fontSize = Mathf.Max(19, Screen.height / 35);
            titleStyle.normal.textColor = new Color(0.92f, 1f, 0.95f, 1f);

            hudStyle = new GUIStyle(GUI.skin.label);
            hudStyle.alignment = TextAnchor.MiddleCenter;
            hudStyle.fontStyle = FontStyle.Bold;
            hudStyle.fontSize = Mathf.Max(12, Screen.height / 58);
            hudStyle.normal.textColor = Color.white;

            smallStyle = new GUIStyle(GUI.skin.label);
            smallStyle.alignment = TextAnchor.MiddleCenter;
            smallStyle.fontSize = Mathf.Max(11, Screen.height / 66);
            smallStyle.normal.textColor = new Color(0.78f, 1f, 0.86f, 1f);

            cardStyle = new GUIStyle(GUI.skin.label);
            cardStyle.alignment = TextAnchor.MiddleCenter;
            cardStyle.fontStyle = FontStyle.Bold;
            cardStyle.fontSize = Mathf.Max(11, Screen.height / 67);
            cardStyle.normal.textColor = new Color(1f, 0.88f, 0.58f, 1f);

            buttonStyle = new GUIStyle(GUI.skin.button);
            buttonStyle.alignment = TextAnchor.MiddleCenter;
            buttonStyle.fontStyle = FontStyle.Bold;
            buttonStyle.fontSize = Mathf.Max(13, Screen.height / 58);

            endStyle = new GUIStyle(GUI.skin.label);
            endStyle.alignment = TextAnchor.MiddleCenter;
            endStyle.fontStyle = FontStyle.Bold;
            endStyle.fontSize = Mathf.Max(46, Screen.height / 10);
            endStyle.normal.textColor = new Color(0.95f, 1f, 0.92f, 1f);
        }

        private void CreateMaterials()
        {
            arenaMat = Mat("Arena stone", new Color(0.050f, 0.065f, 0.095f, 1f));
            wallMat = Mat("Arena wall", new Color(0.11f, 0.11f, 0.15f, 1f));
            playerZoneMat = Mat("Player zone", new Color(0.025f, 0.20f, 0.145f, 1f));
            enemyZoneMat = Mat("Enemy zone", new Color(0.16f, 0.035f, 0.20f, 1f));
            riverMat = Mat("Cursed river", new Color(0.02f, 1.0f, 0.48f, 1f));
            riverGlowMat = Mat("Cursed glow", new Color(0.28f, 1.0f, 0.58f, 1f));
            bridgeMat = Mat("Rotten bridge", new Color(0.34f, 0.22f, 0.12f, 1f));
            plankMat = Mat("Bridge planks", new Color(0.58f, 0.41f, 0.24f, 1f));
            playerMat = Mat("Player spectral", new Color(0.05f, 0.75f, 0.42f, 1f));
            enemyMat = Mat("Enemy cursed", new Color(0.65f, 0.12f, 0.92f, 1f));
            goblinMat = Mat("Grave Goblin", new Color(0.25f, 1.0f, 0.34f, 1f));
            goblinDarkMat = Mat("Goblin dark", new Color(0.07f, 0.22f, 0.10f, 1f));
            impMat = Mat("Candle Imp", new Color(1.0f, 0.42f, 0.10f, 1f));
            flameMat = Mat("Green flame", new Color(0.1f, 1.0f, 0.48f, 1f));
            boneMat = Mat("Bone", new Color(0.88f, 0.82f, 0.62f, 1f));
            darkMat = Mat("Dark trim", new Color(0.01f, 0.01f, 0.02f, 1f));
            stoneMat = Mat("Gravestone", new Color(0.36f, 0.38f, 0.42f, 1f));
            healthBackMat = Mat("Health back", new Color(0.05f, 0.01f, 0.02f, 1f));
            healthPlayerMat = Mat("Health player", new Color(0.05f, 1f, 0.3f, 1f));
            healthEnemyMat = Mat("Health enemy", new Color(1f, 0.08f, 0.18f, 1f));
            goldMat = Mat("Gold", new Color(1f, 0.72f, 0.18f, 1f));
            laneMat = Mat("Lane marker", new Color(0.12f, 0.36f, 0.25f, 1f));
        }

        private Material Mat(string name, Color color)
        {
            Shader shader = Shader.Find("Unlit/Color");
            if (shader == null) shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader == null) shader = Shader.Find("Standard");
            if (shader == null) shader = Shader.Find("Sprites/Default");

            Material material = new Material(shader);
            material.name = name;
            if (material.HasProperty("_Color")) material.SetColor("_Color", color);
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", color);
            material.color = color;
            return material;
        }

        private void SetupCamera()
        {
            cam = Camera.main;
            if (cam == null)
            {
                GameObject cameraObject = new GameObject("Main Camera");
                cameraObject.tag = "MainCamera";
                cam = cameraObject.AddComponent<Camera>();
            }

            cam.orthographic = true;
            cam.orthographicSize = 7.35f;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.014f, 0.012f, 0.030f, 1f);
            cam.transform.position = new Vector3(0f, 10.25f, -8.70f);
            cam.transform.rotation = Quaternion.Euler(60.5f, 0f, 0f);

            if (GameObject.Find("Moonlight") == null)
            {
                GameObject moon = new GameObject("Moonlight");
                Light light = moon.AddComponent<Light>();
                light.type = LightType.Directional;
                light.intensity = 1.25f;
                light.color = new Color(0.85f, 0.95f, 1f, 1f);
                moon.transform.rotation = Quaternion.Euler(48f, -30f, 10f);
            }

            if (GameObject.Find("Cursed Fill Light") == null)
            {
                GameObject fill = new GameObject("Cursed Fill Light");
                Light light = fill.AddComponent<Light>();
                light.type = LightType.Point;
                light.intensity = 2.4f;
                light.range = 8.0f;
                light.color = new Color(0.05f, 1f, 0.48f, 1f);
                fill.transform.position = new Vector3(0f, 2.2f, 0f);
            }
        }

        private void CreateArena()
        {
            if (GameObject.Find("Arena One Visual Floor") != null) return;

            Cube("Arena One Visual Floor", new Vector3(0f, -0.10f, 0f), new Vector3(9.1f, 0.12f, 13.8f), arenaMat);
            Cube("Player Deployment Zone", new Vector3(0f, -0.015f, -3.55f), new Vector3(8.65f, 0.035f, 5.95f), playerZoneMat);
            Cube("Enemy Zone", new Vector3(0f, -0.018f, 3.55f), new Vector3(8.65f, 0.035f, 5.95f), enemyZoneMat);

            Cube("Left Arena Wall", new Vector3(-4.65f, 0.22f, 0f), new Vector3(0.18f, 0.52f, 13.8f), wallMat);
            Cube("Right Arena Wall", new Vector3(4.65f, 0.22f, 0f), new Vector3(0.18f, 0.52f, 13.8f), wallMat);
            Cube("Top Arena Wall", new Vector3(0f, 0.22f, 6.94f), new Vector3(9.1f, 0.52f, 0.18f), wallMat);
            Cube("Bottom Arena Wall", new Vector3(0f, 0.22f, -6.94f), new Vector3(9.1f, 0.52f, 0.18f), wallMat);

            Cube("Cursed Separator Core", new Vector3(0f, 0.065f, 0f), new Vector3(8.75f, 0.10f, 0.72f), riverMat);
            Cube("Cursed Separator Glow", new Vector3(0f, 0.12f, 0f), new Vector3(8.95f, 0.035f, 0.98f), riverGlowMat);

            Bridge(-2.25f);
            Bridge(2.25f);

            for (int i = 0; i < laneXs.Length; i++)
            {
                Cube("Player Lane Strip", new Vector3(laneXs[i], 0.035f, -3.55f), new Vector3(0.12f, 0.035f, 5.25f), laneMat);
                Cube("Enemy Lane Strip", new Vector3(laneXs[i], 0.035f, 3.55f), new Vector3(0.12f, 0.035f, 5.25f), Mat("Enemy lane " + i, new Color(0.28f, 0.10f, 0.34f, 1f)));
            }

            WorldText("NIGHTMARE PARK", new Vector3(0f, 0.25f, 6.55f), 0.45f, Color.white);
            WorldText("ARENA ONE", new Vector3(0f, 0.18f, -0.95f), 0.32f, new Color(0.75f, 1f, 0.86f, 1f));

            Decor();
            Arch("Player Park Gate", new Vector3(0f, 0f, -6.62f), playerMat);
            Arch("Enemy Crypt Gate", new Vector3(0f, 0f, 6.62f), enemyMat);
        }

        private void Bridge(float x)
        {
            Cube("Rotten Bridge Base", new Vector3(x, 0.145f, 0f), new Vector3(1.35f, 0.16f, 1.46f), bridgeMat);

            for (int i = -2; i <= 2; i++)
            {
                GameObject plank = Cube("Bridge Plank", new Vector3(x + i * 0.28f, 0.26f, 0f), new Vector3(0.11f, 0.06f, 1.52f), i % 2 == 0 ? plankMat : boneMat);
                plank.transform.rotation = Quaternion.Euler(0f, D(i + 20, -5f, 5f), D(i + 40, -2f, 2f));
            }
        }

        private void Decor()
        {
            for (int i = 0; i < 18; i++)
            {
                float x = D(i + 4, -4.15f, 4.15f);
                float z = D(i + 44, -6.0f, 6.0f);
                if (Mathf.Abs(z) < 0.95f) z += z < 0f ? -1.20f : 1.20f;

                GameObject grave = Cube("Wonky Gravestone", new Vector3(x, 0.18f, z), new Vector3(0.30f, 0.46f, 0.08f), stoneMat);
                grave.transform.rotation = Quaternion.Euler(0f, D(i + 77, -18f, 18f), D(i + 89, -8f, 8f));
            }

            for (int i = 0; i < 12; i++)
            {
                float x = i % 2 == 0 ? -4.22f : 4.22f;
                float z = -5.8f + i * 0.95f;
                GameObject pumpkin = Sphere("Glowing Pumpkin", new Vector3(x, 0.16f, z), new Vector3(0.23f, 0.17f, 0.23f), i % 3 == 0 ? flameMat : impMat);
                pumpkin.AddComponent<SpinPulse>();
            }
        }

        private void Arch(string name, Vector3 position, Material material)
        {
            GameObject root = new GameObject(name);
            root.transform.position = position;

            GameObject left = Cube(name + " Left Pillar", Vector3.zero, new Vector3(0.28f, 1.15f, 0.28f), material);
            left.transform.SetParent(root.transform, false);
            left.transform.localPosition = new Vector3(-1.15f, 0.58f, 0f);

            GameObject right = Cube(name + " Right Pillar", Vector3.zero, new Vector3(0.28f, 1.15f, 0.28f), material);
            right.transform.SetParent(root.transform, false);
            right.transform.localPosition = new Vector3(1.15f, 0.58f, 0f);

            GameObject top = Cube(name + " Arch Top", Vector3.zero, new Vector3(2.55f, 0.25f, 0.28f), boneMat);
            top.transform.SetParent(root.transform, false);
            top.transform.localPosition = new Vector3(0f, 1.25f, 0f);
        }

        private void CreateBuildings()
        {
            if (playerCore != null) return;

            playerCore = BuildingObj("Player Pumpkin Shrine", Team.Player, true, new Vector3(0f, 0f, -6.05f), 500f, 0f, 0f, 0f, 1.15f);
            BuildingObj("Player Left Lantern Tower", Team.Player, false, new Vector3(-2.55f, 0f, -4.18f), 230f, 3.35f, 19f, 0.95f, 0.80f);
            BuildingObj("Player Right Lantern Tower", Team.Player, false, new Vector3(2.55f, 0f, -4.18f), 230f, 3.35f, 19f, 0.95f, 0.80f);

            enemyCore = BuildingObj("Enemy Crypt Core", Team.Enemy, true, new Vector3(0f, 0f, 6.05f), 500f, 0f, 0f, 0f, 1.15f);
            BuildingObj("Enemy Left Cursed Tower", Team.Enemy, false, new Vector3(-2.55f, 0f, 4.18f), 230f, 3.35f, 18f, 1.0f, 0.80f);
            BuildingObj("Enemy Right Cursed Tower", Team.Enemy, false, new Vector3(2.55f, 0f, 4.18f), 230f, 3.35f, 18f, 1.0f, 0.80f);
        }

        private Building BuildingObj(string name, Team team, bool core, Vector3 position, float hp, float range, float damage, float cooldown, float scale)
        {
            GameObject root = new GameObject(name);
            root.transform.position = position;

            Material main = team == Team.Player ? playerMat : enemyMat;

            GameObject baseBlock = Cube(name + " Base", Vector3.zero, new Vector3(scale, core ? 0.35f : 0.25f, scale), stoneMat);
            baseBlock.transform.SetParent(root.transform, false);
            baseBlock.transform.localPosition = new Vector3(0f, 0.18f, 0f);

            GameObject body = GameObject.CreatePrimitive(core ? PrimitiveType.Cylinder : PrimitiveType.Cube);
            body.name = name + " Body";
            body.transform.SetParent(root.transform, false);
            body.transform.localPosition = new Vector3(0f, core ? 0.70f : 0.58f, 0f);
            body.transform.localScale = core ? new Vector3(scale, 0.75f, scale) : new Vector3(scale * 0.82f, 0.95f, scale * 0.82f);
            body.GetComponent<Renderer>().sharedMaterial = main;

            GameObject glow = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            glow.name = name + " Glow";
            glow.transform.SetParent(root.transform, false);
            glow.transform.localPosition = new Vector3(0f, core ? 1.38f : 1.24f, 0f);
            glow.transform.localScale = new Vector3(scale * 0.46f, scale * 0.46f, scale * 0.46f);
            glow.GetComponent<Renderer>().sharedMaterial = core ? main : goldMat;
            glow.AddComponent<SpinPulse>();

            if (core)
            {
                GameObject crown = Cube(name + " Crown", Vector3.zero, new Vector3(scale * 1.25f, 0.16f, scale * 0.35f), boneMat);
                crown.transform.SetParent(root.transform, false);
                crown.transform.localPosition = new Vector3(0f, 1.72f, 0f);
            }

            Building building = new Building();
            building.team = team;
            building.core = core;
            building.root = root;
            building.transform = root.transform;
            building.hp = hp;
            building.maxHp = hp;
            building.range = range;
            building.damage = damage;
            building.cooldown = cooldown;
            building.timer = Mathf.Max(0.1f, cooldown * 0.5f);
            building.barWidth = core ? 1.22f : 0.86f;

            HealthBar(root.transform, team, core ? 1.95f : 1.56f, building.barWidth, out building.barFill);
            buildings.Add(building);

            return building;
        }

        private void TryDeploy(float x, string laneName)
        {
            if (energy < GoblinCost)
            {
                SetStatus("Not enough energy. Wait for the green bar.", 2.2f);
                return;
            }

            energy -= GoblinCost;
            SpawnGoblin(new Vector3(x, 0f, -5.38f));
            SetStatus("Grave Goblin deployed on the " + laneName + " lane.", 2.5f);
        }

        private void SpawnGoblin(Vector3 position)
        {
            Unit u = new Unit();
            u.team = Team.Player;
            u.hp = 100f;
            u.maxHp = 100f;
            u.speed = 1.95f;
            u.damage = 27f;
            u.range = 0.64f;
            u.cooldown = 0.70f;
            u.timer = 0.12f;
            u.barWidth = 0.62f;
            u.bobSeed = D(units.Count + 40, 0f, 6.28f);

            u.root = new GameObject("Player Grave Goblin");
            u.transform = u.root.transform;
            u.transform.position = position;

            GoblinVisual(u.root.transform);
            HealthBar(u.root.transform, u.team, 1.18f, u.barWidth, out u.barFill);

            units.Add(u);
            Puff(position + Vector3.up * 0.45f, goblinMat);
        }

        private void SpawnEnemyWave()
        {
            waveCount++;

            float[] lanes;
            if (waveCount % 4 == 0) lanes = new float[] { laneXs[0], laneXs[1], laneXs[2], laneXs[1] };
            else if (waveCount % 3 == 0) lanes = new float[] { laneXs[0], laneXs[1], laneXs[2] };
            else lanes = new float[] { -1.65f, 1.65f };

            for (int i = 0; i < lanes.Length; i++)
            {
                SpawnImp(new Vector3(lanes[i], 0f, 5.30f + i * 0.10f));
            }

            SetStatus("Candle Imp wave incoming.", 2.4f);
        }

        private void SpawnImp(Vector3 position)
        {
            Unit u = new Unit();
            u.team = Team.Enemy;
            u.hp = 64f + waveCount * 2f;
            u.maxHp = u.hp;
            u.speed = 1.36f;
            u.damage = 10f + waveCount * 0.35f;
            u.range = 0.84f;
            u.cooldown = 0.95f;
            u.timer = 0.25f;
            u.barWidth = 0.58f;
            u.bobSeed = D(units.Count + 80, 0f, 6.28f);

            u.root = new GameObject("Enemy Candle Imp");
            u.transform = u.root.transform;
            u.transform.position = position;

            ImpVisual(u.root.transform);
            HealthBar(u.root.transform, u.team, 1.14f, u.barWidth, out u.barFill);

            units.Add(u);
            Puff(position + Vector3.up * 0.45f, impMat);
        }

        private void GoblinVisual(Transform parent)
        {
            GameObject shadow = Sphere("Goblin Shadow", new Vector3(0f, 0.05f, 0f), new Vector3(0.45f, 0.04f, 0.32f), darkMat);
            shadow.transform.SetParent(parent, false);

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Goblin Body";
            body.transform.SetParent(parent, false);
            body.transform.localPosition = new Vector3(0f, 0.43f, 0f);
            body.transform.localScale = new Vector3(0.33f, 0.40f, 0.33f);
            body.GetComponent<Renderer>().sharedMaterial = goblinDarkMat;

            GameObject belly = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            belly.name = "Goblin Belly";
            belly.transform.SetParent(parent, false);
            belly.transform.localPosition = new Vector3(0f, 0.42f, 0.07f);
            belly.transform.localScale = new Vector3(0.36f, 0.28f, 0.32f);
            belly.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            head.name = "Goblin Head";
            head.transform.SetParent(parent, false);
            head.transform.localPosition = new Vector3(0f, 0.87f, 0.05f);
            head.transform.localScale = new Vector3(0.44f, 0.33f, 0.36f);
            head.GetComponent<Renderer>().sharedMaterial = goblinMat;

            GameObject eyes = Cube("Goblin Angry Eyes", new Vector3(0f, 0.94f, 0.225f), new Vector3(0.20f, 0.045f, 0.035f), darkMat);
            eyes.transform.SetParent(parent, false);

            GameObject dagger = Cube("Bone Dagger", new Vector3(0.30f, 0.55f, 0.35f), new Vector3(0.08f, 0.08f, 0.56f), boneMat);
            dagger.transform.SetParent(parent, false);
            dagger.transform.localRotation = Quaternion.Euler(18f, 12f, -8f);
        }

        private void ImpVisual(Transform parent)
        {
            GameObject shadow = Sphere("Imp Shadow", new Vector3(0f, 0.05f, 0f), new Vector3(0.40f, 0.035f, 0.30f), darkMat);
            shadow.transform.SetParent(parent, false);

            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.name = "Imp Wax Body";
            body.transform.SetParent(parent, false);
            body.transform.localPosition = new Vector3(0f, 0.38f, 0f);
            body.transform.localScale = new Vector3(0.30f, 0.38f, 0.30f);
            body.GetComponent<Renderer>().sharedMaterial = impMat;

            GameObject face = Cube("Imp Face", new Vector3(0f, 0.56f, 0.23f), new Vector3(0.22f, 0.06f, 0.035f), darkMat);
            face.transform.SetParent(parent, false);

            GameObject flame = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            flame.name = "Imp Green Flame";
            flame.transform.SetParent(parent, false);
            flame.transform.localPosition = new Vector3(0f, 0.92f, 0f);
            flame.transform.localScale = new Vector3(0.22f, 0.34f, 0.22f);
            flame.GetComponent<Renderer>().sharedMaterial = flameMat;
            flame.AddComponent<SpinPulse>();
        }

        private void UpdateUnits(float dt)
        {
            for (int i = 0; i < units.Count; i++)
            {
                Unit u = units[i];
                if (u.hp <= 0f) continue;

                u.timer -= dt;

                float bob = Mathf.Sin(Time.time * (u.team == Team.Player ? 9.0f : 6.0f) + u.bobSeed) * 0.04f;
                Vector3 pos = u.transform.position;
                u.transform.position = new Vector3(pos.x, bob, pos.z);

                object target = FindTarget(u);
                if (target == null) continue;

                Vector3 targetPos = TargetPos(target);
                float dist = Vector3.Distance(Flat(u.transform.position), Flat(targetPos));

                if (dist <= u.range)
                {
                    if (u.timer <= 0f)
                    {
                        u.timer = u.cooldown;
                        Damage(target, u.damage);
                        Strike(u.transform.position + Vector3.up * 0.55f, targetPos + Vector3.up * 0.70f, u.team);
                    }
                }
                else
                {
                    MoveTowards(u, targetPos, dt);
                }
            }
        }

        private object FindTarget(Unit u)
        {
            Team enemy = u.team == Team.Player ? Team.Enemy : Team.Player;

            Unit nearestUnit = null;
            float nearestUnitDist = 999f;
            for (int i = 0; i < units.Count; i++)
            {
                Unit other = units[i];
                if (other.hp <= 0f || other.team != enemy) continue;

                float d = Vector3.Distance(Flat(u.transform.position), Flat(other.transform.position));
                if (d < nearestUnitDist)
                {
                    nearestUnitDist = d;
                    nearestUnit = other;
                }
            }

            Building nearestBuilding = null;
            float nearestBuildingDist = 999f;
            for (int i = 0; i < buildings.Count; i++)
            {
                Building b = buildings[i];
                if (b.hp <= 0f || b.team != enemy) continue;

                float d = Vector3.Distance(Flat(u.transform.position), Flat(b.transform.position));
                if (d < nearestBuildingDist)
                {
                    nearestBuildingDist = d;
                    nearestBuilding = b;
                }
            }

            if (nearestUnit != null && nearestUnitDist < 2.25f) return nearestUnit;
            if (nearestBuilding != null) return nearestBuilding;
            return nearestUnit;
        }

        private Vector3 TargetPos(object target)
        {
            Unit u = target as Unit;
            if (u != null) return u.transform.position;

            Building b = target as Building;
            if (b != null) return b.transform.position;

            return Vector3.zero;
        }

        private void MoveTowards(Unit u, Vector3 targetPos, float dt)
        {
            Vector3 current = u.transform.position;
            Vector3 waypoint = BridgeWaypoint(current, targetPos);
            Vector3 dir = Flat(waypoint) - Flat(current);

            if (dir.sqrMagnitude < 0.04f) dir = Flat(targetPos) - Flat(current);
            if (dir.sqrMagnitude < 0.001f) return;

            dir.Normalize();

            Vector3 next = current + dir * u.speed * dt;
            next.x = Mathf.Clamp(next.x, -4.2f, 4.2f);
            next.z = Mathf.Clamp(next.z, -6.25f, 6.25f);

            u.transform.position = next;
            u.transform.rotation = Quaternion.Slerp(u.transform.rotation, Quaternion.LookRotation(dir, Vector3.up), dt * 13f);
        }

        private Vector3 BridgeWaypoint(Vector3 current, Vector3 target)
        {
            bool crossing = (current.z < -0.45f && target.z > 0.45f) || (current.z > 0.45f && target.z < -0.45f);
            if (!crossing) return target;

            float bridgeX = Mathf.Abs(current.x + 2.25f) < Mathf.Abs(current.x - 2.25f) ? -2.25f : 2.25f;

            if (current.z < -0.45f)
            {
                if (current.z < -0.72f || Mathf.Abs(current.x - bridgeX) > 0.23f) return new Vector3(bridgeX, 0f, -0.72f);
                return new Vector3(bridgeX, 0f, 0.72f);
            }

            if (current.z > 0.45f)
            {
                if (current.z > 0.72f || Mathf.Abs(current.x - bridgeX) > 0.23f) return new Vector3(bridgeX, 0f, 0.72f);
                return new Vector3(bridgeX, 0f, -0.72f);
            }

            return target;
        }

        private void UpdateTowers(float dt)
        {
            for (int i = 0; i < buildings.Count; i++)
            {
                Building b = buildings[i];
                if (b.hp <= 0f || b.core || b.range <= 0f) continue;

                b.timer -= dt;
                if (b.timer > 0f) continue;

                Unit target = NearestEnemyUnit(b);
                if (target == null) continue;

                b.timer = b.cooldown;
                target.hp -= b.damage;
                Strike(b.transform.position + Vector3.up * 1.25f, target.transform.position + Vector3.up * 0.55f, b.team);
            }
        }

        private Unit NearestEnemyUnit(Building b)
        {
            Team enemy = b.team == Team.Player ? Team.Enemy : Team.Player;
            Unit best = null;
            float bestDistance = b.range;

            for (int i = 0; i < units.Count; i++)
            {
                Unit u = units[i];
                if (u.hp <= 0f || u.team != enemy) continue;

                float d = Vector3.Distance(Flat(b.transform.position), Flat(u.transform.position));
                if (d < bestDistance)
                {
                    bestDistance = d;
                    best = u;
                }
            }

            return best;
        }

        private void Damage(object target, float amount)
        {
            Unit u = target as Unit;
            if (u != null)
            {
                u.hp -= amount;
                return;
            }

            Building b = target as Building;
            if (b != null) b.hp -= amount;
        }

        private void RemoveDead()
        {
            for (int i = units.Count - 1; i >= 0; i--)
            {
                if (units[i].hp > 0f) continue;

                if (units[i].team == Team.Enemy) skulls++;
                Puff(units[i].transform.position + Vector3.up * 0.45f, units[i].team == Team.Player ? goblinMat : impMat);
                Destroy(units[i].root);
                units.RemoveAt(i);
            }

            for (int i = 0; i < buildings.Count; i++)
            {
                Building b = buildings[i];
                if (b.hp <= 0f && b.root.activeSelf)
                {
                    Puff(b.transform.position + Vector3.up * 0.85f, b.team == Team.Player ? playerMat : enemyMat);
                    b.root.SetActive(false);
                }
            }
        }

        private void UpdateHealthBars()
        {
            for (int i = 0; i < units.Count; i++) UpdateBar(units[i].barFill, units[i].hp, units[i].maxHp, units[i].barWidth);
            for (int i = 0; i < buildings.Count; i++) UpdateBar(buildings[i].barFill, buildings[i].hp, buildings[i].maxHp, buildings[i].barWidth);
        }

        private void UpdateBar(GameObject fill, float hp, float maxHp, float width)
        {
            if (fill == null) return;

            float pct = Mathf.Clamp01(hp / maxHp);
            Vector3 scale = fill.transform.localScale;
            scale.x = Mathf.Max(0.01f, width * pct);
            fill.transform.localScale = scale;
        }

        private void CheckEnd()
        {
            if (enemyCore.hp <= 0f)
            {
                gameEnded = true;
                SetStatus("Victory. Enemy crypt destroyed.", 999f);
                return;
            }

            if (playerCore.hp <= 0f)
            {
                gameEnded = true;
                SetStatus("Defeat. Your shrine has fallen.", 999f);
            }
        }

        private void Strike(Vector3 start, Vector3 end, Team team)
        {
            GameObject strike = new GameObject("Spectral Strike");
            LineRenderer line = strike.AddComponent<LineRenderer>();
            line.positionCount = 3;
            line.SetPosition(0, start);
            line.SetPosition(1, (start + end) * 0.5f + Vector3.up * 0.18f);
            line.SetPosition(2, end);
            line.startWidth = 0.10f;
            line.endWidth = 0.025f;
            line.material = team == Team.Player ? healthPlayerMat : healthEnemyMat;

            GameObject spark = Sphere("Hit Spark", end, new Vector3(0.14f, 0.14f, 0.14f), team == Team.Player ? riverGlowMat : impMat);
            Destroy(spark, 0.18f);
            Destroy(strike, 0.16f);
        }

        private void Puff(Vector3 position, Material material)
        {
            for (int i = 0; i < 4; i++)
            {
                GameObject puff = Sphere("Death Puff", position + new Vector3(D(i + 2, -0.12f, 0.12f), D(i + 7, 0f, 0.2f), D(i + 15, -0.12f, 0.12f)), new Vector3(0.17f, 0.17f, 0.17f), material);
                puff.AddComponent<SpinPulse>();
                Destroy(puff, 0.55f);
            }
        }

        private void HealthBar(Transform parent, Team team, float height, float width, out GameObject fill)
        {
            GameObject back = Cube("Health Bar Back", Vector3.zero, new Vector3(width, 0.08f, 0.08f), healthBackMat);
            back.transform.SetParent(parent, false);
            back.transform.localPosition = new Vector3(0f, height, 0f);

            fill = Cube("Health Bar Fill", Vector3.zero, new Vector3(width, 0.09f, 0.09f), team == Team.Player ? healthPlayerMat : healthEnemyMat);
            fill.transform.SetParent(parent, false);
            fill.transform.localPosition = new Vector3(0f, height + 0.012f, -0.015f);
        }

        private GameObject Cube(string name, Vector3 position, Vector3 scale, Material material)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = scale;
            go.GetComponent<Renderer>().sharedMaterial = material;
            return go;
        }

        private GameObject Sphere(string name, Vector3 position, Vector3 scale, Material material)
        {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            go.name = name;
            go.transform.position = position;
            go.transform.localScale = scale;
            go.GetComponent<Renderer>().sharedMaterial = material;
            return go;
        }

        private void WorldText(string text, Vector3 position, float size, Color color)
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

        private Vector3 Flat(Vector3 v)
        {
            return new Vector3(v.x, 0f, v.z);
        }

        private float D(int seed, float min, float max)
        {
            float v = Mathf.Sin(seed * 12.9898f) * 43758.5453f;
            v = v - Mathf.Floor(v);
            return Mathf.Lerp(min, max, v);
        }

        private void SetStatus(string text, float seconds)
        {
            status = text;
            statusTimer = seconds;
        }
    }

    public class SpinPulse : MonoBehaviour
    {
        private Vector3 baseScale;
        private float seed;

        private void Awake()
        {
            baseScale = transform.localScale;
            seed = transform.position.x * 2.17f + transform.position.z * 3.11f;
        }

        private void Update()
        {
            transform.Rotate(0f, 50f * Time.deltaTime, 0f);
            float pulse = 1f + Mathf.Sin(Time.time * 3.5f + seed) * 0.06f;
            transform.localScale = baseScale * pulse;
        }
    }
}
