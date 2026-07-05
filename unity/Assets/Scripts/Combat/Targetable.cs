using UnityEngine;

namespace NightmarePark
{
    [RequireComponent(typeof(Health))]
    public class Targetable : MonoBehaviour
    {
        public Health Health { get; private set; }

        public Team Team => Health.Team;
        public bool IsAlive => Health != null && !Health.IsDead;

        private void Awake()
        {
            Health = GetComponent<Health>();
        }
    }
}
