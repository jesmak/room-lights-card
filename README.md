# Room lights card

Home Assistant dashboard card for the lights of one room, with a brightness bar for each dimmable light, the other
lights and switches as buttons, and the room's scenes, each placed by the lights it changes.

[![GitHub Release][releases-shield]][releases] [![GitHub Release Date][release-date-shield]][releases] [![HACS][hacs-shield]][hacs] [![License][license-shield]](LICENSE)

<p>
<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/living-room-light.png#gh-light-mode-only" width="400" alt="A living room card with its downlights at 70% and a purple LED strip at 45% with two scene icons on its row, Adaptive Lighting on, and the room's Bright and Dim scenes as buttons">
<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/living-room-dark.png#gh-dark-mode-only" width="400" alt="A living room card with its downlights at 70% and a purple LED strip at 45% with two scene icons on its row, Adaptive Lighting on, and the room's Bright and Dim scenes as buttons">
<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/office-light.png#gh-light-mode-only" width="400" alt="An office card with the ceiling light at full, the ring off, a shelf strip at 30% with its own scenes, a desk lamp switched on as a button, and three room scenes">
<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/office-dark.png#gh-dark-mode-only" width="400" alt="An office card with the ceiling light at full, the ring off, a shelf strip at 30% with its own scenes, a desk lamp switched on as a button, and three room scenes">
</p>

## What is it?

A custom card that puts a room's lights in one compact card. Its header has the room's icon, which turns the room's
lights on and off, its name, and how bright the room is and how many of its lights are on. Below it, each dimmable
light has a bar that shows and sets its brightness in the light's own colour, and lights that can only be switched on
and off, and switches such as a socket for seasonal lights, are buttons.

Scenes go where they belong. A scene that changes only one of the card's lights sits on that light's row as an icon,
such as a bright and a dim scene for an LED strip, and the rest are named buttons at the bottom of the card. The card
finds this out from the scenes themselves, so a card set up from an area needs no placing by hand.

A button in the card's settings fills in an area's lights and scenes. Colours, colour temperature and effects are
left to Home Assistant's own dialog, which opens from a light's name.

## Installation

### With HACS

1. Add this repository to HACS custom repositories with type **Dashboard**
2. Search for Room lights card in HACS and download it
3. Refresh your browser

### Manual

1. Take `dist/room-lights-card.js` from the source code of the [latest release][releases] and copy it to the
   `config/www` folder of your Home Assistant installation
2. In Home Assistant settings, open dashboards, click the three dots at the top right and open resources
3. Add a new resource with the path `/local/room-lights-card.js` and type JavaScript
4. Refresh your browser

## Options

| Name                | Type   | Description                                                                                                                                                                                                                                                                                                                                                    | Default                                                                         |
| ------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `type`              | string | `custom:room-lights-card`                                                                                                                                                                                                                                                                                                                                      | required                                                                        |
| `area`              | string | The room's area. Gives the card its name and icon. Without one, see [the card with no area](#the-card-with-no-area)                                                                                                                                                                                                                                            |                                                                                 |
| `name`              | string | Replaces the name in the header                                                                                                                                                                                                                                                                                                                                | the area's name, "Lights"                                                       |
| `icon`              | string | Replaces the icon in the header                                                                                                                                                                                                                                                                                                                                | the area's icon                                                                 |
| `lights`            | list   | Lights and switches, each an entity id or an object with its name                                                                                                                                                                                                                                                                                              |                                                                                 |
| `scenes`            | list   | Scenes and scripts, each an entity id or an object with its name, icon and place                                                                                                                                                                                                                                                                               |                                                                                 |
| `adaptive_lighting` | string | An [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting) switch, turned on and off from the header                                                                                                                                                                                                                                              |                                                                                 |
| `turn_on`           | string | What the room's icon turns on, `all` lights, the `lights` in `turn_on_lights`, or a `scene`                                                                                                                                                                                                                                                                    | `all`                                                                           |
| `turn_on_lights`    | list   | The lights the icon turns on when `turn_on` is `lights`                                                                                                                                                                                                                                                                                                        |                                                                                 |
| `turn_on_scene`     | string | The scene or script the icon starts when `turn_on` is `scene`                                                                                                                                                                                                                                                                                                  |                                                                                 |
| `height_mode`       | string | How tall the card is. `auto` fits its content, `fixed` keeps it at `height`, `max` lets it grow up to `max_height`. In `fixed` and `max` the lights and scenes scroll below the header, which stays in view, and the card never gets lower than its header and one light bar. A height in grid rows, set in the layout tab of a sections view, is used instead | `fixed` when `height` is set, `max` when only `max_height` is, otherwise `auto` |
| `height`            | number | The card's height in pixels, for `fixed`                                                                                                                                                                                                                                                                                                                       |                                                                                 |
| `max_height`        | number | The card's greatest height in pixels, for `max`                                                                                                                                                                                                                                                                                                                |                                                                                 |
| `row_step`          | string | How the card rounds its height on automatic rows in a sections view, with `height_mode` `auto`. `full` rounds up to whole rows, `half` to half rows, which saves space but may leave the cards under it half a row off the rows of the sections beside it                                                                                                      | `full`                                                                          |

