/** @module */
import Token from 'markdown-it/lib/token'

/**
 * Wrap array of tokens by specified container object.
 *
 * @alias module:helpers/wrap_tokens
 * @param {String} type Token type. It will be suffixed by `_open` / `_close`.
 * @param {Object} container A container object to wrap tokens, includes tag
 *     name and attributes.
 * @param {String} container.tag The name of container element.
 * @param {Object} [container.open] The object assigning to an opening token.
 * @param {Object} [container.close] The object assigning to a closing token.
 * @param {Token[]} tokens Wrapping tokens.
 * @returns {Token[]} Wrapped tokens.
 */
function wrapTokens(type, container, tokens) {
  const { tag } = container

  // Update nesting level of wrapping tokens
  tokens.forEach(t => {
    t.level += 1
  })

  // Create markdown-it tokens
  const open = new Token(`${type}_open`, tag, 1)
  const close = new Token(`${type}_close`, tag, -1)

  Object.assign(open, { ...(container.open || {}), children: tokens })
  Object.assign(close, { ...(container.close || {}) })

  // Assign attributes
  Object.keys(container).forEach(attr => {
    if (['open', 'close', 'tag'].includes(attr)) return
    if (container[attr] == null) return

    open.attrSet(attr, container[attr])
  })

  return [open, ...tokens, close]
}

export default wrapTokens