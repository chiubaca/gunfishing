# Choose the first-playable player format

Type: `grilling`
Status: `resolved`

## Question

Is the first playable solo-only or multiplayer, and what player-count rules must the Run timer, death, respawning, and Recovery cache support?

## Answer

The first playable is solo-only. It does not need multiplayer behavior or compatibility constraints.

- One character participates in each Run and receives that Run's full timer.
- Death immediately fails the Run; there is no revive or in-Run respawn.
- Death opens a brief failure/results screen. A new character is created only when the player explicitly starts the next Run.
- The next Run begins at a random spawn in the persistent world and follows the established Recovery cache rules: the newest cache is marked by direction and distance, and contains the previous character's active Gunfish and rod.
- Surviving until the timer expires opens the victory/results screen and ends the Run.
