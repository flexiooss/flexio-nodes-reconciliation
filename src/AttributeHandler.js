import {
  isNode,
  should
} from 'flexio-jshelpers'
import {
  KEY
} from './constantes'

const KEY_ROOT = '__FNR__'
const EVENT_WRAPPER = 'events'
const RECONCILIATE_RULES = 'reconciliateRules'

class AttributeHandler {
  constructor(element) {
    should(
      isNode(element),
      'flexio-nodes-reconciliation:AttributeHandler:constructor: `element` argument should be a NodeElement, `%s` given',
      typeof element)
    this.element = element
    if (!this._hasRootAttribute()) {
      this._initRootAttribute()
    }
    this.privateAttribute = this.element[KEY_ROOT]
  }

  static createClass(element) {
    return new AttributeHandler(element)
  }

  _initRootAttribute() {
    this.element[KEY_ROOT] = {}
  }

  _hasRootAttribute() {
    return KEY_ROOT in this.element
  }

  setAttribute(key, value) {
    this.privateAttribute[key] = value
  }

  /**
     *
     * --------------------------------------------------------------
     * Reconciliation
     * --------------------------------------------------------------
     */
  hasReconciliationRules() {
    return KEY.RECONCILIATE_RULES in this.privateAttribute
  }

  hasReconciliationRule(rule) {
    return (KEY.RECONCILIATE_RULES in this.privateAttribute) && (this.privateAttribute[KEY.RECONCILIATE_RULES].indexOf(rule) !== -1)
  }

  reconciliateRules() {
    return (KEY.RECONCILIATE_RULES in this.privateAttribute) ? this.privateAttribute[KEY.RECONCILIATE_RULES] : this._initReconciliateRule()
  }

  _initReconciliateRule() {
    return []
  }
  /**
     *
     * --------------------------------------------------------------
     * EventListener
     * --------------------------------------------------------------
     */

  eventListeners() {
    return (KEY.EVENT_WRAPPER in this.privateAttribute) ? this.privateAttribute[KEY.EVENT_WRAPPER] : this._initEventListener()
  }
  _initEventListener() {
    return new Map()
  }
  _initEventListenerType() {
    return new Set()
  }

  /**
     * @function on
     * @description add to shallow copy type listened for cloning the elementement easier
     * @param {String} type of event
     * @param {NodeElement} element
     * @param {Function} listener
     * @param {Boolean} useCapture
     */
  on(type, listener, useCapture) {
    useCapture = useCapture || false
    this.element.addEventListener(type, listener, useCapture)
    this._addEventListener(type, listener, useCapture)
  }
  _addEventListener(type, listener, useCapture) {
    if (!(KEY.EVENT_WRAPPER in this.privateAttribute)) {
      this.privateAttribute[KEY.EVENT_WRAPPER] = this._initEventListener()
    }
    if (!(this.privateAttribute[KEY.EVENT_WRAPPER].has(type))) {
      this.privateAttribute[KEY.EVENT_WRAPPER].set(type, this._initEventListenerType())
    }

    this.privateAttribute[KEY.EVENT_WRAPPER].get(type).add({
      type: type,
      listener: listener,
      useCapture: useCapture
    })
  }

  /**
     * @function off
     * @description remove from shallow copy type listened
     * @param {String} type of event
     * @param {NodeElement} element
     * @param {Function} listener
     * @param {Boolean} useCapture
     */
  off(type, listener, useCapture) {
    useCapture = useCapture || false
    this.element.removeEventListener(type, listener, useCapture)
    this._removeEventListener(type, listener, useCapture)
  }
  _removeEventListener(type, listener, useCapture) {
    if (this.privateAttribute[KEY.EVENT_WRAPPER].has(type)) {
      this.privateAttribute[KEY.EVENT_WRAPPER].get(type).delete({
        type: type,
        listener: listener,
        useCapture: useCapture
      })
    }
  }
}
export const handleAttribute = AttributeHandler.createClass
