
class Uuid {
  private readonly length: number;

  constructor () {
    this.length = 3;
  }

  public new () {
    const array = new Uint32Array(this.length);
    crypto.getRandomValues(array)
    return array[Math.floor(Math.random() * this.length)]
  }
}

const uuid = new Uuid();
export default uuid;

