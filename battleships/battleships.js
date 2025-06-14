let isReady = false;
let battleships = {};
let onReady = () => {};
let setReadyFunction = (func) => {
  onReady = func;
};

export default function init() {
  const loadBattleships = async (list) => {
    for (let [name, path] of Object.entries(list)) {
      const data = await (await fetch("./battleships/" + path)).json();

      battleships[name] = data;
    }
  };

  fetch("./battleships/battleships.json")
    .then((response) => response.json())
    .then((v) => {
      loadBattleships(v)
        .then(() => {
          isReady = true;

          console.log(battleships);

          onReady();
        })
        .catch((e) => {
          console.log(e);

          alert("Cannot load battleships data!");
        });
    })
    .catch((e) => {
      console.log(e);

      alert("Cannot load battleships paths!");
    });
}

export { isReady, battleships, setReadyFunction };
