import map_set from './map_set.js'
import new_object from './new_object.js'
import maneuver from './maneuver.js'
import save from './save.js'

export default function init() {
  map_set();
  new_object();
  maneuver();
  save();
}