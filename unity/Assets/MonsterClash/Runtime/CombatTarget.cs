using System.Collections.Generic;
using UnityEngine;

namespace MonsterClash
{
    [RequireComponent(typeof(BattleHealth))]
    public sealed class CombatTarget : MonoBehaviour
    {
        private static readonly HashSet<CombatTarget> ActiveTargets = new HashSet<CombatTarget>();

        [SerializeField] private bool building;
        [SerializeField] private bool core;
        [SerializeField] private Transform aimPoint;

        public BattleHealth Health { get; private set; }
        public BattleTeam Team => Health.Team;
        public bool IsAlive => Health != null && Health.IsAlive;
        public bool IsBuilding => building;
        public bool IsCore => core;
        public Vector3 AimPosition => aimPoint == null ? transform.position : aimPoint.position;
        public static IEnumerable<CombatTarget> All => ActiveTargets;

        public void Configure(bool isBuilding, bool isCore, Transform targetPoint = null)
        {
            building = isBuilding;
            core = isCore;
            aimPoint = targetPoint;
        }

        private void Awake()
        {
            Health = GetComponent<BattleHealth>();
        }

        private void OnEnable()
        {
            if (Health == null) Health = GetComponent<BattleHealth>();
            ActiveTargets.Add(this);
        }

        private void OnDisable()
        {
            ActiveTargets.Remove(this);
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        private static void ResetRegistry()
        {
            ActiveTargets.Clear();
        }
    }
}
