# CLONE v0.1 household asset contract

All footprints use quarter-tile subcells; figures below use main metre tiles. Geometry is original.
Closed geometry stays within its declared horizontal body rectangle (small bevel tolerances are
checked); fixtures sit at the authored floor height. Fridge/wardrobe swings reserve extra space.

| Item | Main-tile footprint | Implemented actions |
| --- | --- | --- |
| Bed | 2 × 2.5 | Dream-start anchor, rest, sleep, stand |
| Couch | 2 × 1 | Sit, lie down, sleep, stand; sip held soda |
| Fridge | 1 × 1 | Open/close, counted soda/food stock, take/store unopened soda |
| Kitchen sink | 2 × 1 | Timed hand washing, moving water, fill carried water |
| Stove | 1 × 1 | Consume a fridge food portion to cook a meal; eat meal |
| Island | 2 × 1 | Food preparation feedback, clean |
| Toilet | .75 × 1 | Sit/use, flush with animated water and procedural water sound |
| Bathroom basin | 1 × .75 | Wash hands, fill carried water |
| Shower | 1 × 1.5 | Timed moving water and water sound; manual stop |
| Computer | 2 × 1 | Power, Web, per-computer Notes storage, Life Log |
| Wardrobe | 1 × .75 | Open/close, appearance editor |
| Low table | 1 × .75 | Read life notebook, clean |
| Floor lamp | .25 × .25 | Switch fixture/light contribution |
| Plant | .5 × .5 | Water using carried water, prune |
| House door | 1 × .25 | Open/close, go to starter exterior |
| Exterior entrance | 1 × .25 | Return home |
| Mailbox | .5 × .5 | Read/record a seed letter |
| Exterior bench | 2 × .75 | Sit, stand |

Detail inside a model—handles, water basin, shelves, rails, books—is part of that usable assembly,
not a separate placed item. All types except the fixed entrance anchors can be added from ARRANGE.
This prototype is a creative sandbox: adding a fridge supplies its initial stock without a shop price.
Needs/economy, plumbing/water utility costs, soiling, food spoilage, water physics, TV/radio, arbitrary
app installation and surface-stacked user props have not been built. Cleaning/preparation provide
immediate action feedback/journal entries; this baseline does not simulate grime or recipes.
