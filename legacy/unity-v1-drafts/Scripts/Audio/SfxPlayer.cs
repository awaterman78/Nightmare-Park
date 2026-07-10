using UnityEngine;

namespace NightmarePark
{
    public class SfxPlayer : MonoBehaviour
    {
        public static SfxPlayer Instance { get; private set; }

        public SfxLibrary Library;
        public AudioSource Source;

        [Header("Pitch")]
        public float MinPitch = 0.92f;
        public float MaxPitch = 1.08f;

        private void Awake()
        {
            Instance = this;

            if (Source == null)
            {
                Source = GetComponent<AudioSource>();
            }
        }

        public void Play(AudioClip clip, float volume = 1f, bool varyPitch = true)
        {
            if (clip == null || Source == null) return;

            Source.pitch = varyPitch ? Random.Range(MinPitch, MaxPitch) : 1f;
            Source.PlayOneShot(clip, volume);
        }

        public void PlaySpawnPop() => Play(Library != null ? Library.SpawnPop : null, 0.75f);
        public void PlayBoneStab() => Play(Library != null ? Library.BoneStab : null, 0.8f);
        public void PlayHitSqueak() => Play(Library != null ? Library.HitSqueak : null, 0.65f);
        public void PlayDeathPuff() => Play(Library != null ? Library.DeathPuff : null, 0.75f);
        public void PlayTowerBolt() => Play(Library != null ? Library.TowerBolt : null, 0.45f);

        public void PlayCardSelect() => Play(Library != null ? Library.CardSelect : null, 0.6f);
        public void PlayInvalidPlacement() => Play(Library != null ? Library.InvalidPlacement : null, 0.45f);
        public void PlayVictory() => Play(Library != null ? Library.Victory : null, 0.8f, false);
        public void PlayDefeat() => Play(Library != null ? Library.Defeat : null, 0.75f, false);

        public void PlayScuttleStep()
        {
            if (Library == null || Library.ScuttleSteps == null || Library.ScuttleSteps.Length == 0) return;

            AudioClip clip = Library.ScuttleSteps[Random.Range(0, Library.ScuttleSteps.Length)];
            Play(clip, 0.35f);
        }
    }
}
