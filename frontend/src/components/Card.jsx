import clsx from 'clsx'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-white overflow-hidden shadow rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={clsx('px-4 py-5 sm:px-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Body = function CardBody({ children, className = '', ...props }) {
  return (
    <div
      className={clsx('px-4 py-5 sm:p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Footer = function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={clsx('px-4 py-4 sm:px-6 bg-gray-50', className)}
      {...props}
    >
      {children}
    </div>
  )
}
