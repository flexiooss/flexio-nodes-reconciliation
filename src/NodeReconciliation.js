'use strict'
import {
  isNode,
  assert,
  isNodeText
} from 'flexio-jshelpers'

import {
  select as $
} from './ListenerAttributeHandler'
import {ReconcileNodeProperties} from './ReconcileNodeProperties'
import {RECONCILIATION_RULES as R} from './rules'

const EXCLUDES_ATTRIBUTES = ['class', 'id']

class NodeReconciliation {
  /**
   *
   * @param {Node} current
   * @param {ListenerAttributeHandler} $current
   * @param {Node} candidate
   * @param {ListenerAttributeHandler} $candidate
   */
  constructor(current, $current, candidate, $candidate) {
    assert(isNode(current) && isNode(candidate),
      'NodeReconciliation: `current` and  `candidate` arguments assert be Node')
    /**
     *
     * @type {Node}
     */
    this.current = current
    /**
     *
     * @type {Node}
     */
    this.$current = $current
    /**
     *
     * @type {Node}
     */
    this.candidate = candidate
    /**
     *
     * @type {Node}
     */
    this.$candidate = $candidate
  }

  static nodeReconciliation(current, $current, candidate, $candidate) {
    return new NodeReconciliation(current, $current, candidate, $candidate).reconcile()
  }

  reconcile() {
    if (this.__hasReplaceRule()) {
      return this.__replaceWith(this.current, this.candidate)
    }
    if (isNodeText(this.candidate)) {
      return this.__updateText()
    } else if (this.current.tagName && this.current.tagName === this.candidate.tagName) {
      this._updateClassList()
      this._updateAttr()
      new ReconcileNodeProperties(this.current, this.candidate).process()
    } else {
      return this.__replaceWith(this.current, this.candidate)
    }
    return false
  }

  /**
   *
   * @param {Node} current
   * @param {Node} candidate
   * @return {boolean}
   * @private
   */
  __replaceWith(current, candidate) {
    $(current).cleanListeners()
    current.replaceWith(candidate)
    return true
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  __updateText() {
    if (isNodeText(this.current) && (this.candidate.nodeValue !== this.current.nodeValue)) {
      this.current.nodeValue = this.candidate.nodeValue
    } else {
      return this.__replaceWith(this.current, this.candidate)
    }
    return false
  }

  _updateClassList() {
    const candidateClassList = this.candidate.classList
    const currentClassList = this.current.classList
    if (candidateClassList && candidateClassList.length) {
      candidateClassList.forEach((value, key, list) => {
        if (!currentClassList.contains(value)) {
          currentClassList.add(value)
        }
      })
    }
    if (candidateClassList && candidateClassList.length) {
      currentClassList.forEach((value, key, list) => {
        if (((currentClassList && currentClassList.length) && !candidateClassList.contains(value))) {
          currentClassList.remove(value)
        }
      })
    }
  }

  _updateAttr() {
    const candidateAttrs = this.candidate.attributes
    if (candidateAttrs) {
      for (let i = candidateAttrs.length - 1; i >= 0; i--) {
        if (EXCLUDES_ATTRIBUTES.indexOf(candidateAttrs[i].name) === -1) {
          if (this.current.getAttribute(candidateAttrs[i].name) !== candidateAttrs[i].value) {
            this.current.setAttribute(candidateAttrs[i].name, candidateAttrs[i].value)
          }
        }
      }
    }

    const currentAttrs = this.current.attributes
    if (currentAttrs) {
      for (let i = currentAttrs.length - 1; i >= 0; i--) {
        if (!this.candidate.hasAttribute(currentAttrs[i].name)) {
          this.current.removeAttribute(currentAttrs[i].name)
        }
      }
    }
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  __hasReplaceRule() {
    return this.$candidate.hasReconciliationRule(R.REPLACE)
  }
}

export const nodeReconcile = NodeReconciliation.nodeReconciliation
