import { clientEntry, type Handle } from 'remix/component'

export let Component = clientEntry(
  '/assets/component.js#Component',
  function Component(handle: Handle) {
    let data: string | null = null

    // Simulating running some kind of browser-only API, like IndexedDB or Geolocation
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        data = '🤖'
        handle.update()
      }, 500)
    }
    return () => (
      <div>
        <div>The robot should render after me</div>
        {data ? <div>{data}</div> : null}
        <div>
          The robot should <strong>not</strong> render after me
        </div>
      </div>
    )
  },
)
