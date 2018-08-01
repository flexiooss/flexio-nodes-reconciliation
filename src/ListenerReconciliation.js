'use strict'
import {isNode, assert} from 'flexio-jshelpers'

/**
 * @param {NodeElement} current
 * @param {NodeElement} candidate
 */
class ListenerReconciliation {
  /**
   *
   * @param {Node} current
   * @param {ListenerAttributeHandler} $current
   * @param {Node} candidate
   * @param {ListenerAttributeHandler} $candidate
   */
  constructor(current, $current, candidate, $candidate) {
    assert(isNode(current) && isNode(candidate),
      'EventReconciliation: `current` and  `candidate` arguments assert be Node')

    this.current = current
    this.$current = $current
    this.candidate = candidate
    this.$candidate = $candidate
  }

  /**
   * @static
   * @param {NodeElement} current
   * @param {NodeElement} candidate
   */
  static listenerReconciliation(current, $current, candidate, $candidate) {
    new ListenerReconciliation(current, $current, candidate, $candidate).reconcile()
  }

  /**
   * @static
   * @param {Map<string, Map<string, EventListenerParam>>} currentEventsListeners
   * @param {Map<string, Map<string, EventListenerParam>>} candidateEventsListeners
   */
  static assertUpdateCurrent(currentEventsListeners, candidateEventsListeners) {
    var ret = true

    const test = (a, b) => {
      a.forEach((listener, token, map) => {
        if (listener.size && !b.has(token)) {
          ret = false
          return false
        }
        if (listener instanceof Map) {
          let bListeners = b.get(token)
          listener.forEach((value, key, map) => {
            if (!bListeners.has(key)) {
              ret = false
              return false
            }
          })
        }
      })
    }

    test(candidateEventsListeners, currentEventsListeners)

    if (ret) {
      test(currentEventsListeners, candidateEventsListeners)
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
    console.log('bouh')
    this.$candidate.eventListeners().forEach((listener, token, map) => {
      if (!this.$current.eventListeners().has(token)) {
        console.log('ici')
        this._addAllListeners(token)
      } else {
        console.log('la')
        this._updateCurrent(token)
      }
    })

    this.$current.eventListeners().forEach((listener, token, map) => {
      if (!this.$candidate.eventListeners().has(token)) {
        this._removeAllListeners(token)
      }
    })
  }

  /**
   * @private
   * @param {String} event : type of event
   */
  _updateCurrent(event) {
    const currentListenersMap = this.$current.eventListeners().get(event)
    const candidateListenersMap = this.$candidate.eventListeners().get(event)

    currentListenersMap.forEach((listener, token, set) => {
      if (!candidateListenersMap.has(token)) {
        this._removeEventListener(listener.event, token)
      }
    })
    candidateListenersMap.forEach((listener, token, set) => {
      if (!currentListenersMap.has(token)) {
        this._addEventListener(listener)
      }
    })
    console.log(currentListenersMap)
  }

  /**
   * @private
   * @param {String} event : type of event
   */
  _removeAllListeners(event) {
    this.$current.eventListeners().get(event)
      .forEach((listener, token, set) => {
        this._removeEventListener(listener.event, token)
      })
  }

  /**
   * @private
   * @param {String} event : type of event
   */
  _addAllListeners(event) {
    this.$candidate.eventListeners().get(event)
      .forEach((listener, token, set) => {
        this._addEventListener(listener)
      })
  }

  /**
   * @private
   * @param {String} event : type of event
   * @param {String} token of Listener Map entry
   */
  _removeEventListener(event, token) {
    this.$current.off(event, token)
  }

  /**
   * @private
   * @param {EventListenerParam} listener : type of event
   */
  _addEventListener(listener) {
    this.$current.on(listener)
  }
}

export const listenerReconcile = ListenerReconciliation.listenerReconciliation
export const assertUpdateCurrent = ListenerReconciliation.assertUpdateCurrent
