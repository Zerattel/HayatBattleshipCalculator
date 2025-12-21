import step from './step.js';
import show_rdata from './show_rdata.js';
import step_logs from './step-logs/step_logs.js';
import map from './map.js';

export default function init() { 
  step();
  show_rdata();
  step_logs();
  map();
}