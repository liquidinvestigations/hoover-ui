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
    let missingLoadingETA = Number.MAX_SAFE_INTEGER
    if (missingTask) {
        if (missingTask.status === 'done') {
            missingLoadingETA = 0
        } else {
            missingLoadingETA = Math.min(missingTask.initialEta, missingTask.eta.total_sec)
        }
    }

    return { missingLoading: missingLoading[field], missingLoadingETA }
}
