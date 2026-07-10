using UnityEngine;

namespace MonsterClash
{
    public static class MonsterFactory
    {
        public static MonsterActor Create(
            MonsterCard card,
            BattleTeam team,
            ArenaLayout arena,
            Vector3 point,
            Transform parent)
        {
            GameObject root = new GameObject(team + " " + card.DisplayName);
            root.transform.SetParent(parent, false);
            root.transform.position = point;
            root.transform.rotation = team == BattleTeam.Player ? Quaternion.identity : Quaternion.Euler(0f, 180f, 0f);

            BattleHealth health = root.AddComponent<BattleHealth>();
            root.AddComponent<CombatTarget>();
            MonsterActor actor = root.AddComponent<MonsterActor>();

            Transform visual = new GameObject("Visual").transform;
            visual.SetParent(root.transform, false);

            CreateTeamRing(visual, team, card.VisualScale);

            if (card.ModelPrefab != null)
            {
                Object.Instantiate(card.ModelPrefab, visual, false);
            }
            else
            {
                CreateProceduralMonster(card, visual);
            }

            CreateHealthBar(root.transform, health, team, card.VisualScale);
            actor.Initialise(card, team, arena, visual);
            return actor;
        }

        private static void CreateProceduralMonster(MonsterCard card, Transform root)
        {
            Material accent = RuntimeArt.CreateMaterial(card.DisplayName + " accent", card.AccentColour);
            Material dark = RuntimeArt.CreateMaterial(card.DisplayName + " dark", Color.Lerp(card.AccentColour, new Color(0.025f, 0.018f, 0.04f), 0.72f));
            Material bone = RuntimeArt.CreateMaterial("Old bone", new Color(0.86f, 0.79f, 0.61f, 1f));
            Material eye = RuntimeArt.CreateMaterial("Monster eyes", new Color(0.68f, 1f, 0.22f, 1f), true);

            switch (card.Archetype)
            {
                case MonsterArchetype.GraveGoblin:
                    Goblin(root, accent, dark, bone, eye);
                    break;
                case MonsterArchetype.CandleImp:
                    CandleImp(root, accent, dark, eye);
                    break;
                case MonsterArchetype.TinBat:
                    TinBat(root, accent, dark, eye);
                    break;
                case MonsterArchetype.MirrorClown:
                    MirrorClown(root, accent, dark, bone, eye);
                    break;
                case MonsterArchetype.ZombieRunner:
                    ZombieRunner(root, accent, dark, bone, eye);
                    break;
                case MonsterArchetype.BoneBrute:
                    BoneBrute(root, accent, dark, bone, eye);
                    break;
                case MonsterArchetype.PhantomBride:
                    PhantomBride(root, accent, dark, eye);
                    break;
                case MonsterArchetype.WerewolfKing:
                    Werewolf(root, accent, dark, bone, eye);
                    break;
            }
        }

