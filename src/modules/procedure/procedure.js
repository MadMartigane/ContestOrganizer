import { PROCEDURE_TYPE_ERROR } from "./procedure.constants";
export class Procedure {
  type;
  data;
  error;
  debug;
  constructor(data) {
    this.type = null;
    this.data = null;
    this.error = null;
    this.debug = null;
    if (data) {
      this.setData(data);
    }
  }
  setData(data) {
    this.type = data.procedure;
    this.data = data.data;
    this.error = data.error;
    this.debug = data.debug;
  }
  getType() {
    return this.type;
  }
  getData() {
    return this.data;
  }
  getLogs() {
    return this.debug;
  }
  getError() {
    return this.error;
  }
  isError() {
    if (!this.type) {
      return false;
    }
    return PROCEDURE_TYPE_ERROR.includes(this.type);
  }
  isOk() {
    return !this.isError();
  }
  toString() {
    if (!this.type) {
      return "";
    }
    return this.isOk() ? JSON.stringify(this.data) : this.error?.message || "";
  }
}
