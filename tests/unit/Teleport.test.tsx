import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Teleport } from '@/components/Teleport'

describe('teleport', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('renders content into an existing target', async () => {
    document.body.innerHTML = '<div id="teleport-target"></div>'

    render(
      <Teleport to="#teleport-target">
        <span>Teleported content</span>
      </Teleport>,
    )

    expect(await screen.findByText('Teleported content')).toBeInTheDocument()
  })

  it('renders content when target appears after mount', async () => {
    render(
      <Teleport to="#teleport-late-target">
        <span>Late content</span>
      </Teleport>,
    )

    expect(screen.queryByText('Late content')).not.toBeInTheDocument()

    const target = document.createElement('div')
    target.id = 'teleport-late-target'
    document.body.append(target)

    await waitFor(() => {
      expect(screen.getByText('Late content')).toBeInTheDocument()
    })
  })

  it('does not remove the target node on unmount', async () => {
    document.body.innerHTML = '<div id="teleport-sticky-target"></div>'

    const { unmount } = render(
      <Teleport to="#teleport-sticky-target">
        <span>Sticky content</span>
      </Teleport>,
    )

    expect(await screen.findByText('Sticky content')).toBeInTheDocument()
    unmount()

    expect(document.querySelector('#teleport-sticky-target')).not.toBeNull()
  })
})
