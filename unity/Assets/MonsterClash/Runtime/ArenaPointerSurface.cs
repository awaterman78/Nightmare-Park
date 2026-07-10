using UnityEngine;
using UnityEngine.EventSystems;

namespace MonsterClash
{
    public sealed class ArenaPointerSurface : MonoBehaviour, IPointerClickHandler
    {
        private BattleHud hud;

        public void Initialise(BattleHud battleHud)
        {
            hud = battleHud;
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            hud?.OnArenaClicked(eventData.position);
        }
    }
}
