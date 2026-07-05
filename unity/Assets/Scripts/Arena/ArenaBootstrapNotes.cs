using UnityEngine;

namespace NightmarePark
{
    public class ArenaBootstrapNotes : MonoBehaviour
    {
        [TextArea(8, 20)]
        public string Notes =
            "ArenaOne_Test setup notes:\n" +
            "1. Add ArenaReferences to ArenaRoot.\n" +
            "2. Assign ArenaConfig.\n" +
            "3. Assign bridge point transforms.\n" +
            "4. Add ArenaPathRouter.\n" +
            "5. Add PlacementValidator.\n" +
            "6. Add DeploymentAreaVisual.\n" +
            "7. Assign DeploymentController references.\n" +
            "8. Test Grave Goblin placement.";
    }
}
