'use strict'
import {isNode, assert} from 'flexio-jshelpers'
import {select} from './ListenerAttributeHandler'

/**
 * @param {NodeElement} current
 * @param {NodeElement} candidate
 */
class ListenerReconciliation {
  constructor(current, candidate) {
    assert(isNode(current) && isNode(candidate),
      'EventReconciliation: `current` and  `candidate` arguments assert be Node')

    this.current = current
    this.candidate = candidate
    this.harCurrent = select(current)
    this.harCandidate = select(candidate)
  }

  /**
   * @static
   * @param {NodeElement} current
   * @param {NodeElement} candidate
   */
  static listenerReconciliation(current, candidate) {
    new ListenerReconciliation(current, candidate).reconcile()
  }

  /**
   * @static
   * @param {ListenerAttributeHandler} current
   * @param {ListenerAttributeHandler} candidate
   */
  static assertUpdateCurrent(current, candidate) {
    var ret = true

    const test = (a, b) => {
      a.forEach((value, key, map) => {
        if (value.size && !b.has(key)) {
          ret = false
          return false
        }
        if (value instanceof Map) {
          let bListeners = b.get(key)
          value.forEach((value, key, map) => {
            if (!bListeners.has(key)) {
              ret = false
              return false
            }
          })
        }
      })
    }

    test(candidate, current)

    if (ret) {
      test(current, candidate)
    }
    return ret
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

    currentSet.forEach((value, key, set) => {
      if (!candidateSet.has(key)) {
        this._removeEventListener(value.type, key)
      }
    })
    candidateSet.forEach((value, key, set) => {
      if (!currentSet.has(key)) {
        this._addEventListener(value.type, value.listener, value.useCapture)
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
        this._removeEventListener(value.type, key)
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
   * @param {String} key of Listener Map entry
   */
  _removeEventListener(type, key) {
    this.harCurrent.off(type, key)
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

export const listenerReconcile = ListenerReconciliation.listenerReconciliation
export const assertUpdateCurrent = ListenerReconciliation.assertUpdateCurrent
