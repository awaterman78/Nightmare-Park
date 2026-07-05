using UnityEngine;
using UnityEngine.SceneManagement;

namespace NightmarePark
{
    public class GameManager : MonoBehaviour
    {
        public Health PlayerCore;
        public Health EnemyCore;

        public GamePhase Phase { get; private set; } = GamePhase.Playing;

        private void Start()
        {
            if (PlayerCore != null) PlayerCore.Died += HandleCoreDeath;
            if (EnemyCore != null) EnemyCore.Died += HandleCoreDeath;
        }

        private void HandleCoreDeath(Health core)
        {
            if (Phase != GamePhase.Playing) return;

            if (core == EnemyCore)
            {
                Phase = GamePhase.Victory;
                Debug.Log("Victory");
            }
            else if (core == PlayerCore)
            {
                Phase = GamePhase.Defeat;
                Debug.Log("Defeat");
            }

            // TODO, show result UI.
        }

        public void Restart()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
    }
}
