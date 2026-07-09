using System;
using System.Collections.Generic;

namespace MonsterClash
{
    public sealed class CardCycle
    {
        private readonly List<MonsterCard> queue;
        private readonly int handSize;

        public int Count => queue.Count;
        public MonsterCard Next => queue.Count > handSize ? queue[handSize] : null;

        public CardCycle(IReadOnlyList<MonsterCard> cards, int requestedHandSize, int randomSeed)
        {
            if (cards == null || cards.Count == 0)
            {
                throw new ArgumentException("A battle deck must contain cards.", nameof(cards));
            }

            queue = new List<MonsterCard>(cards);
            handSize = Math.Min(Math.Max(1, requestedHandSize), queue.Count);
            Shuffle(new Random(randomSeed));
        }

        public MonsterCard CardAt(int handIndex)
        {
            return handIndex >= 0 && handIndex < handSize ? queue[handIndex] : null;
        }

        public IReadOnlyList<MonsterCard> SnapshotHand()
        {
            return queue.GetRange(0, handSize);
        }

        public bool Play(int handIndex, out MonsterCard played)
        {
            played = CardAt(handIndex);
            if (played == null) return false;

            queue.RemoveAt(handIndex);
            queue.Add(played);
            return true;
        }

        private void Shuffle(Random random)
        {
            for (int i = queue.Count - 1; i > 0; i--)
            {
                int other = random.Next(i + 1);
                MonsterCard value = queue[i];
                queue[i] = queue[other];
                queue[other] = value;
            }
        }
    }
}
