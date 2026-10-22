/** Locally owned listeners/observers; disposal is idempotent, including stale callbacks. */
export class Lifetime {
  #cleanups = [];
  disposed = false;
  add(cleanup) {
    if (this.disposed) cleanup(); else this.#cleanups.push(cleanup);
    return cleanup;
  }
  guard(callback) { return (...args) => { if (!this.disposed) return callback(...args); }; }
  listen(target, type, callback, options) {
    const guarded = this.guard(callback);
    target.addEventListener(type, guarded, options);
    this.add(() => target.removeEventListener(type, guarded, options));
    return guarded;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const errors=[];
    for (const cleanup of this.#cleanups.splice(0).reverse()) {
      try { cleanup(); } catch(error) { errors.push(error); }
    }
    if(errors.length)throw new AggregateError(errors,'Viewer cleanup failed');
  }
}
