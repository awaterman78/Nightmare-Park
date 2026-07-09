using UnityEngine;

namespace NightmarePark
{
    [RequireComponent(typeof(AudioSource))]
    public class UnitAudioController : MonoBehaviour
    {
        public AudioSource Source;

        [Header("Clips")]
        public AudioClip SpawnClip;
        public AudioClip[] FootstepClips;
        public AudioClip BoneStabClip;
        public AudioClip HitClip;
        public AudioClip DeathClip;

        [Header("Pitch variation")]
        public float MinPitch = 0.92f;
        public float MaxPitch = 1.08f;

        private void Awake()
        {
            if (Source == null) Source = GetComponent<AudioSource>();
        }

        public void PlaySpawn()
        {
            Play(SpawnClip);
        }

        public void PlayFootstep()
        {
            if (FootstepClips == null || FootstepClips.Length == 0) return;

            AudioClip clip = FootstepClips[Random.Range(0, FootstepClips.Length)];
            Play(clip, 0.45f);
        }

        public void PlayBoneStab()
        {
            Play(BoneStabClip);
        }

        public void PlayHit()
        {
            Play(HitClip);
        }

        public void PlayDeath()
        {
            Play(DeathClip);
        }

        private void Play(AudioClip clip, float volume = 1f)
        {
            if (clip == null || Source == null) return;

            Source.pitch = Random.Range(MinPitch, MaxPitch);
            Source.PlayOneShot(clip, volume);
        }
    }
}
