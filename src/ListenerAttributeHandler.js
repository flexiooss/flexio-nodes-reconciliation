import {
  deepFreezeSeal
} from 'flexio-jshelpers'
import {
  ReconciliationAttributeHandler
} from './ReconciliationAttributeHandler'

import {
  KEY_EVENT_WRAPPER
} from './constantes'
import {
  getNextSequence
} from './sequence'

class ListenerAttributeHandler extends ReconciliationAttributeHandler {
  static select(element, scope) {
    return new ListenerAttributeHandler(element, scope)
  }

  eventListeners() {
    if (!(KEY_EVENT_WRAPPER in this.privateAttribute)) {
      this.privateAttribute[KEY_EVENT_WRAPPER] = this._initEventListener()
    }
    return this.privateAttribute[KEY_EVENT_WRAPPER]
  }
  _initEventListener() {
    return new Map()
  }
  _initEventListenerType() {
    return new Map()
  }

  /**
     * @function on
     * @description add to shallow copy type listened for cloning the elementement easier
     * @param {String} type of event
     * @param {NodeElement} element
     * @param {Function} listener
     * @param {Boolean} useCapture
     */
  on(type, listener, useCapture = false) {
    this.element.addEventListener(type, listener, useCapture)
    return this._addEventListener(type, listener, useCapture)
  }
  _addEventListener(type, listener, useCapture) {
    if (!(this.eventListeners().has(type))) {
      this.eventListeners().set(type, this._initEventListenerType())
    }
    let token = getNextSequence()
    this.eventListeners().get(type).set(token, this._formatListenerShallow(type, listener, useCapture))
    return token
  }

  /**
     * @function off
     * @description remove from shallow copy type listened
     * @param {String} type of event
     * @param {String} key
     * @param {Function} listener
     * @param {Boolean} useCapture
     */

  off(type, key) {
    if (this._hasEventKey(type, key)) {
      let listener = this.eventListeners().get(type).get(key)
      this._elementRemoveListener(listener.type, listener.listener, listener.useCapture)
      this._removeEventListenerByKey(type, key)
    }
  }

  _elementRemoveListener(type, listener, useCapture) {
    this.element.removeEventListener(type, listener, useCapture)
  }

  cleanListeners() {
    if (this.eventListeners().size) {
      this.eventListeners().forEach((value, key, map) => {
        value.forEach((v, k, m) => {
          this._elementRemoveListener(v.type, v.listener, v.useCapture)
        })
      })
    }
  }

  _removeEventListenerByKey(type, key) {
    if (this.eventListeners().has(type)) {
      this.eventListeners().get(type).delete(key)
    }
  }

  _formatListenerShallow(type, listener, useCapture) {
    return deepFreezeSeal({
      type: type,
      listener: listener,
      useCapture: useCapture
    })
  }

  _hasEventKey(type, key) {
    return this.eventListeners().has(type) && this.eventListeners().get(type).has(key)
  }
}
export const select = ListenerAttributeHandler.select
export {
  ListenerAttributeHandler
}
