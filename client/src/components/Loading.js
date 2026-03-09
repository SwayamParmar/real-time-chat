import React from 'react'

const Loading = ({ width = 20, height = 20 }) => {
    return (
        <div className="flex justify-center items-center py-4">
            <div
                style={{ width, height }}
                className="border-2 border-brand border-t-transparent rounded-full animate-spin"
            />
        </div>
    )
}

export default Loading;