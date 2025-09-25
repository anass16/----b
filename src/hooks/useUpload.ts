import { useState } from 'react'
import { attendanceApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { useLang } from './useLang'
import { useEventBus } from './useEventBus'

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const { t } = useLang()
  const { emit } = useEventBus()

  const uploadFile = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    
    try {
      const response = await attendanceApi.import(file)
      toast.success(t('alerts.uploadSuccess'))
      
      // Emit event to refresh data
      emit('attendance:imported', response.data)
      
      return response.data
    } catch (error) {
      toast.error(t('alerts.error'))
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadFile,
    isUploading
  }
}
