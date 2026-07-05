using UnityEngine;
using UnityEngine.SceneManagement;

namespace NightmarePark
{
    public class GameManager : MonoBehaviour
    {
        public Health PlayerCore;
        public Health EnemyCore;

        private bool matchEnded;

        private void Start()
        {
            if (PlayerCore != null) PlayerCore.OnDied += HandleCoreDeath;
            if (EnemyCore != null) EnemyCore.OnDied += HandleCoreDeath;
        }

        private void HandleCoreDeath(Health core)
        {
            if (matchEnded) return;

            matchEnded = true;

            if (core == EnemyCore)
            {
                Debug.Log("Victory");
            }
            else if (core == PlayerCore)
            {
                Debug.Log("Defeat");
            }

            // TODO, show result screen.
        }

        public void Restart()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }
    }
}
