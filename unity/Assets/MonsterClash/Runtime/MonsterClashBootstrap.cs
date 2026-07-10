using System.Collections.Generic;
using UnityEngine;

namespace MonsterClash
{
    public sealed class MonsterClashBootstrap : MonoBehaviour
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void EnsureBattleExists()
        {
            if (FindFirstObjectByType<BattleDirector>() != null) return;
            GameObject bootstrap = new GameObject("Monster Clash Bootstrap");
            bootstrap.AddComponent<MonsterClashBootstrap>().BuildBattle();
        }

        private void BuildBattle()
        {
            Application.targetFrameRate = Application.isMobilePlatform ? 30 : 60;
            QualitySettings.vSyncCount = 0;
            Screen.orientation = ScreenOrientation.Portrait;

            Camera battleCamera = CreateCamera();
            CreateLighting();

            Transform arenaRoot = new GameObject("Arena One").transform;
            ArenaLayout arena = arenaRoot.gameObject.AddComponent<ArenaLayout>();
            CreateArenaGeometry(arenaRoot);

            Transform unitsRoot = new GameObject("Spawned Monsters").transform;
            unitsRoot.SetParent(transform, false);

            BattleDirector director = new GameObject("Battle Director").AddComponent<BattleDirector>();
            director.transform.SetParent(transform, false);
            List<MonsterCard> deck = CreateStarterDeck();
            director.Initialise(arena, unitsRoot, deck);

            CreateTowers(arenaRoot, director);
            CreateDeploymentOverlay(arenaRoot, director);

            BattleHud hud = director.gameObject.AddComponent<BattleHud>();
            hud.Initialise(director);

            BattleInputController input = director.gameObject.AddComponent<BattleInputController>();
            input.Initialise(director, battleCamera, hud);
        }

