import React from 'react'

const Loading = ({ width = 20, height = 20, label = 'Loading' }) => {
    return (
        <div className="flex justify-center items-center py-4" role="status" aria-label={label}>
            <div
                aria-hidden="true"
                style={{ width, height }}
                className="border-2 border-brand border-t-transparent rounded-full animate-spin"
            />
        </div>
    )
}

export default Loading;
