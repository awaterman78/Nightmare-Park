using UnityEngine;

namespace MonsterClash
{
    public sealed class BattleInputController : MonoBehaviour
    {
        public void Initialise(BattleDirector battleDirector, Camera cameraToUse, BattleHud battleHud)
        {
            enabled = false;
        }

        public void ObserveGuiPointer(Vector2 guiPoint)
        {
        }
    }
}
