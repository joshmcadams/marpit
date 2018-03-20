import assert from 'assert'
import cheerio from 'cheerio'
import dedent from 'dedent'
import MarkdownIt from 'markdown-it'
import comment from '../../src/markdown/comment'

describe('Marpit comment plugin', () => {
  const md = (mdOption = {}) =>
    new MarkdownIt('commonmark', mdOption).use(comment)

  const text = dedent`
    # foo
    <!-----comment!-->

    <!--
    supports
    multiline
    -->
    ## bar
    comment<!-- inline -->Test

    ### <!-- comment in header -->
  `

  it('ignores in #renderInline', () => {
    assert(md().renderInline('<!-- test -->') === '<!-- test -->')
  })

  const htmls = [true, false]

  htmls.forEach(html => {
    context(`with html option as ${html}`, () => {
      const markdown = md({ html })

      it('extracts comment and stores to token meta', () => {
        const parsed = markdown.parse(text)
        const comments = parsed.reduce((arr, token) => {
          if (token.meta && token.meta.marpitComment)
            return [...arr, ...token.meta.marpitComment]

          return arr
        }, [])

        assert(comments.includes('comment!'))
        assert(comments.includes('supports\nmultiline'))
        assert(comments.includes('inline'))
        assert(comments.includes('comment in header'))
      })

      it('strips comment in rendering', () => {
        const $ = cheerio.load(markdown.render(text))
        const comments = $('*')
          .contents()
          .filter(function filterComment() {
            return this.nodeType === 8
          })

        assert(comments.length === 0)
        assert($('h1').length === 1)
        assert($('h1').text() === 'foo')
        assert($('h2').length === 1)
        assert($('h2').text() === 'bar')
        assert($('h3').length === 1)
        assert($('h3').text() === '')
        assert($('p').length === 1)
        assert($('p').text() === 'commentTest')
      })
    })
  })
})