import React from 'react'

interface SpinnerProps {
  size?: number
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`border-2 border-primary border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}