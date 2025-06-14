export default class ReadyFunctionsCombiner {
  completed = [];
  allCompleted = () => {};

  constructor(allCompleted, ...args) {
    this.allCompleted = allCompleted;

    if (args.length == 0) {
      this.allCompleted();

      return;
    }

    for (let [i, setFunc] of Object.entries(args)) {
      this.completed.push(false);
      setFunc(() => this.ready(i));
    }
  }

  ready(i) {
    this.completed[i] = true;

    if (this.completed.every(v => v)) {
      this.allCompleted();

      delete this;
    }
  }
}