Each item of `lights` is an entity id, or an object with these keys:

| Name     | Type   | Description                                                        |
| -------- | ------ | ------------------------------------------------------------------ |
| `entity` | string | A light, or a switch, which is shown as a button                   |
| `name`   | string | Replaces the [name the card makes](#names) from the light's device |

Each item of `scenes` is an entity id, or an object with these keys:

| Name       | Type   | Description                                                                               | Default      |
| ---------- | ------ | ----------------------------------------------------------------------------------------- | ------------ |
| `entity`   | string | A scene or a script                                                                       | required     |
| `name`     | string | Replaces the scene's own name, such as "Bright" for "Living room bright"                  | the entity's |
| `icon`     | string | Replaces the scene's own icon                                                             | the entity's |
| `position` | string | `auto`, `room` for the buttons at the bottom, or a dimmable light's entity id for its row | `auto`       |

Everything can be set in the card's visual editor.

Adaptive Lighting makes four switches for each room, and the editor offers them all. Pick the main one, the one without
Sleep Mode, Adapt Brightness or Adapt Color in its name. The others turn only one part of it on and off.

## What it shows

- **The header:** the room's icon, in the colour of the first light that is on, its name, and its state, such as
  "60% · 2/3 on". The brightness is the average of the dimmable lights that are on. Adaptive Lighting's switch sits
  at the right end when one is set, lit while it is on.
- **A bar for each dimmable light,** filled to its brightness in the light's own colour, with its name in front. Tap
  or drag it to set the brightness. The change is sent when the bar is let go, so a light gets one command per drag,
  and nothing is sent when the touch turns out to be a scroll. Letting go at the far left turns the light off. With the
  keyboard, the arrow keys move a bar by 5%, Page Up and Page Down by 10%, Home turns the light off and End sets it to
  full. A light that is unavailable says so and can't be set.
- **A button for each other light and switch,** lit while it is on. A tap switches it.
- **The scenes,** as icons on a light's row or as named buttons at the bottom (below). A scene has no state of its
  own to show, so its button flashes when it starts.

<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/garden-light.png#gh-light-mode-only" width="510" alt="A garden card with the lanterns as a bar with their scenes, and a floodlight, terrace lights, a terrace socket and string lights as buttons, two of them lit">
<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/garden-dark.png#gh-dark-mode-only" width="510" alt="A garden card with the lanterns as a bar with their scenes, and a floodlight, terrace lights, a terrace socket and string lights as buttons, two of them lit">

Clicking a light's name opens its dialog, for its colour, colour temperature and effects. On a card with only one
light the name is left out, and the room's name opens the dialog instead.

## Where scenes go

A scene lists the entities it sets. The card compares them with its own lights and switches, either directly or
through a light group, and leaves out what isn't on the card, such as a wall switch's relay or a palette.

- A scene that changes **one** of the card's lights goes on that light's row. When that one is an on/off light or a
  switch, which is a button with no row, the scene goes with the room's buttons at the bottom.
- A scene that changes **two or more** of them, a light and a switch included, goes with the room's buttons.
- **A script's** state doesn't tell what it changes, so on the card it goes with the room's buttons too.

So a scene called "Bright" may sit on a row in one room and at the bottom in another, depending on which lights it
changes. To put a scene elsewhere, set its `position` to `room` or to a dimmable light's entity id.

## Turning the room on and off

When any of the card's lights is on, the room's icon turns all of them off. When all are off, it turns on what
`turn_on` says:

- **`all`** turns every light of the card on. Each comes back as it last was, its brightness, colour and effect
  included.
- **`lights`** turns on only the lights in `turn_on_lights`, such as the ceiling lights of a room that also has an
  LED strip, which would otherwise come back in its last effect. With Adaptive Lighting, this is usually the right
  one, as Adaptive Lighting then sets the brightness and colour itself.
- **`scene`** starts the scene or script in `turn_on_scene`.

## Filling in from an area

Choosing an area changes neither the lights nor the scenes. The **Fill in from the area** button below the name and icon does, and
replaces both lists with the area's, those set by hand included.

- **Lights:** the lights in the area, leaving out hidden ones and those of a device's configuration or diagnostics.
  Switches are left out, as an area holds many that aren't lights, and are added by hand. A light that groups others
  is one of three things:
  - A **Zigbee group**, such as one made in Zigbee2MQTT or ZHA, is a device of its own whose lights are switched
    together, so it is shown instead of its lights.
  - A **Home Assistant light group** is usually a set of different lights, so it is left out and its lights are shown.
  - A **controller's main light**, such as WLED's when a strip has several segments, can be on while the segments are
    dark, so it is left out and the segments are shown.
- **Scenes and scripts:** those in the area, and any that changes one of the card's lights even when it has no area,
  but not one that also changes another area's lights. Those belong on the card with no area. A script's lights are
  read from its configuration when the button is pressed, and one whose configuration can't be read is left out.

What is filled in is saved as lists, so the card doesn't change when something is added to the area later. Lights
that aren't lights of the room, such as a status light on a device, are removed from the list in the editor. A card
added from the card picker starts out filled in from the first area, by name, that has lights.

## The card with no area

Without an area the card holds what belongs to no single room, such as scenes and scripts that set the lights of
several rooms. Its name is "Lights" unless one is set. It has no toggle unless it has lights of its own, as turning off
every light in the house would also turn off the screens and status lights that are lights in Home Assistant.

<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/moods-light.png#gh-light-mode-only" width="510" alt="A card with no area, holding a movie night scene and Christmas and disco scripts as buttons">
<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/moods-dark.png#gh-dark-mode-only" width="510" alt="A card with no area, holding a movie night scene and Christmas and disco scripts as buttons">

With no area chosen, the fill button fills in the scenes and scripts that change the lights of two or more areas, and
no lights.

## Names

A light's name is made from its device. It is the device's name when the card has no other light of that device, and
otherwise the device's name and the light's own, such as "Ceiling light Ring" for one part of a ceiling light. The area's name is
left out, as the card already says it, so "Downlights living room" is "Downlights" on the living room's card. A name
set in `lights` replaces it.

## Sizes

In a sections view the card takes a whole section by default and can be made as narrow as half of one. Its parts follow
the view's rows. The header takes one row, and the bars, the buttons and the scenes are each half a row, so two of them
fill a row. With an odd number of them, the card ends on a whole row with half a row of room under the header, or with
`row_step: half` ends half a row sooner. A name that wraps adds half a row for each line it takes.

Names and buttons wrap rather than being cut. On a narrow card a light's name takes a line of its own above its bar.
The bars of one card all end at the same line, however many scene icons their rows have. Held to a height, the card
keeps every name to one line, cut short with the whole name as a tooltip.

<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/narrow-light.png#gh-light-mode-only" width="250" alt="The office card at half a section wide, each light's name on its own line above its bar">
<img src="https://raw.githubusercontent.com/jesmak/room-lights-card/main/docs/images/narrow-dark.png#gh-dark-mode-only" width="250" alt="The office card at half a section wide, each light's name on its own line above its bar">

The card follows the theme. The bars, buttons and the room's icon use `--state-light-active-color` for a light that has
no colour of its own, or whose colour is so close to white that it wouldn't show against a light theme. Adaptive
Lighting's switch uses `--primary-color` while it is on.

## Examples

### One room

```yaml
type: custom:room-lights-card
area: living_room
lights:
  - light.living_room_downlights
  - entity: light.living_room_led_strip
    name: LED strip
scenes:
  - entity: scene.living_room_bright
    name: Bright
  - entity: scene.living_room_dim
    name: Dim
  - entity: scene.led_strip_party
    name: Party
adaptive_lighting: switch.adaptive_lighting_living_room
turn_on: lights
turn_on_lights:
  - light.living_room_downlights
```

### A garden with a socket

```yaml
type: custom:room-lights-card
area: garden
lights:
  - entity: light.porch_lanterns
    name: Lanterns
  - light.floodlight
  - entity: switch.terrace_socket
    name: Terrace socket
scenes:
  - scene.lanterns_bright
  - scene.lanterns_dim
```

### Scenes for the whole house

```yaml
type: custom:room-lights-card
name: Moods
icon: mdi:party-popper
scenes:
  - entity: script.christmas_lights
    name: Christmas
  - entity: scene.movie_night
    name: Movie night
```

### A scene placed by hand

```yaml
type: custom:room-lights-card
area: office
lights:
  - light.office_ceiling
  - light.office_desk_lamp
scenes:
  - entity: scene.office_reading
    position: light.office_desk_lamp
```

## Translating

The card's texts are in `src/localize/languages/`, one JSON file per language, named by its language code, such as
`en.json` and `fi.json`. To add a language, copy `en.json` to the new language's code, such as `sv.json`, and
translate the values. Nothing else needs changing. The card finds the file by itself and uses it when Home Assistant is
set to that language. A text left out falls back to English. The names of lights, scenes and areas come from Home
Assistant.

## Development

Requires Node 22.13 or newer.

```
npm install
npm run check
```

`npm run check` typechecks, lints, checks formatting, runs the tests and builds `dist/room-lights-card.js`, which is
the file HACS installs and is committed to the repository.

| Path                      | What it contains                                                             |
| ------------------------- | ---------------------------------------------------------------------------- |
| `src/room-lights-card.ts` | The card itself                                                              |
| `src/editor.ts`           | The visual editor, and filling in from an area                               |
| `src/lights.ts`           | Areas, light groups, where scenes go, the room's state and the lights' names |
| `src/localize/languages/` | The card's texts, one JSON file per language                                 |
| `docs/screenshots.json`   | The made-up data the README's screenshots are taken from                     |
| `tests/`                  | Tests, run with vitest, on a made-up house in `tests/fixtures.ts`            |

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/jesmak)

## License

MIT, see [LICENSE](LICENSE).

[releases-shield]: https://img.shields.io/github/release/jesmak/room-lights-card.svg?style=for-the-badge
[release-date-shield]: https://img.shields.io/github/release-date/jesmak/room-lights-card?style=for-the-badge
[releases]: https://github.com/jesmak/room-lights-card/releases
[hacs-shield]: https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge
[hacs]: https://hacs.xyz/docs/faq/custom_repositories/
[license-shield]: https://img.shields.io/github/license/jesmak/room-lights-card.svg?style=for-the-badge
