/**
 * DARUMIX — tiny typed event bus.
 * Used by the store, the router and the UI shell. No dependencies.
 */

export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @returns {() => void} unsubscribe
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /** Subscribe for a single delivery. */
  once(event, handler) {
    const dispose = this.on(event, (payload) => {
      dispose();
      handler(payload);
    });
    return dispose;
  }

  off(event, handler) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;

    // Copy first: a handler may unsubscribe while we iterate.
    [...set].forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        // One bad subscriber must not stop the others.
        console.error(`[darumix] listener for "${event}" threw:`, error);
      }
    });
  }

  clear(event) {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
  }
}

export const appEvents = new EventBus();

/** Well-known application events. Keeps event names typo-proof. */
export const EVENTS = {
  routeChange: "route:change",
  toast: "ui:toast",
  openCart: "ui:cart:open",
  closeCart: "ui:cart:close",
  openSearch: "ui:search:open",
  closeSearch: "ui:search:close",
  openNav: "ui:nav:open",
  closeNav: "ui:nav:close",
  openFilters: "ui:filters:open",
  closeFilters: "ui:filters:close",
  openModal: "ui:modal:open",
  closeModal: "ui:modal:close",
  productAdded: "cart:added",
  favoritesChanged: "wishlist:changed",
  compareChanged: "compare:changed",
  authChanged: "auth:changed",
  loadingStart: "loading:start",
  loadingEnd: "loading:end",
};
