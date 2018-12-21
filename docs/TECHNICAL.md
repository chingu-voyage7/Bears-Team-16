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

Player: represents a player, fields:

  - id: a unique id assigned to identify the player

  - name: the player's name

  - description: a brief description of the player (probably not
  necessary when game is played live)

  - icon: visual representation of player on "big screen"

  - location: player's current location (a Location)

  - vital: weather player is alive

  - inv: list of Items player has

NPC: represents a non-player character

Item: represents an item (similar to NPC) in the game, fields:

  - name: name of item

  - description: description of item

  - location: where the item is located (unless item is on player)

  - onPlayer: whether the item is being used by a player

  - Player: if onPlayer, the player currently using the item

Location: represents a location in the game (each tied to a QR code), fields:

  - exits: list of exits from this room

  - items: list of items currently in this room

  - name: the short name of this room

  - description: a longer description of the room

  - desAdj: description given to adjacent rooms

Event: represents an event occurring in the game, either a
TriggeredEvent or a AlarmEvent, the latter automatically occurring at
a predetermined (possibly random) time

NOTE: Do not use 'require' as it will not work

NOTE: index.mjs is server side, index.html is client side
