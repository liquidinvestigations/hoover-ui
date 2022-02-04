import { useEffect } from 'react'
import { useSearch } from '../SearchProvider'

export default function useMissingLoader(open, missing, field) {
    const { missingTasks, missingLoading, loadMissing } = useSearch()
    useEffect(() => {
        if (open && !missing) {
            loadMissing(field)
        }
    }, [open, missing])

    const missingTask = missingTasks[field]
    let missingLoadingProgress = 5
    if (missingTask) {
        if (missingTask.status === 'done') {
            missingLoadingProgress = 100
        } else if (missingTask.eta.total_sec / missingTask.initialEta < 1) {
            missingLoadingProgress = Math.max(5, missingTask.eta.total_sec / missingTask.initialEta * 100)
        }
    }

    return { missingLoading: missingLoading[field], missingLoadingProgress }
}
