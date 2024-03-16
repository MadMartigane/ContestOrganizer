import { PROCEDURE_TYPE_ERROR } from './procedure.constants';
import { ProcedureData, ProcedureDataType, ProcedureError } from './procedure.types';

export class Procedure {
  private type: ProcedureDataType | null;
  private data: unknown | null;
  private error: ProcedureError | null;
  private debug: Array<string> | null;

  constructor(data: ProcedureData) {
    this.type = null;
    this.data = null;
    this.error = null;
    this.debug = null;

    if (data) {
      this.setData(data);
    }
  }

  public setData(data: ProcedureData) {
    this.type = data.procedure;
    this.data = data.data;
    this.error = data.error;
    this.debug = data.debug;
  }

  public getType(): ProcedureDataType | null {
    return this.type;
  }

  public getData(): unknown | null {
    return this.data;
  }

  public getLogs(): Array<string> | null {
    return this.debug;
  }

  public getError(): ProcedureError | null {
    return this.error;
  }

  public isError(): boolean {
    if (!this.type) {
      return false;
    }

    return PROCEDURE_TYPE_ERROR.includes(this.type);
  }

  public isOk(): boolean {
    return !this.isError();
  }

  public toString(): string {
    if (!this.type) {
      return '';
    }

    return this.isOk() ? JSON.stringify(this.data) : (this.error && this.error.message) || '';
  }
}
