export let check_id = (id) => Boolean;

export default function (objects) {  
  check_id = (id) => {
    return Object.keys(objects).includes(id);
  }

  return check_id;
}