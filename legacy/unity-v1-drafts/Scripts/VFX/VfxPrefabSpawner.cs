using UnityEngine;

namespace NightmarePark
{
    public class VfxPrefabSpawner : MonoBehaviour
    {
        public GameObject Prefab;
        public Transform SpawnParent;
        public bool MatchRotation = true;

        public void Spawn(Vector3 position, Quaternion rotation)
        {
            if (Prefab == null) return;

            Instantiate(Prefab, position, MatchRotation ? rotation : Quaternion.identity, SpawnParent);
        }

        public void SpawnAtTransform(Transform anchor)
        {
            if (anchor == null) return;

            Spawn(anchor.position, anchor.rotation);
        }
    }
}
