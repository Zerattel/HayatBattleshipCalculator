import { EVENTS } from "./events.js";

let loadbars = {
  modules: {
    id: "loading-inital-bar-modules",
    max: 1,
    min: 0,
    cur: 0,
  },
  battleships: {
    id: "loading-inital-bar-battleships",
    max: 1,
    min: 0,
    cur: 0,
  },
  level: {
    id: "loading-level-bar",
    max: 1,
    min: 0,
    cur: 0,
  }
};

let openLoading = (id) => {};
let closeLoading = () => {};
let updateLoading = (id, max, min, cur) => {};

export default function init() {
  document.addEventListener(EVENTS.LOADING.OPEN, (e) => {
    openLoading(e.detail.id);
  })

  document.addEventListener(EVENTS.LOADING.CLOSE, (e) => {
    closeLoading();
  })

  document.addEventListener(EVENTS.LOADING.UPDATE, (e) => {
    updateLoading(...e.detail);
  })


  openLoading = (id) => {
    $('#loading-modals').attr('data-active', 'true');
    $('#loading-modals > *').attr('data-active', 'false');

    $('#'+id).attr('data-active', 'true');
  }

  closeLoading = () => {
    $('#loading-modals').attr('data-active', 'false');
  }

  updateLoading = (id, dmax, dmin, dcur) => {
    loadbars[id] = {...loadbars[id], ...{ max: dmax, min: dmin, cur: dcur }};

    const { max, min, cur } = loadbars[id];
    $('#'+loadbars[id].id).css('--progress', (cur - min) / (max - min));
  }
}

export { openLoading, closeLoading, updateLoading }