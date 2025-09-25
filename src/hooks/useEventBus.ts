import { useEffect, useCallback } from 'react'

type EventCallback = (detail?: any) => void

export const useEventBus = () => {
  const emit = useCallback((eventName: string, detail?: any) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }, [])

  const listen = useCallback((eventName: string, callback: EventCallback) => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent
      callback(customEvent.detail)
    }

    window.addEventListener(eventName, handler)
    
    return () => {
      window.removeEventListener(eventName, handler)
    }
  }, [])

  return { emit, listen }
}
