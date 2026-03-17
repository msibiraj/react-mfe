/**
 * @company/event-bus
 * Lightweight publish/subscribe event bus shared across all MFEs.
 * Typically published as an npm package and listed as a "shared singleton"
 * in each MFE's ModuleFederationPlugin config.
 */

const createEventBus = () => {
  const listeners = {};

  return {
    /**
     * Emit an event to all subscribers.
     * @param {string} event - e.g. 'cart:add'
     * @param {any} payload
     */
    emit(event, payload) {
      (listeners[event] || []).forEach((fn) => fn(payload));
    },

    /**
     * Subscribe to an event. Returns an unsubscribe function.
     * @param {string} event
     * @param {Function} fn
     * @returns {Function} unsubscribe
     */
    on(event, fn) {
      listeners[event] = [...(listeners[event] || []), fn];
      return () => {
        listeners[event] = listeners[event].filter((f) => f !== fn);
      };
    },
  };
};

// Singleton — all MFEs share the same instance via Module Federation "shared"
const eventBus = createEventBus();
export default eventBus;
