import {deepFreezeSeal} from 'flexio-jshelpers'
import {ReconciliationAttributeHandler} from './ReconciliationAttributeHandler'
import {KEY_EVENT_WRAPPER} from './constantes'
import {getNextSequence} from './sequence'

/**
 * @extends ReconciliationAttributeHandler
 */
class ListenerAttributeHandler extends ReconciliationAttributeHandler {
  /**
   * @static
   * @param {Node} element
   * @return {ListenerAttributeHandler}
   */
  static select(element) {
    return new ListenerAttributeHandler(element)
  }

  /**
   *
   * @return {Map<string, Map<string, {type: string, listener: function, useCapture: boolean}>>}
   */
  eventListeners() {
    if (!(KEY_EVENT_WRAPPER in this.privateAttribute)) {
      this.privateAttribute[KEY_EVENT_WRAPPER] = this._initEventListener()
    }
    return this.privateAttribute[KEY_EVENT_WRAPPER]
  }

  /**
   *
   * @return {Map<string, Map<string, {type: string, listener: function, useCapture: boolean}>>}
   * @private
   */
  _initEventListener() {
    return new Map()
  }

  /**
   *
   * @return {Map<string, {type: string, listener: function, useCapture: boolean}>}
   * @private
   */
  _initEventListenerType() {
    return new Map()
  }

  /**
   * @description add to shallow copy type listened for cloning the elementement easier
   * @param {String} type of event
   * @param {Function} listener
   * @param {Boolean} useCapture
   * @return {string}
   */
  on(type, listener, options) {
    this.element.addEventListener(type, listener, options)
    return this._addEventListener(type, listener, options)
  }

  /**
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return {string}
   * @private
   */
  _addEventListener(type, listener, options) {
    if (!(this.eventListeners().has(type))) {
      this.eventListeners().set(type, this._initEventListenerType())
    }
    let token = getNextSequence()
    this.eventListeners().get(type).set(
      token,
      this._formatListenerShallow(type, listener, options)
    )
    return token
  }

  /**
   * @function off
   * @description remove from shallow copy type listened
   * @param {String} type of event
   * @param {String} key of listener
   */

  off(type, key) {
    if (this._hasEventKey(type, key)) {
      let listener = this.eventListeners().get(type).get(key)
      this._elementRemoveListener(listener.type, listener.listener, listener.options)
      this._removeEventListenerByKey(type, key)
    }
  }

  /**
   *
   * @param t{string} ype
   * @param {function} listener
   * @param {Object} options
   * @private
   */
  _elementRemoveListener(type, listener, options) {
    this.element.removeEventListener(type, listener, options)
  }

  /**
   * Remove all listeners
   */
  cleanListeners() {
    if (this.eventListeners().size) {
      this.eventListeners().forEach((value, key, map) => {
        value.forEach((v, k, m) => {
          this._elementRemoveListener(v.type, v.listener, v.options)
        })
      })
    }
  }

  /**
   *
   * @param {string} type
   * @param {string} key
   * @private
   */
  _removeEventListenerByKey(type, key) {
    if (this.eventListeners().has(type)) {
      this.eventListeners().get(type).delete(key)
    }
  }

  /**
   *
   * @param {string} type
   * @param {function} listener
   * @param {Object} options
   * @return {{type: string, listener: function, useCapture: boolean}}
   * @private
   */
  _formatListenerShallow(type, listener, options) {
    return deepFreezeSeal({
      type: type,
      listener: listener,
      options: options
    })
  }

  /**
   *
   * @param {string} type
   * @param {string} key
   * @return {boolean}
   * @private
   */
  _hasEventKey(type, key) {
    return this.eventListeners().has(type) && this.eventListeners().get(type).has(key)
  }
}

export const select = ListenerAttributeHandler.select
export {
  ListenerAttributeHandler
}
