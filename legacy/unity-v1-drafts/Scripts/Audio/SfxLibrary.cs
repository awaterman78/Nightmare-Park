using UnityEngine;

namespace NightmarePark
{
    [CreateAssetMenu(menuName = "Nightmare Park/SFX Library")]
    public class SfxLibrary : ScriptableObject
    {
        [Header("Grave Goblin")]
        public AudioClip SpawnPop;
        public AudioClip[] ScuttleSteps;
        public AudioClip BoneStab;
        public AudioClip HitSqueak;
        public AudioClip DeathPuff;

        [Header("Combat")]
        public AudioClip TowerBolt;

        [Header("UI")]
        public AudioClip CardSelect;
        public AudioClip InvalidPlacement;
        public AudioClip Victory;
        public AudioClip Defeat;
    }
}
