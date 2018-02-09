'use strict'
import {
  isNode,
  should,
  isNodeText
} from 'flexio-jshelpers'

const EXCLUDES_ATTRIBUTES = ['class', 'id']

class NodeReconciliation {
  constructor(current, candidate) {
    should(isNode(current) && isNode(candidate),
      'NodeReconciliation: `current` and  `candidate` arguments should be Node')

    this.current = current
    this.candidate = candidate
  }

  static nodeReconciliation(current, candidate) {
    new NodeReconciliation(current, candidate).reconcile()
  }

  reconcile() {
    if (isNodeText(this.candidate)) {
      this._updateText()
    } else if (this.current.tagName === this.candidate.tagName) {
      this._updateClassList()
      this._updateAttr()
    } else {
      this.current.replaceWith(this.candidate)
    }
  }

  _updateText() {
    if (isNodeText(this.current) && (this.candidate.nodeValue !== this.current.nodeValue)) {
      this.current.nodeValue = this.candidate.nodeValue
    } else {
      this.current.replaceWith(this.candidate)
    }
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
