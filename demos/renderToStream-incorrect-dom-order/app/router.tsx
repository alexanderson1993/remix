import { createRouter } from 'remix/fetch-router'
import { logger } from 'remix/logger-middleware'
import { staticFiles } from 'remix/static-middleware'
import { renderToStream } from 'remix/component/server'

import { get, route } from 'remix/fetch-router/routes'
import { Component } from './assets/component.tsx'

let middleware = []

if (process.env.NODE_ENV === 'development') {
  middleware.push(logger())
}

middleware.push(
  staticFiles('./public', {
    cacheControl: 'no-store',
    etag: false,
    lastModified: false,
    index: false,
  }),
)

export let router = createRouter({ middleware })

export let routes = route({
  home: get('/'),
})

function App() {
  return () => (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>renderToStream incorrect order</title>
        <script async type="module" src="/assets/entry.js" />
      </head>
      <body
        css={{
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji',
          margin: 0,
          padding: 24,
          background: '#0b1020',
          color: '#e9eefc',
        }}
      >
        <div css={{ maxWidth: 980, margin: '0 auto' }}>
          <Component />
        </div>
      </body>
    </html>
  )
}

router.get(routes.home, async (context: any) => {
  let stream = renderToStream(<App />, {
    onError(error) {
      console.error(error)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
})
