'use strict'
import {
  isNode,
  should,
  removeChildren
} from 'flexio-jshelpers'
import {
  handleAttribute as ha
} from './AttributeHandler'
import {
  nodeReconcile
} from './NodeReconciliation'

import {
  RECONCILIATION_RULES as R
} from './constantes'

const compareMapOrSet = (a, b) => {
  if (a.size !== b.size) {
    return false
  }
  let ret = a.forEach((value, key, map) => {
    if (!b.has(key)) {
      return false
    }
    if (!compareMapOrSet(b.get(key), value)) {
      return false
    }
  })
  return ret !== false
}

/**
 *
 * @param {NodeElement} current
 * @param {NodeElement} candidate
 * @param {NodeElement} parentCurrent parent of current element

 */

class Reconciliation {
  constructor(current, candidate, parentCurrent) {
    should(isNode(current) && isNode(candidate),
      'Reconciliation: `current` and  `candidate` arguments should be Node')

    this.current = current
    this.parentCurrent = parentCurrent || null
    this.candidate = candidate
    this.haCurrent = ha(current)
    this.haCandidate = ha(candidate)
    this._equalNode = null
    this._equalListeners = null
    this._equalWithoutChildren = null
  }

  static reconciliation(current, candidate, parentCurrent) {
    new Reconciliation(current, candidate, parentCurrent).reconcile()
  }

  reconcile() {
    if (this._hasByPathRule() || (this._isEqualNode() && this._isEqualListeners())) {
      return this._abort()
    }

    if (!this._isEqualNode()) {
      if (this._compareNodeType() === false) {
        return this._abort()
      }
      if (this._compareTagName() === false) {
        return this._abort()
      }

      if (this._hasExcludeChildrenRule() && this._isEqualWithoutChildren()) {
        return this._abort()
      }

      if (!this._isEqualWithoutChildren()) {
        this._updateCurrent()
      }
      this._reconcileChildNodes()
    }

    if (!this._isEqualListeners()) {

    }
  }

  /**
     *
     * --------------------------------------------------------------
     * Actions
     * --------------------------------------------------------------
     */

  _compareNodeType() {
    if (this.current.nodeType !== this.candidate.nodeType) {
      this.parentCurrent.replaceChild(this.candidate, this.current)
      return false
    }
  }
  _compareTagName() {
    if (this.current.tagName !== this.candidate.tagName) {
      this.parentCurrent.replaceChild(this.candidate, this.current)
      // this.current.replaceWith(this.candidate)
      return false
    }
  }

  _updateCurrent() {
    nodeReconcile(this.current, this.candidate)
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
      this.removeChildren(this.current)
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
    let i = 0
    do {
      let nextCandidate = candidate.nextSibling
      let current = this._currentById(i, candidate)
      if (current) {
        Reconciliation.reconciliation(current, candidate, this.current)
      } else {
        this.current.appendChild(candidate)
      }
      candidate = nextCandidate
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
        let el = this._findNodeByIdInChildNodes(this.current, candidate.id)
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
  _findNodeByIdInChildNodes(parentNode, id) {
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
      this._equalListeners = compareMapOrSet(this.haCurrent.eventListeners(), this.haCandidate.eventListeners())
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
    return this.haCurrent.hasReconciliationRule(R.BYPATH)
  }
  _hasExcludeChildrenRule() {
    return this.haCurrent.hasReconciliationRule(R.EXCLUDE_CHILDS)
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