        private static void Goblin(Transform root, Material skin, Material cloth, Material bone, Material eye)
        {
            RuntimeArt.Part(PrimitiveType.Capsule, "Body", root, new Vector3(0f, 0.48f, 0f), new Vector3(0.36f, 0.42f, 0.3f), cloth);
            RuntimeArt.Part(PrimitiveType.Sphere, "Head", root, new Vector3(0f, 0.91f, 0.04f), new Vector3(0.57f, 0.48f, 0.48f), skin);
            RuntimeArt.Part(PrimitiveType.Capsule, "Left ear", root, new Vector3(-0.38f, 0.94f, 0.03f), new Vector3(0.12f, 0.35f, 0.12f), skin, new Vector3(0f, 0f, 67f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Right ear", root, new Vector3(0.38f, 0.94f, 0.03f), new Vector3(0.12f, 0.35f, 0.12f), skin, new Vector3(0f, 0f, -67f));
            Eyes(root, eye, 0.17f, 1.0f, 0.43f, 0.09f);
            RuntimeArt.Part(PrimitiveType.Cylinder, "Bone club", root, new Vector3(0.43f, 0.48f, 0.08f), new Vector3(0.07f, 0.42f, 0.07f), bone, new Vector3(25f, 0f, -22f));
        }

        private static void CandleImp(Transform root, Material skin, Material cloth, Material eye)
        {
            Material flame = RuntimeArt.CreateMaterial("Imp flame", new Color(1f, 0.34f, 0.04f, 1f), true);
            RuntimeArt.Part(PrimitiveType.Capsule, "Body", root, new Vector3(0f, 0.48f, 0f), new Vector3(0.32f, 0.42f, 0.3f), skin);
            RuntimeArt.Part(PrimitiveType.Sphere, "Head", root, new Vector3(0f, 0.9f, 0.02f), new Vector3(0.46f, 0.42f, 0.42f), skin);
            RuntimeArt.Part(PrimitiveType.Capsule, "Left horn", root, new Vector3(-0.2f, 1.18f, 0f), new Vector3(0.07f, 0.23f, 0.07f), cloth, new Vector3(0f, 0f, -25f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Right horn", root, new Vector3(0.2f, 1.18f, 0f), new Vector3(0.07f, 0.23f, 0.07f), cloth, new Vector3(0f, 0f, 25f));
            RuntimeArt.Part(PrimitiveType.Sphere, "Flame", root, new Vector3(0f, 1.32f, 0f), new Vector3(0.2f, 0.34f, 0.2f), flame);
            Eyes(root, eye, 0.14f, 0.96f, 0.37f, 0.075f);
        }

        private static void TinBat(Transform root, Material metal, Material dark, Material eye)
        {
            RuntimeArt.Part(PrimitiveType.Sphere, "Body", root, new Vector3(0f, 0.8f, 0f), new Vector3(0.42f, 0.46f, 0.35f), metal);
            RuntimeArt.Part(PrimitiveType.Cube, "Left wing", root, new Vector3(-0.46f, 0.85f, 0f), new Vector3(0.62f, 0.08f, 0.38f), dark, new Vector3(0f, 8f, -18f));
            RuntimeArt.Part(PrimitiveType.Cube, "Right wing", root, new Vector3(0.46f, 0.85f, 0f), new Vector3(0.62f, 0.08f, 0.38f), dark, new Vector3(0f, -8f, 18f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Left ear", root, new Vector3(-0.14f, 1.18f, 0f), new Vector3(0.07f, 0.2f, 0.07f), dark, new Vector3(0f, 0f, -18f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Right ear", root, new Vector3(0.14f, 1.18f, 0f), new Vector3(0.07f, 0.2f, 0.07f), dark, new Vector3(0f, 0f, 18f));
            Eyes(root, eye, 0.13f, 0.9f, 0.34f, 0.075f);
        }

        private static void MirrorClown(Transform root, Material suit, Material dark, Material bone, Material eye)
        {
            Material red = RuntimeArt.CreateMaterial("Clown red", new Color(0.92f, 0.06f, 0.16f, 1f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Body", root, new Vector3(0f, 0.58f, 0f), new Vector3(0.42f, 0.56f, 0.36f), suit);
            RuntimeArt.Part(PrimitiveType.Sphere, "Head", root, new Vector3(0f, 1.18f, 0f), new Vector3(0.5f, 0.48f, 0.44f), bone);
            RuntimeArt.Part(PrimitiveType.Sphere, "Nose", root, new Vector3(0f, 1.14f, 0.43f), Vector3.one * 0.13f, red);
            RuntimeArt.Part(PrimitiveType.Cylinder, "Hat", root, new Vector3(0f, 1.57f, 0f), new Vector3(0.3f, 0.31f, 0.3f), dark);
            RuntimeArt.Part(PrimitiveType.Cube, "Hat brim", root, new Vector3(0f, 1.4f, 0f), new Vector3(0.72f, 0.08f, 0.56f), dark);
            RuntimeArt.Part(PrimitiveType.Cylinder, "Mirror", root, new Vector3(0.52f, 0.8f, 0.1f), new Vector3(0.38f, 0.06f, 0.38f), eye, new Vector3(90f, 0f, 0f));
            Eyes(root, eye, 0.16f, 1.25f, 0.4f, 0.075f);
        }

        private static void ZombieRunner(Transform root, Material skin, Material cloth, Material bone, Material eye)
        {
            RuntimeArt.Part(PrimitiveType.Capsule, "Body", root, new Vector3(0f, 0.54f, 0f), new Vector3(0.34f, 0.52f, 0.29f), cloth, new Vector3(12f, 0f, 0f));
            RuntimeArt.Part(PrimitiveType.Sphere, "Head", root, new Vector3(0f, 1.05f, 0.09f), new Vector3(0.43f, 0.45f, 0.4f), skin);
            RuntimeArt.Part(PrimitiveType.Capsule, "Left arm", root, new Vector3(-0.36f, 0.72f, 0.22f), new Vector3(0.1f, 0.42f, 0.1f), skin, new Vector3(58f, 0f, -12f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Right arm", root, new Vector3(0.36f, 0.72f, 0.22f), new Vector3(0.1f, 0.42f, 0.1f), skin, new Vector3(58f, 0f, 12f));
            Eyes(root, eye, 0.14f, 1.1f, 0.36f, 0.07f);
        }

        private static void BoneBrute(Transform root, Material armour, Material dark, Material bone, Material eye)
        {
            RuntimeArt.Part(PrimitiveType.Capsule, "Body", root, new Vector3(0f, 0.72f, 0f), new Vector3(0.66f, 0.72f, 0.54f), dark);
            RuntimeArt.Part(PrimitiveType.Sphere, "Skull", root, new Vector3(0f, 1.46f, 0.02f), new Vector3(0.62f, 0.58f, 0.56f), bone);
            RuntimeArt.Part(PrimitiveType.Sphere, "Left shoulder", root, new Vector3(-0.62f, 1.12f, 0f), Vector3.one * 0.48f, armour);
            RuntimeArt.Part(PrimitiveType.Sphere, "Right shoulder", root, new Vector3(0.62f, 1.12f, 0f), Vector3.one * 0.48f, armour);
            RuntimeArt.Part(PrimitiveType.Cube, "Left fist", root, new Vector3(-0.62f, 0.48f, 0.08f), Vector3.one * 0.4f, bone);
            RuntimeArt.Part(PrimitiveType.Cube, "Right fist", root, new Vector3(0.62f, 0.48f, 0.08f), Vector3.one * 0.4f, bone);
            Eyes(root, eye, 0.18f, 1.51f, 0.49f, 0.1f);
        }

        private static void PhantomBride(Transform root, Material spectral, Material dark, Material eye)
        {
            Material ghost = RuntimeArt.CreateMaterial("Phantom veil", new Color(spectral.color.r, spectral.color.g, spectral.color.b, 0.7f), true, true);
            RuntimeArt.Part(PrimitiveType.Capsule, "Ghost dress", root, new Vector3(0f, 0.62f, 0f), new Vector3(0.5f, 0.72f, 0.42f), ghost);
            RuntimeArt.Part(PrimitiveType.Sphere, "Head", root, new Vector3(0f, 1.28f, 0f), new Vector3(0.44f, 0.48f, 0.42f), spectral);
            RuntimeArt.Part(PrimitiveType.Cube, "Veil", root, new Vector3(0f, 1.18f, -0.18f), new Vector3(0.82f, 0.92f, 0.05f), ghost, new Vector3(4f, 0f, 0f));
            RuntimeArt.Part(PrimitiveType.Sphere, "Bouquet", root, new Vector3(0.34f, 0.78f, 0.28f), Vector3.one * 0.28f, dark);
            Eyes(root, eye, 0.13f, 1.34f, 0.36f, 0.065f);
        }

        private static void Werewolf(Transform root, Material fur, Material armour, Material bone, Material eye)
        {
            RuntimeArt.Part(PrimitiveType.Capsule, "Body", root, new Vector3(0f, 0.78f, 0f), new Vector3(0.58f, 0.76f, 0.48f), fur, new Vector3(-8f, 0f, 0f));
            RuntimeArt.Part(PrimitiveType.Sphere, "Head", root, new Vector3(0f, 1.51f, 0.08f), new Vector3(0.58f, 0.52f, 0.64f), fur);
            RuntimeArt.Part(PrimitiveType.Capsule, "Left ear", root, new Vector3(-0.22f, 1.9f, 0f), new Vector3(0.09f, 0.28f, 0.09f), fur, new Vector3(0f, 0f, -18f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Right ear", root, new Vector3(0.22f, 1.9f, 0f), new Vector3(0.09f, 0.28f, 0.09f), fur, new Vector3(0f, 0f, 18f));
            RuntimeArt.Part(PrimitiveType.Cube, "Left armour", root, new Vector3(-0.54f, 1.16f, 0f), Vector3.one * 0.38f, armour);
            RuntimeArt.Part(PrimitiveType.Cube, "Right armour", root, new Vector3(0.54f, 1.16f, 0f), Vector3.one * 0.38f, armour);
            RuntimeArt.Part(PrimitiveType.Capsule, "Left claw", root, new Vector3(-0.52f, 0.55f, 0.16f), new Vector3(0.15f, 0.5f, 0.15f), bone, new Vector3(20f, 0f, -12f));
            RuntimeArt.Part(PrimitiveType.Capsule, "Right claw", root, new Vector3(0.52f, 0.55f, 0.16f), new Vector3(0.15f, 0.5f, 0.15f), bone, new Vector3(20f, 0f, 12f));
            Eyes(root, eye, 0.18f, 1.58f, 0.55f, 0.09f);
        }

        private static void Eyes(Transform root, Material material, float x, float y, float z, float size)
        {
            RuntimeArt.Part(PrimitiveType.Sphere, "Left eye", root, new Vector3(-x, y, z), Vector3.one * size, material);
            RuntimeArt.Part(PrimitiveType.Sphere, "Right eye", root, new Vector3(x, y, z), Vector3.one * size, material);
        }

        private static void CreateTeamRing(Transform root, BattleTeam team, float scale)
        {
            Material ringMaterial = RuntimeArt.CreateMaterial(team + " deployment ring", BattleBalance.TeamColour(team), true);
            RuntimeArt.Part(
                PrimitiveType.Cylinder,
                "Team ring",
                root,
                new Vector3(0f, 0.035f, 0f),
                new Vector3(0.55f * scale, 0.015f, 0.55f * scale),
                ringMaterial);
        }

        private static void CreateHealthBar(Transform parent, BattleHealth health, BattleTeam team, float scale)
        {
            Transform bar = new GameObject("World health bar").transform;
            bar.SetParent(parent, false);
            bar.localPosition = new Vector3(0f, 1.75f * Mathf.Max(0.8f, scale), 0f);

            Material backMaterial = RuntimeArt.CreateMaterial("Health bar back", new Color(0.04f, 0.015f, 0.025f, 0.96f));
            Material fillMaterial = RuntimeArt.CreateMaterial(team + " health", BattleBalance.TeamColour(team), true);

            RuntimeArt.Part(PrimitiveType.Cube, "Back", bar, Vector3.zero, new Vector3(0.86f, 0.09f, 0.04f), backMaterial);
            Transform fill = RuntimeArt.Part(PrimitiveType.Cube, "Fill", bar, new Vector3(0f, 0f, -0.025f), new Vector3(0.78f, 0.055f, 0.035f), fillMaterial).transform;

            WorldHealthBar worldBar = bar.gameObject.AddComponent<WorldHealthBar>();
            worldBar.Initialise(health, fill, 0.78f);
        }
    }
}