        private static Camera CreateCamera()
        {
            Camera existing = Camera.main;
            if (existing != null)
            {
                Destroy(existing.gameObject);
            }

            GameObject cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.orthographic = true;
            camera.orthographicSize = 7.8f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.012f, 0.008f, 0.025f, 1f);
            camera.nearClipPlane = 0.1f;
            camera.farClipPlane = 80f;
            camera.transform.position = new Vector3(0f, 12.2f, -10.8f);
            camera.transform.LookAt(new Vector3(0f, 0f, 0.25f));
            cameraObject.AddComponent<AudioListener>();
            cameraObject.AddComponent<PortraitCameraFit>();
            return camera;
        }

        private static void CreateLighting()
        {
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.16f, 0.19f, 0.32f, 1f);
            RenderSettings.ambientEquatorColor = new Color(0.08f, 0.12f, 0.16f, 1f);
            RenderSettings.ambientGroundColor = new Color(0.018f, 0.025f, 0.035f, 1f);
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogColor = new Color(0.035f, 0.02f, 0.07f, 1f);
            RenderSettings.fogDensity = 0.018f;

            GameObject moon = new GameObject("Moonlight");
            Light moonLight = moon.AddComponent<Light>();
            moonLight.type = LightType.Directional;
            moonLight.intensity = 1.15f;
            moonLight.color = new Color(0.68f, 0.78f, 1f, 1f);
            moon.transform.rotation = Quaternion.Euler(48f, -34f, 6f);

            CreatePointLight("Cursed river light", new Vector3(0f, 1.2f, 0f), new Color(0.05f, 1f, 0.48f, 1f), 3.2f, 8.5f);
            CreatePointLight("Enemy crypt light", new Vector3(0f, 2.1f, 5.8f), new Color(0.72f, 0.12f, 1f, 1f), 2.1f, 6.5f);
            CreatePointLight("Player crypt light", new Vector3(0f, 2.1f, -5.8f), new Color(0.08f, 0.9f, 0.58f, 1f), 1.6f, 5.5f);
        }

        private static void CreatePointLight(string name, Vector3 position, Color colour, float intensity, float range)
        {
            GameObject lightObject = new GameObject(name);
            lightObject.transform.position = position;
            Light light = lightObject.AddComponent<Light>();
            light.type = LightType.Point;
            light.color = colour;
            light.intensity = intensity;
            light.range = range;
        }

        private static void CreateArenaGeometry(Transform root)
        {
            Material foundation = RuntimeArt.CreateMaterial("Arena foundation", new Color(0.025f, 0.022f, 0.045f, 1f));
            Material stone = RuntimeArt.CreateMaterial("Haunted stone", new Color(0.13f, 0.14f, 0.19f, 1f));
            Material path = RuntimeArt.CreateMaterial("Battle path", new Color(0.19f, 0.18f, 0.23f, 1f));
            Material wall = RuntimeArt.CreateMaterial("Park wall", new Color(0.055f, 0.045f, 0.085f, 1f));
            Material river = RuntimeArt.CreateMaterial("Cursed river", new Color(0.04f, 0.9f, 0.42f, 1f), true);
            Material bridge = RuntimeArt.CreateMaterial("Rotten bridge", new Color(0.28f, 0.16f, 0.09f, 1f));
            Material iron = RuntimeArt.CreateMaterial("Black iron", new Color(0.025f, 0.02f, 0.035f, 1f));
            Material flame = RuntimeArt.CreateMaterial("Green flame", new Color(0.15f, 1f, 0.42f, 1f), true);

            RuntimeArt.Part(PrimitiveType.Cube, "Arena foundation", root, new Vector3(0f, -0.18f, 0f), new Vector3(9.7f, 0.3f, 14.5f), foundation);
            RuntimeArt.Part(PrimitiveType.Cube, "Arena stone", root, new Vector3(0f, -0.01f, 0f), new Vector3(9.0f, 0.08f, 13.8f), stone);

            RuntimeArt.Part(PrimitiveType.Cube, "Left battle path", root, new Vector3(-BattleBalance.BridgeX, 0.045f, 0f), new Vector3(1.65f, 0.045f, 13.1f), path);
            RuntimeArt.Part(PrimitiveType.Cube, "Right battle path", root, new Vector3(BattleBalance.BridgeX, 0.045f, 0f), new Vector3(1.65f, 0.045f, 13.1f), path);
            RuntimeArt.Part(PrimitiveType.Cube, "Cross path", root, new Vector3(0f, 0.052f, -4.1f), new Vector3(5.6f, 0.04f, 1.4f), path);
            RuntimeArt.Part(PrimitiveType.Cube, "Enemy cross path", root, new Vector3(0f, 0.052f, 4.1f), new Vector3(5.6f, 0.04f, 1.4f), path);

            RuntimeArt.Part(PrimitiveType.Cube, "Cursed river", root, new Vector3(0f, 0.03f, 0f), new Vector3(9.15f, 0.10f, 1.08f), river);
            CreateBridge(root, -BattleBalance.BridgeX, bridge, iron, flame);
            CreateBridge(root, BattleBalance.BridgeX, bridge, iron, flame);

            RuntimeArt.Part(PrimitiveType.Cube, "Left boundary", root, new Vector3(-4.68f, 0.34f, 0f), new Vector3(0.24f, 0.78f, 14.3f), wall);
            RuntimeArt.Part(PrimitiveType.Cube, "Right boundary", root, new Vector3(4.68f, 0.34f, 0f), new Vector3(0.24f, 0.78f, 14.3f), wall);
            RuntimeArt.Part(PrimitiveType.Cube, "Enemy boundary", root, new Vector3(0f, 0.34f, 7.12f), new Vector3(9.5f, 0.78f, 0.24f), wall);
            RuntimeArt.Part(PrimitiveType.Cube, "Player boundary", root, new Vector3(0f, 0.34f, -7.12f), new Vector3(9.5f, 0.78f, 0.24f), wall);

            CreateArenaProps(root, wall, stone, flame);
        }

        private static void CreateBridge(Transform root, float x, Material wood, Material iron, Material flame)
        {
            RuntimeArt.Part(PrimitiveType.Cube, "Bridge deck", root, new Vector3(x, 0.15f, 0f), new Vector3(1.42f, 0.18f, 1.52f), wood);

            for (int i = -3; i <= 3; i++)
            {
                RuntimeArt.Part(PrimitiveType.Cube, "Bridge plank", root, new Vector3(x + i * 0.19f, 0.26f, 0f), new Vector3(0.15f, 0.07f, 1.42f), i % 2 == 0 ? wood : iron);
            }

            RuntimeArt.Part(PrimitiveType.Cylinder, "Bridge left flame", root, new Vector3(x - 0.78f, 0.42f, 0f), new Vector3(0.11f, 0.4f, 0.11f), flame);
            RuntimeArt.Part(PrimitiveType.Cylinder, "Bridge right flame", root, new Vector3(x + 0.78f, 0.42f, 0f), new Vector3(0.11f, 0.4f, 0.11f), flame);
        }

        private static void CreateArenaProps(Transform root, Material wall, Material stone, Material flame)
        {
            Random.State previous = Random.state;
            Random.InitState(1978);

            for (int i = 0; i < 26; i++)
            {
                float side = i % 2 == 0 ? -1f : 1f;
                float x = side * Random.Range(3.35f, 4.15f);
                float z = Random.Range(-6.35f, 6.35f);
                float height = Random.Range(0.45f, 0.85f);
                RuntimeArt.Part(
                    PrimitiveType.Cube,
                    "Crooked gravestone",
                    root,
                    new Vector3(x, height * 0.5f, z),
                    new Vector3(Random.Range(0.24f, 0.42f), height, Random.Range(0.14f, 0.24f)),
                    stone,
                    new Vector3(Random.Range(-5f, 5f), Random.Range(-18f, 18f), Random.Range(-8f, 8f)));
            }

            for (int i = 0; i < 8; i++)
            {
                float x = i % 2 == 0 ? -4.28f : 4.28f;
                float z = -5.6f + (i / 2) * 3.7f;
                RuntimeArt.Part(PrimitiveType.Cylinder, "Boundary brazier", root, new Vector3(x, 0.76f, z), new Vector3(0.13f, 0.72f, 0.13f), wall);
                RuntimeArt.Part(PrimitiveType.Sphere, "Brazier flame", root, new Vector3(x, 1.45f, z), new Vector3(0.21f, 0.34f, 0.21f), flame);
            }

            Random.state = previous;
        }

        private static void CreateTowers(Transform arenaRoot, BattleDirector director)
        {
            CreateTower(arenaRoot, director, BattleTeam.Player, false, new Vector3(-2.65f, 0.08f, -4.3f));
            CreateTower(arenaRoot, director, BattleTeam.Player, false, new Vector3(2.65f, 0.08f, -4.3f));
            CreateTower(arenaRoot, director, BattleTeam.Player, true, new Vector3(0f, 0.08f, -6.15f));

            CreateTower(arenaRoot, director, BattleTeam.Enemy, false, new Vector3(-2.65f, 0.08f, 4.3f));
            CreateTower(arenaRoot, director, BattleTeam.Enemy, false, new Vector3(2.65f, 0.08f, 4.3f));
            CreateTower(arenaRoot, director, BattleTeam.Enemy, true, new Vector3(0f, 0.08f, 6.15f));
        }

        private static void CreateTower(Transform parent, BattleDirector director, BattleTeam team, bool core, Vector3 position)
        {
            GameObject root = new GameObject(team + (core ? " Heart Tower" : " Defence Tower"));
            root.transform.SetParent(parent, false);
            root.transform.localPosition = position;

            BattleHealth health = root.AddComponent<BattleHealth>();
            root.AddComponent<CombatTarget>();
            DefenceTower tower = root.AddComponent<DefenceTower>();

            Material stone = RuntimeArt.CreateMaterial(team + " tower stone", team == BattleTeam.Player
                ? new Color(0.08f, 0.19f, 0.16f, 1f)
                : new Color(0.19f, 0.07f, 0.22f, 1f));
            Material trim = RuntimeArt.CreateMaterial(team + " tower trim", BattleBalance.TeamColour(team), true);
            Material dark = RuntimeArt.CreateMaterial("Tower iron", new Color(0.025f, 0.018f, 0.04f, 1f));

            float scale = core ? 1.22f : 0.92f;
            RuntimeArt.Part(PrimitiveType.Cylinder, "Foundation", root.transform, new Vector3(0f, 0.32f, 0f), new Vector3(0.72f * scale, 0.32f, 0.72f * scale), stone);
            RuntimeArt.Part(PrimitiveType.Cube, "Crypt body", root.transform, new Vector3(0f, 0.88f * scale, 0f), new Vector3(0.92f * scale, 1.05f * scale, 0.82f * scale), stone);
            RuntimeArt.Part(PrimitiveType.Cylinder, "Cursed crown", root.transform, new Vector3(0f, 1.48f * scale, 0f), new Vector3(0.58f * scale, 0.28f, 0.58f * scale), dark);
            RuntimeArt.Part(PrimitiveType.Sphere, core ? "Heart flame" : "Tower flame", root.transform, new Vector3(0f, 1.83f * scale, 0f), new Vector3(0.32f, core ? 0.52f : 0.38f, 0.32f), trim);

            Transform muzzle = new GameObject("Muzzle").transform;
            muzzle.SetParent(root.transform, false);
            muzzle.localPosition = new Vector3(0f, 1.7f * scale, 0f);

            float hp = core ? 1900f : 1150f;
            float range = core ? 4.35f : 3.65f;
            tower.Initialise(director, team, core, hp, range, core ? 54f : 46f, core ? 0.78f : 0.9f, muzzle);
            CreateTowerHealthBar(root.transform, health, team, core ? 1.25f : 0.95f, core ? 2.65f : 2.08f);
            director.RegisterTower(tower);
        }

        private static void CreateTowerHealthBar(Transform parent, BattleHealth health, BattleTeam team, float width, float height)
        {
            Transform bar = new GameObject("Tower health bar").transform;
            bar.SetParent(parent, false);
            bar.localPosition = new Vector3(0f, height, 0f);
            Material back = RuntimeArt.CreateMaterial("Tower health back", new Color(0.025f, 0.01f, 0.02f, 1f));
            Material colour = RuntimeArt.CreateMaterial(team + " tower health", BattleBalance.TeamColour(team), true);
            RuntimeArt.Part(PrimitiveType.Cube, "Back", bar, Vector3.zero, new Vector3(width + 0.08f, 0.12f, 0.045f), back);
            Transform fill = RuntimeArt.Part(PrimitiveType.Cube, "Fill", bar, new Vector3(0f, 0f, -0.03f), new Vector3(width, 0.075f, 0.04f), colour).transform;
            bar.gameObject.AddComponent<WorldHealthBar>().Initialise(health, fill, width);
        }

        private static void CreateDeploymentOverlay(Transform parent, BattleDirector director)
        {
            Color colour = new Color(0.08f, 1f, 0.48f, 0.14f);
            Material material = RuntimeArt.CreateMaterial("Deployment overlay", colour, true, true);
            GameObject overlay = RuntimeArt.Part(
                PrimitiveType.Cube,
                "Player deployment overlay",
                parent,
                new Vector3(0f, 0.09f, -3.82f),
                new Vector3(8.55f, 0.025f, 5.62f),
                material);
            overlay.AddComponent<DeploymentOverlay>().Initialise(director, overlay.GetComponent<Renderer>(), colour);
        }

        private static List<MonsterCard> CreateStarterDeck()
        {
            List<MonsterCard> cards = new List<MonsterCard>
            {
                Card("grave_goblin", "Grave Goblin", MonsterArchetype.GraveGoblin, 2, 270f, 58f, 0.72f, 0.82f, 3.05f, new Color(0.37f, 0.82f, 0.18f, 1f), "Fast melee pressure."),
                Card("candle_imp", "Candle Imp", MonsterArchetype.CandleImp, 3, 220f, 44f, 0.9f, 3.0f, 2.45f, new Color(0.72f, 0.2f, 0.92f, 1f), "Ranged fire support."),
                Card("tin_bat", "Tin Bat", MonsterArchetype.TinBat, 2, 175f, 38f, 0.62f, 0.75f, 3.4f, new Color(0.34f, 0.62f, 0.72f, 1f), "Flying bridge bypass."),
                Card("mirror_clown", "Mirror Clown", MonsterArchetype.MirrorClown, 4, 420f, 66f, 1.0f, 1.0f, 2.15f, new Color(0.36f, 0.22f, 0.8f, 1f), "Durable lane controller."),
                Card("zombie_runner", "Zombie Runner", MonsterArchetype.ZombieRunner, 3, 245f, 49f, 0.58f, 0.78f, 3.75f, new Color(0.48f, 0.65f, 0.28f, 1f), "Rapid tower hunter."),
                Card("bone_brute", "Bone Brute", MonsterArchetype.BoneBrute, 5, 980f, 96f, 1.18f, 0.95f, 1.6f, new Color(0.38f, 0.25f, 0.5f, 1f), "Heavy frontline tank."),
                Card("phantom_bride", "Phantom Bride", MonsterArchetype.PhantomBride, 4, 390f, 54f, 0.95f, 2.7f, 2.35f, new Color(0.28f, 0.78f, 0.9f, 1f), "Spectral ranged support."),
                Card("werewolf_king", "Werewolf King", MonsterArchetype.WerewolfKing, 6, 860f, 132f, 1.05f, 1.05f, 2.35f, new Color(0.28f, 0.24f, 0.42f, 1f), "Legendary bruiser.")
            };

            cards[2].Flying = true;
            cards[4].TargetPreference = TargetPreference.Buildings;
            cards[5].VisualScale = 1.12f;
            cards[7].VisualScale = 1.18f;
            return cards;
        }

        private static MonsterCard Card(
            string id,
            string displayName,
            MonsterArchetype archetype,
            int cost,
            float health,
            float damage,
            float attackInterval,
            float attackRange,
            float moveSpeed,
            Color accent,
            string description)
        {
            MonsterCard card = ScriptableObject.CreateInstance<MonsterCard>();
            card.name = displayName + " Card";
            card.Configure(id, displayName, archetype, cost, health, damage, attackInterval, attackRange, moveSpeed, accent);
            card.Description = description;
            return card;
        }
    }
}
