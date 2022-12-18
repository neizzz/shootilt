export class CircularQueue<T> {
  private _size: number;
  private _container: Array<T>;
  private _head = 0;
  private _tail = 0;

  constructor(size: number) {
    this._size = size;
    this._container = Array.from({ length: size });
  }

  push(element: T) {
    const tmpTail = (this._tail + 1) % this._size;
    if (tmpTail === this._head) {
      throw new Error(`'CircularQueue' overflow`);
    }
    this._container[this._tail] = element;
    this._tail = tmpTail;
  }

  pop() {
    if (this._head === this._tail) {
      throw new Error(`Empty 'CircularQueue' can't pop`);
    }
    const popped = this._container[this._head];
    this._head = (this._head + 1) % this._size;
    return popped;
  }
}
