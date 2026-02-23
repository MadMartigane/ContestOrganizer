import { PROCEDURE_TYPE_ERROR } from "./procedure.constants";
import type {
  ProcedureData,
  ProcedureDataType,
  ProcedureError,
} from "./procedure.types";

export class Procedure {
  private type: ProcedureDataType | null;
  private data: unknown | null;
  private error: ProcedureError | null;
  private debug: string[] | null;

  constructor(data: ProcedureData) {
    this.type = null;
    this.data = null;
    this.error = null;
    this.debug = null;

    if (data) {
      this.setData(data);
    }
  }

  setData(data: ProcedureData) {
    this.type = data.procedure;
    this.data = data.data;
    this.error = data.error;
    this.debug = data.debug;
  }

  getType(): ProcedureDataType | null {
    return this.type;
  }

  getData(): unknown | null {
    return this.data;
  }

  getLogs(): string[] | null {
    return this.debug;
  }

  getError(): ProcedureError | null {
    return this.error;
  }

  isError(): boolean {
    if (!this.type) {
      return false;
    }

    return PROCEDURE_TYPE_ERROR.includes(this.type);
  }

  isOk(): boolean {
    return !this.isError();
  }

  toString(): string {
    if (!this.type) {
      return "";
    }

    return this.isOk() ? JSON.stringify(this.data) : this.error?.message || "";
  }
}
