using UnityEngine;

namespace NightmarePark
{
    public class ScuttleMotionBinder : MonoBehaviour
    {
        public GraveGoblinScuttleMotion ScuttleMotion;
        public Animator Animator;

        private static readonly int IsMoving = Animator.StringToHash("IsMoving");

        private void Awake()
        {
            if (ScuttleMotion == null) ScuttleMotion = GetComponentInChildren<GraveGoblinScuttleMotion>();
            if (Animator == null) Animator = GetComponentInChildren<Animator>();
        }

        private void Update()
        {
            if (ScuttleMotion == null || Animator == null) return;

            bool moving = Animator.GetBool(IsMoving);
            ScuttleMotion.SetMoving(moving);
        }
    }
}
