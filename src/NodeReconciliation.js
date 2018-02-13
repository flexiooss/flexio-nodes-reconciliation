'use strict'
import {
  isNode,
  assert,
  isNodeText
} from 'flexio-jshelpers'

import {
  select as $
} from './ListenerAttributeHandler'

const EXCLUDES_ATTRIBUTES = ['class', 'id']

class NodeReconciliation {
  constructor(current, candidate) {
    assert(isNode(current) && isNode(candidate),
      'NodeReconciliation: `current` and  `candidate` arguments assert be Node')

    this.current = current
    this.candidate = candidate
  }

  static nodeReconciliation(current, candidate) {
    return new NodeReconciliation(current, candidate).reconcile()
  }

  reconcile() {
    if (isNodeText(this.candidate)) {
      return this._updateText()
    } else if (this.current.tagName && this.current.tagName === this.candidate.tagName) {
      this._updateClassList()
      this._updateAttr()
    } else {
      return this._replaceWith(this.current, this.candidate)
    }
    return false
  }
  _replaceWith(current, candidate) {
    $(current).cleanListeners()
    current.replaceWith(candidate)
    return true
  }

  _updateText() {
    if (isNodeText(this.current) && (this.candidate.nodeValue !== this.current.nodeValue)) {
      this.current.nodeValue = this.candidate.nodeValue
    } else {
      return this._replaceWith(this.current, this.candidate)
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
}

export const nodeReconcile = NodeReconciliation.nodeReconciliation
