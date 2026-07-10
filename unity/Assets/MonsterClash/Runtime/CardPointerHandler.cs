using UnityEngine;
using UnityEngine.EventSystems;

namespace MonsterClash
{
    public sealed class CardPointerHandler : MonoBehaviour, IPointerClickHandler, IBeginDragHandler, IDragHandler, IEndDragHandler
    {
        private BattleHud hud;
        private int handIndex;

        public void Initialise(BattleHud battleHud, int index)
        {
            hud = battleHud;
            handIndex = index;
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            hud?.OnCardClicked(handIndex);
        }

        public void OnBeginDrag(PointerEventData eventData)
        {
            hud?.OnCardDragStarted(handIndex);
        }

        public void OnDrag(PointerEventData eventData)
        {
        }

        public void OnEndDrag(PointerEventData eventData)
        {
            hud?.OnCardDragEnded(eventData.position);
        }
    }
}
