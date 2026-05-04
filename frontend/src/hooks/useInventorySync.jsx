import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useInventorySync() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws/inventory`)
    ws.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
    return () => ws.close()
  }, [queryClient])
}