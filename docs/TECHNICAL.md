From a technical standpoint, each game is:

  - a directed graph with nodes (aka stations) and edges (permitted
  paths between stations); these nodes and edges can change during
  gameplay

  - trigger events that occur when a player (or a number of players or
  a specific player or a player with a specific inventory item)
  reaches a node or edge

  - timed events that occur at specific (or random times)

The coding language for the game is currently undecided.

Thoughts:

  - Each QR code can be a URL or even a URL fragmnet; when the player
  visits that fragment on their browser ("automatically"), the game
  updates their status without reloading the entire page

  - Objects in the game:

Game: the game object

Player: represents a player

NPC: represents a non-player character

Item: represents an item (similar to NPC) in the game

Location: represents a location in the game (each tied to a QR code)

Event: represents an event occurring in the game, either a
TriggeredEvent or a AlarmEvent, the latter automatically occurring at
a predetermined (possibly random) time
