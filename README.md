# battleship
Web-based battleship game with AI made as a coding exercise for PicnicHealth.

## Approach
1. Get Battleship board for player displayed on screen.
2. Allow player to place ships on the board before starting the game.
3. Model different states of a grid space in the UI (e.g. blank, shot at, has ship, has ship and shot at)
4. Allow player to click on a space in the grid to fire at that space.
5. Once all above logic works and is stubbed out, start working on randomized AI:
    1. Randomly place AI ships at beginning of the game.
    2. Model AI attack grid as a grid with even probabilities. Update this grid so that spaces that are shot at have 0 probability. This provides a good jumping point to a more complicated AI implementation, but is relatively simple.
6. Add game over condition
7. Work on smarter AI implementation based on better heuristics

## AI Research
* Reinforcement learning?
* Model opponent's grid as a field of probabilities of where ships might be. Initially, even chance of ships being in every square. As we gain more information, can refine probabilities. Always shoot at one of the squares that has the highest probability.
* Playing against single person over and over again, so can compute statistics about where they typically place ships and preferentially shoot at those locations
* When a ship is hit, the probability that the spaces around it contain ships should increase.
    * Increase by how much though?
* Areas that are too small to contain one of the remaining ships should have 0 probability
* Areas that could contain multiple of the remaining ships should have higher than normal probability
* Flipside is to figure out where opponent is more likely to shoot, and place ships away from those locations
* Rather than hand-tuning probabilities, is there a way I can get the AI to just learn them automatically using some sort of statistical learning?
* 

### References
* ### http://stackoverflow.com/questions/1631414/what-is-the-best-battleship-ai
    * Ignored code on this page
