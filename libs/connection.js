import { objectFromPath } from "./pathResolver.js";

export class ObjectConnection {
  _enviroment = null;
  get enviroment() {
    if (typeof this._enviroment === "function") {
      return this._enviroment();
    }

    return this._enviroment;
  }
  
  _connection = null;
  get Connection() {
    if (typeof _connection === "string") {
      this._connection = objectFromPath(this.enviroment, this._connection);
    }

    return this._connection;
  }
  set Connection(value) {
    if (typeof value === "string") {
      this._connection = objectFromPath(this.enviroment, this._connection);
    } else if (typeof value === "object") {
      this._connection = value;
    } else if (!value) {
      this._connection = null;
    }
  }


  constructor(env, obj=null) {
    this._enviroment = env;
    this.Connection = obj;
  }

  storeConnection(con) {
    this._connection = con;
  }

  forceLoadConnection() {
    this.Connection = this._connection;
  }
}