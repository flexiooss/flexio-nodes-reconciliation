'use strict'
import { isNode, assert, removeChildren } from 'flexio-jshelpers'
import { select } from './ListenerAttributeHandler'
import { nodeReconcile } from './NodeReconciliation'
import { assertUpdateCurrent, listenerReconcile } from './ListenerReconciliation'
import { RECONCILIATION_RULES as R } from './rules'

const MAX_SLIBINGS_NODES_UPDATE_BY_ID = 50

/**
 *
 * @param {NodeElement} current
 * @param {NodeElement} candidate
 * @param {NodeElement} parentCurrent parent of current element
 */

class Reconciliation {
  constructor(current, candidate, parentCurrent) {
    assert(isNode(current) && isNode(candidate),
      'Reconciliation: `current` and  `candidate` arguments assert be Node')

    this.current = current
    this.parentCurrent = parentCurrent || null
    this.candidate = candidate
    this.harCurrent = select(current)
    this.harCandidate = select(candidate)
    this._equalNode = null
    this._equalListeners = null
    this._equalWithoutChildren = null
    this._isCurrentReplaced = false
  }

  /**
     * @static
     * @param {NodeElement} current
     * @param {NodeElement} candidate
     * @param {NodeElement} parentCurrent parent of current element
     */
  static reconciliation(current, candidate, parentCurrent) {
    new Reconciliation(current, candidate, parentCurrent).reconcile()
  }

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
     * --------------------------------------------------------------
     * Actions
     * --------------------------------------------------------------
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
     * @method
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
     * @param {Int} keyChildNode
     * @param {NodeElement} candidate
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
     * @param {NodeElement} parentNode
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
     * --------------------------------------------------------------
     * test
     * --------------------------------------------------------------
     */
  _isEqualNode() {
    if (this._equalNode === null) {
      this._equalNode = this.current.isEqualNode(this.candidate)
    }
    return this._equalNode
  }
  _isEqualListeners() {
    if (this._equalListeners === null) {
      this._equalListeners = assertUpdateCurrent(this.harCurrent.eventListeners(), this.harCandidate.eventListeners())
    }
    return this._equalListeners
  }
  _isEqualWithoutChildren() {
    if (this._equalWithoutChildren === null) {
      this._equalWithoutChildren = this.current.cloneNode(false).isEqualNode(this.candidate.cloneNode(false))
    }
    return this._equalWithoutChildren
  }

  /**
     *
     * --------------------------------------------------------------
     * Rules
     * --------------------------------------------------------------
     */
  _hasByPathRule() {
    return this.harCurrent.hasReconciliationRule(R.BYPATH)
  }
  _hasExcludeChildrenRule() {
    return this.harCurrent.hasReconciliationRule(R.BYPATH_CHILDREN)
  }
  _hasExcludeListenersRule() {
    return this.harCurrent.hasReconciliationRule(R.BYPATH_LISTENERS)
  }
  /**
     *
     * --------------------------------------------------------------
     * Return
     * --------------------------------------------------------------
     */
  _abort() {
    return false
  }
}

export const reconcile = Reconciliation.reconciliation
