import grid from './canvas/grid.js'
import tab from './tab/tab.js'
import map from './canvas/map.js'
import overlay from './canvas/overlay.js'
import controls from './controls/controls.js'
import saveload from './save&load/main.js'
import loadBattleships, { setReadyFunction as battleshipsReady } from '../battleships/battleships.js'
import loadModules, { setReadyFunction as modulesReady } from '../modules/modules.js'
import ReadyFunctionsCombiner from '../libs/combineReadyFunctions.js'

new ReadyFunctionsCombiner(() => {
  tab();
  controls();
  map();
  saveload();
  grid();
  overlay();
}, battleshipsReady, modulesReady)

loadBattleships();
loadModules();