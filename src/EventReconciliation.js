'use strict'
import {
  isNode,
  should
} from 'flexio-jshelpers'
import {
  handleAttribute as har
} from './AttributeHandler'

/**
 * @param {NodeElement} current
 * @param {NodeElement} candidate
 */
class EventReconciliation {
  constructor(current, candidate) {
    should(isNode(current) && isNode(candidate),
      'EventReconciliation: `current` and  `candidate` arguments should be Node')

    this.current = current
    this.candidate = candidate
    this.harCurrent = har(current)
    this.harCandidate = har(candidate)
  }

  /**
     * @static
     * @param {NodeElement} current
     * @param {NodeElement} candidate
     */
  static eventReconciliation(current, candidate) {
    new EventReconciliation(current, candidate).reconcile()
  }

  reconcile() {
    this._traverseTypes()
  }

  /**
     * @private
     */
  _traverseTypes() {
    this.harCandidate.eventListeners().forEach((value, key, map) => {
      if (!this.harCurrent.eventListeners().has(key)) {
        this._addAllListeners(key)
      } else {
        this._updateCurrent(key)
      }
    })

    this.harCurrent.eventListeners().forEach((value, key, map) => {
      if (!this.harCandidate.eventListeners().has(key)) {
        this._removeAllListeners(key)
      }
    })
  }

  /**
     * @private
     * @param {String} type : type of event
     */
  _updateCurrent(type) {
    let currentSet = this.harCurrent.eventListeners().get(type)
    let candidateSet = this.harCandidate.eventListeners().get(type)
    candidateSet.forEach((value, key, set) => {
      if (!currentSet.has(value)) {
        this._addEventListener(value.type, value.listener, value.useCapture)
      }
    })
    currentSet.forEach((value, key, set) => {
      if (!candidateSet.has(value)) {
        this._removeEventListener(value.type, value.listener, value.useCapture)
      }
    })
  }

  /**
     * @private
     * @param {String} type : type of event
     */
  _removeAllListeners(type) {
    this.harCurrent.eventListeners().get(type)
      .forEach((value, key, set) => {
        this._removeEventListener(value.type, value.listener, value.useCapture)
      })
  }

  /**
     * @private
     * @param {String} type : type of event
     */
  _addAllListeners(type) {
    this.harCandidate.eventListeners().get(type)
      .forEach((value, key, set) => {
        this._addEventListener(value.type, value.listener, value.useCapture)
      })
  }

  /**
     * @private
     * @param {String} type : type of event
     * @param {Function} listener
     * @param {Boolean} useCapture
     */
  _removeEventListener(type, listener, useCapture) {
    this.harCurrent.off(type, listener, useCapture)
  }

  /**
     * @private
     * @param {String} type : type of event
     * @param {Function} listener
     * @param {Boolean} useCapture
     */
  _addEventListener(type, listener, useCapture) {
    this.harCurrent.on(type, listener, useCapture)
  }
}

export const eventReconcile = EventReconciliation.eventReconciliation
