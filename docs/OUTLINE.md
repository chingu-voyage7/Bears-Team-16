# Mobile City (Bears-Team-16)
[Mobile City](https://github.com/chingu-voyage7/Bears-Team-16) | Voyage-7 | https://chingu.io/

## Advertisement
Mobile City is a shared-experience game platform for one to over a hundred players.  
Gameplay can be customized for murder mysteries, survival games, LARPs, and sandboxes.  
Players interact face-to-face and use their smartphones for clues, actions, and items.  
Mobile City comes with premade scenarios but you can modify them or create your own.  

## Summary
Mobile City is an ambitious project to manage 100-player face-to-face games through
a video game interface. Telling elaborate stories or simulating complex sandboxes.
It is first and foremost an in-person game but can be played solely online.
Players will share a single projector screen for NPC monologue videos and displaying the city map.
If playing an Urban theme, Google Maps can be used to change the story locations to real
locations nearby. Players must work together to win the game. Each player can have a
class like Cop, Doc, Detective, etc. Everyone will wear class tags so other players can 
find a cop or Doc when they need one. Which effects how npcs react to them and what actions
they can take. Players can permanently change stations, like by burning down a building
or killing an NPC. The stations will be scattered around the playing area but each will
have a QR Code. Players must scan the QR Code for the Server to register them as having
moved there. Each Station is adjacent to only a few other stations, you can only scan an
adjacent station, otherwise you do not move. Story plot can also prevents you from moving, 
like if a NPC handcuffed you to a pipe.

## Parts
- [ ] Designs
  - [ ] Webpage
  - [ ] Networking
  - [ ] Scenario Modding
- [ ] Smartphone and tablet webpage
  - [ ] QR Code reader
  - [ ] Websockets or WebRTC to Server
  - [ ] Render tabbed screen and game data
  - [ ] Allow player to make choices
  - [ ] Play video clip
- [ ] Runtime Server
  - [ ] Load and parse Scenario Folder(s)
  - [ ] Import Google Maps data
    - [ ] Generate Game Map from data
- [ ] Generate printable pages
  - [ ] Station QR Codes
  - [ ] Badges
  - [ ] Rule pages
- [ ] Not in-person webpage
- [ ] Premade Murder Mystery Scenario