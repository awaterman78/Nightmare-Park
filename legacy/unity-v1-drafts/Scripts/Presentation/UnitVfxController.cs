using UnityEngine;

namespace NightmarePark
{
    public class UnitVfxController : MonoBehaviour
    {
        [Header("Anchors")]
        public Transform WeaponTipAnchor;
        public Transform GroundAnchor;
        public Transform FootDustLeftAnchor;
        public Transform FootDustRightAnchor;
        public Transform HitCenterAnchor;

        [Header("VFX Prefabs")]
        public GameObject SpawnPuffPrefab;
        public GameObject FootDustPrefab;
        public GameObject BoneStabSlashPrefab;
        public GameObject HitFlashPrefab;
        public GameObject DeathPuffPrefab;

        public void PlaySpawnPuff()
        {
            Spawn(SpawnPuffPrefab, GroundAnchor);
        }

        public void PlayFootDust(bool left)
        {
            Spawn(FootDustPrefab, left ? FootDustLeftAnchor : FootDustRightAnchor);
        }

        public void PlayBoneStabSlash()
        {
            Spawn(BoneStabSlashPrefab, WeaponTipAnchor);
        }

        public void PlayHitFlash()
        {
            Spawn(HitFlashPrefab, HitCenterAnchor);
        }

        public void PlayDeathPuff()
        {
            Spawn(DeathPuffPrefab, GroundAnchor);
        }

        private void Spawn(GameObject prefab, Transform anchor)
        {
            if (prefab == null || anchor == null) return;

            GameObject instance = Instantiate(prefab, anchor.position, anchor.rotation);
            Destroy(instance, 2f);
        }
    }
}
