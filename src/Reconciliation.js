'use strict'
import {isNode, assert, removeChildNodes} from 'flexio-jshelpers'
import {select} from './ListenerAttributeHandler'
import {nodeReconcile} from './NodeReconciliation'
import {assertUpdateCurrent, listenerReconcile} from './ListenerReconciliation'
import {RECONCILIATION_RULES as R} from './rules'

const MAX_SLIBINGS_NODES_UPDATE_BY_ID = 50

/**
 *
 * @param {Element} current
 * @param {Element} candidate
 * @param {Element} parentCurrent Parent of current element
 */

export class Reconciliation {
  /**
   *
   * @param {Element} current
   * @param {Element} candidate
   * @param {Element} parentCurrent
   */
  constructor(current, candidate, parentCurrent = null) {
    console.log('Reconciliation')
    assert(isNode(current) && isNode(candidate),
      'Reconciliation: `current : %s` and  `candidate : %s` arguments assert be Node',
      typeof current, typeof candidate)

    console.log(current)
    console.dir(current)
    console.log(candidate)
    console.dir(candidate)
    /**
     *
     * @type {Element}
     */
    this.current = current
    /**
     *
     * @type {Element | null}
     */
    this.parentCurrent = parentCurrent
    /**
     *
     * @type {Element}
     */
    this.candidate = candidate
    /**
     *
     * @type {ListenerAttributeHandler}
     */
    this.$current = this.castAttributes(current)
    /**
     *
     * @type {ListenerAttributeHandler}
     */
    this.$candidate = this.castAttributes(candidate)
    /**
     *
     * @type {(null | boolean)}
     * @private
     */
    this._equalNode = null
    /**
     *
     * @type {(null|boolean)}
     * @private
     */
    this._equalListeners = null
    /**
     *
     * @type {(null | boolean)}
     * @private
     */
    this._equalWithoutChildren = null
    /**
     *
     * @type {boolean}
     * @private
     */
    this._isCurrentReplaced = false

    /**
     * @type {boolean}
     * @protected
     */
    this._rootReconciliation = false
  }

  /**
   *
   * @param {boolean} rootReconciliation
   * @return {Reconciliation}
   */
  withRootReconciliation(rootReconciliation) {
    this._rootReconciliation = rootReconciliation
    return this
  }

  /**
   *
   * @return {boolean}
   */
  isRootElementReconcile() {
    return this._rootReconciliation === true
  }

  /**
   *
   * @param {Element} element
   * @return {AttributeHandler}
   */
  castAttributes(element) {
    return select(element)
  }

  /**
   * @static
   * @param {Element} current
   * @param {Element} candidate
   * @param {Element} parentCurrent Parent of current element
   */
  static reconciliation(current, candidate, parentCurrent) {
    new Reconciliation(current, candidate, parentCurrent).reconcile()
  }

  /**
   * @static
   * @param {Element} current
   * @param {Element} candidate
   * @param {Element} parentCurrent Parent of current element
   */
  static startReconciliation(current, candidate, parentCurrent) {
    new Reconciliation(current, candidate, parentCurrent)
      .withRootReconciliation(true)
      .reconcile()
  }

  /**
   * @param {Element} current
   * @param {Element} candidate
   * @param {Element} parentCurrent Parent of current element
   */
  reconciliation(current, candidate, parentCurrent) {
    new this.constructor(current, candidate, parentCurrent).reconcile()
  }

  /**
   *
   * @return {(boolean | void)}
   */
  reconcile() {
    if (this.__hasByPathRule() || (this.__isEqualNode() && this.__isEqualListeners())) {
      return this._abort()
    }
    if (!this.__isEqualNode()) {
      if (!this.__isEqualWithoutChildren() || this.__hasReplaceRule()) {
        this.__updateCurrent()
      }
      if (!this._isCurrentReplaced && !this.__hasExcludeChildrenRule()) {
        this.__reconcileChildNodes()
      }
    }

    if (!this.__hasExcludeListenersRule() && !this._isCurrentReplaced && !this.__isEqualListeners()) {
      listenerReconcile(this.current, this.$current, this.candidate, this.$candidate)
    }
  }

  /**
   *
   * @private
   */
  __updateCurrent() {
    this._isCurrentReplaced = nodeReconcile(this.current, this.$current, this.candidate, this.$candidate)
  }

  /**
   * @private
   * @method
   * @description
   */
  __reconcileChildNodes() {
    if (this.candidate.hasChildNodes()) {
      this.__traverseChildNodes()
    } else if (this.current.hasChildNodes()) {
      removeChildNodes(this.current)
    }
  }

  /**
   * @private
   * @description traverse and reconcile slibing's nodes
   *
   */
  __traverseChildNodes() {
    let candidate = this.candidate.firstChild
    var i = 0
    do {
      let nextCandidate = candidate.nextSibling
      let current = this.__currentById(i, candidate)
      if (current) {
        this.reconciliation(current, candidate, this.current)
      } else {
        this.current.appendChild(candidate)
      }
      candidate = nextCandidate
      nextCandidate = null
      i++
    } while (candidate)

    if (this.current.childNodes.length > this.candidate.childNodes.length) {
      removeChildNodes(this.current, i)
    }
  }

  /**
   * @private
   * @param {Number} keyChildNode
   * @param {Element} candidate
   * @description search and replace current element if a slibing node has the same id as the candidate
   */
  __currentById(keyChildNode, candidate) {
    if (!(keyChildNode in this.current.childNodes)) {
      return false
    }
    if (candidate.id) {
      if (this.current.childNodes[keyChildNode].id === candidate.id) {
        return this.current.childNodes[keyChildNode]
      } else {
        let el = this.__findNodeByIdInChildNodes(this.current, candidate.id, keyChildNode)
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
   * @param {Element} parentNode
   * @param {String} id
   */
  __findNodeByIdInChildNodes(parentNode, id, start) {
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
  __isEqualNode() {
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
  __isEqualListeners() {
    if (this._equalListeners === null) {
      this._equalListeners = assertUpdateCurrent(this.$current.eventListeners(), this.$candidate.eventListeners())
    }
    return this._equalListeners
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  __isEqualWithoutChildren() {
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
  __hasByPathRule() {
    console.log('__hasByPathRule')
    console.log(this.$candidate.hasReconciliationRule(R.BYPATH))
    return this.$candidate.hasReconciliationRule(R.BYPATH)
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  __hasExcludeChildrenRule() {
    return this.$candidate.hasReconciliationRule(R.BYPATH_CHILDREN)
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  __hasExcludeListenersRule() {
    return this.$candidate.hasReconciliationRule(R.BYPATH_LISTENERS)
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  __hasReplaceRule() {
    return this.$candidate.hasReconciliationRule(R.REPLACE)
  }

  /**
   *
   * @return {boolean} false
   * @protected
   */
  _abort() {
    return false
  }
}

export const reconcile = Reconciliation.reconciliation
export const startReconcile = Reconciliation.startReconciliation
