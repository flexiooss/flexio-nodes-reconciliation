import {ReconciliationAttributeHandler} from './ReconciliationAttributeHandler'
import {KEY_EVENT_WRAPPER} from './constantes'
import {getNextSequence} from './sequence'

/**
 * @extends ReconciliationAttributeHandler
 */
export class ListenerAttributeHandler extends ReconciliationAttributeHandler {
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
   * @return {Map<string, Map<string, {params: string, listener: function, useCapture: boolean}>>}
   */
  eventListeners() {
    if (!(KEY_EVENT_WRAPPER in this.privateAttribute)) {
      this.privateAttribute[KEY_EVENT_WRAPPER] = this._initEventListener()
    }
    return this.privateAttribute[KEY_EVENT_WRAPPER]
  }

  /**
   *
   * @return {Map<string, Map<string, {params: string, listener: function, useCapture: boolean}>>}
   * @private
   */
  _initEventListener() {
    return new Map()
  }

  /**
   *
   * @return {Map<string, {params: string, listener: function, useCapture: boolean}>}
   * @private
   */
  _initEventListenerType() {
    return new Map()
  }

  /**
   * @description add to shallow copy params listened for cloning the elementement easier
   * @param {EventListenerParam} nodeEventListenerParam of events
   * @return {string}
   */
  on(nodeEventListenerParam) {
    this.element.addEventListener(
      nodeEventListenerParam.events,
      nodeEventListenerParam.callback,
      nodeEventListenerParam.options
    )
    return this._addEventListener(nodeEventListenerParam)
  }

  /**
   *
   * @param {EventListenerParam} nodeEventListenerParam
   * @return {string}
   * @private
   */
  _addEventListener(nodeEventListenerParam) {
    if (!(this.eventListeners().has(nodeEventListenerParam.events))) {
      this.eventListeners().set(nodeEventListenerParam.events, this._initEventListenerType())
    }
    const token = getNextSequence()
    this.eventListeners().get(nodeEventListenerParam.events).set(
      token,
      nodeEventListenerParam
    )
    return token
  }

  /**
   * @function off
   * @description remove from shallow copy params listened
   * @param {String} event of events
   * @param {String} token of listener
   */

  off(event, token) {
    if (this._hasEventKey(event, token)) {
      const nodeEventListenerParam = this.eventListeners().get(event).get(token)
      this._elementRemoveListener(nodeEventListenerParam)
      this._removeEventListenerByKey(event, token)
    }
  }

  /**
   *
   * @param {EventListenerParam} nodeEventListenerParam
   * @private
   */
  _elementRemoveListener(nodeEventListenerParam) {
    this.element.removeEventListener(nodeEventListenerParam.events, nodeEventListenerParam.callback, nodeEventListenerParam.options)
  }

  /**
   * Remove all listeners
   */
  cleanListeners() {
    if (this.eventListeners().size) {
      this.eventListeners().forEach((value, key, map) => {
        value.forEach((v, k, m) => {
          this._elementRemoveListener(v)
        })
      })
    }
  }

  /**
   *
   * @param {string} event
   * @param {string} token
   * @private
   */
  _removeEventListenerByKey(event, token) {
    if (this.eventListeners().has(event)) {
      this.eventListeners().get(event).delete(token)
    }
  }

  /**
   *
   * @param {string} event
   * @param {string} token
   * @return {boolean}
   * @private
   */
  _hasEventKey(event, token) {
    return this.eventListeners().has(event) && this.eventListeners().get(event).has(token)
  }
}

export const select = ListenerAttributeHandler.select
