# Battleship
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

## AI
### Implementation
* The battleship AI here learns from the player's past actions. It makes the assumption that the past may help to predict the future. This seems to be a reasonable guess because humans do not act 100% randomly, so overtime the Ai should be able to figure out what the human's natural tendencies are and gain an advantage as a result.
    * In particular, the AI records where the player has placed ships in the past so it knows how likely it is for the player to place a ship at a given location
    * The AI also records where the player attacks and when so that it can figure out which spaces it should place ships in to maximize the amount of time the player is likely to take to find the AI's ships.
### Reinforcement learning?
* Model opponent's grid as a field of probabilities of where ships might be. Initially, even chance of ships being in every square. As we gain more information, can refine probabilities. Always shoot at one of the squares that has the highest probability.
* Playing against single person over and over again, so can compute statistics about where they typically place ships and preferentially shoot at those locations
* When a ship is hit, the probability that the spaces around it contain ships should increase.
    * Increase by how much though?
* Areas that are too small to contain one of the remaining ships should have 0 probability
* Areas that could contain multiple of the remaining ships should have higher than normal probability
* Flipside is to figure out where opponent is more likely to shoot, and place ships away from those locations
* Rather than hand-tuning probabilities, is there a way I can get the AI to just learn them automatically using some sort of statistical learning?

#### References
* http://stackoverflow.com/questions/1631414/what-is-the-best-battleship-ai
    * Ignored code on this page

## Future Work
* Weight spaces next to a hit slightly higher since knowing that you hit a ship gives you information about the squares around that space
* Have the AI figure out which pockets and areas are more or less likely based on the length of the player's remaining ships and prioritize hitting spaces where things are likely to be more valuable
* Perhaps heuristically change AI placement so that situations like ships being placed close together are less likely to occur
* When doing placement of AI ships, consider global combinations of placements rather than placing each ship greedily and individually
* Randomize the AI a little bit so that it isn't predictable to the point where it is gameable
    * E.g. with 90% probability, the AI will do something based on history, but with 10% probability the AI will do something completely random. Otherwise an observant player can figure out what the AI is doing and completely game it.
