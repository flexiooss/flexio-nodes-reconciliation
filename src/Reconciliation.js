'use strict'
import {isNode, assert, removeChildren} from 'flexio-jshelpers'
import {select} from './ListenerAttributeHandler'
import {nodeReconcile} from './NodeReconciliation'
import {assertUpdateCurrent, listenerReconcile} from './ListenerReconciliation'
import {RECONCILIATION_RULES as R} from './rules'

const MAX_SLIBINGS_NODES_UPDATE_BY_ID = 50

/**
 *
 * @param {Node} current
 * @param {Node} candidate
 * @param {Node} parentCurrent parent of current element
 */

class Reconciliation {
  /**
   *
   * @param {Node} current
   * @param {Node} candidate
   * @param {Node} parentCurrent
   */
  constructor(current, candidate, parentCurrent = null) {
    assert(isNode(current) && isNode(candidate),
      'Reconciliation: `current : %s` and  `candidate : %s` arguments assert be Node',
      typeof current, typeof candidate)
    /**
     *
     * @type {Node}
     */
    this.current = current
    /**
     *
     * @type {Node | null}
     */
    this.parentCurrent = parentCurrent
    /**
     *
     * @type {Node}
     */
    this.candidate = candidate
    /**
     *
     * @type {ListenerAttributeHandler}
     */
    this.harCurrent = select(current)
    /**
     *
     * @type {ListenerAttributeHandler}
     */
    this.harCandidate = select(candidate)
    /**
     *
     * @type {null | boolean}
     * @private
     */
    this._equalNode = null
    /**
     *
     * @type {null | boolean}
     * @private
     */
    this._equalListeners = null
    /**
     *
     * @type {null | boolean}
     * @private
     */
    this._equalWithoutChildren = null
    /**
     *
     * @type {boolean}
     * @private
     */
    this._isCurrentReplaced = false
  }

  /**
   * @static
   * @param {Node} current
   * @param {Node} candidate
   * @param {Node} parentCurrent parent of current element
   */
  static reconciliation(current, candidate, parentCurrent) {
    new Reconciliation(current, candidate, parentCurrent).reconcile()
  }

  /**
   *
   * @return {boolean | void}
   */
  reconcile() {
    if (this._hasByPathRule() || (this._isEqualNode() && this._isEqualListeners())) {
      return this._abort()
    }
    if (!this._isEqualNode()) {
      if (!this._isEqualWithoutChildren()) {
        this._updateCurrent()
      }
      if (!this._isCurrentReplaced && !this._hasExcludeChildrenRule()) {
        this._reconcileChildNodes()
      }
    }

    if (!this._hasExcludeListenersRule() && !this._isCurrentReplaced && !this._isEqualListeners()) {
      listenerReconcile(this.current, this.candidate)
    }
  }

  /**
   *
   * @private
   */
  _updateCurrent() {
    this._isCurrentReplaced = nodeReconcile(this.current, this.candidate)
  }

  /**
   * @private
   * @method
   * @description
   */
  _reconcileChildNodes() {
    if (this.candidate.hasChildNodes()) {
      this._traverseChildNodes()
    } else if (this.current.hasChildNodes()) {
      removeChildren(this.current)
    }
  }

  /**
   * @private
   * @description traverse and reconcile slibing's nodes
   *
   */
  _traverseChildNodes() {
    let candidate = this.candidate.firstChild
    var i = 0
    do {
      let nextCandidate = candidate.nextSibling
      let current = this._currentById(i, candidate)
      if (current) {
        Reconciliation.reconciliation(current, candidate, this.current)
      } else {
        this.current.appendChild(candidate)
      }
      candidate = nextCandidate
      nextCandidate = null
      i++
    } while (candidate)

    if (this.current.childNodes.length > this.candidate.childNodes.length) {
      removeChildren(this.current, i)
    }
  }

  /**
   * @private
   * @param {Number} keyChildNode
   * @param {Node} candidate
   * @description search and replace current element if a slibing node has the same id as the candidate
   */
  _currentById(keyChildNode, candidate) {
    if (!(keyChildNode in this.current.childNodes)) {
      return false
    }
    if (candidate.id) {
      if (this.current.childNodes[keyChildNode].id === candidate.id) {
        return this.current.childNodes[keyChildNode]
      } else {
        let el = this._findNodeByIdInChildNodes(this.current, candidate.id, keyChildNode)
        if (isNode(el)) {
          this.current.insertBefore(el, this.current.childNodes[keyChildNode])
          return el
        }
      }
    }
    return this.current.childNodes[keyChildNode]
  }

  /**
   * @private
   * @param {Node} parentNode
   * @param {String} id
   */
  _findNodeByIdInChildNodes(parentNode, id, start) {
    if (parentNode.childNodes.length > MAX_SLIBINGS_NODES_UPDATE_BY_ID) {
      return false
    }
    for (let i = parentNode.childNodes.length - 1; i >= 0; i--) {
      if (parentNode.childNodes[i].id === id) {
        return parentNode.childNodes[i]
      }
    }
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  _isEqualNode() {
    if (this._equalNode === null) {
      this._equalNode = this.current.isEqualNode(this.candidate)
    }
    return this._equalNode
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  _isEqualListeners() {
    if (this._equalListeners === null) {
      this._equalListeners = assertUpdateCurrent(this.harCurrent.eventListeners(), this.harCandidate.eventListeners())
    }
    return this._equalListeners
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  _isEqualWithoutChildren() {
    if (this._equalWithoutChildren === null) {
      this._equalWithoutChildren = this.current.cloneNode(false).isEqualNode(this.candidate.cloneNode(false))
    }
    return this._equalWithoutChildren
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  _hasByPathRule() {
    return this.harCurrent.hasReconciliationRule(R.BYPATH)
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  _hasExcludeChildrenRule() {
    return this.harCurrent.hasReconciliationRule(R.BYPATH_CHILDREN)
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  _hasExcludeListenersRule() {
    return this.harCurrent.hasReconciliationRule(R.BYPATH_LISTENERS)
  }

  /**
   *
   * @return {boolean} false
   * @private
   */
  _abort() {
    return false
  }
}

export const reconcile = Reconciliation.reconciliation
