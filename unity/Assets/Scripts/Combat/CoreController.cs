using UnityEngine;

namespace NightmarePark
{
    [RequireComponent(typeof(Health))]
    [RequireComponent(typeof(Targetable))]
    public class CoreController : MonoBehaviour
    {
        public Team Team;

        private Health health;

        private void Awake()
        {
            health = GetComponent<Health>();
            health.Team = Team;
        }
    }
}
