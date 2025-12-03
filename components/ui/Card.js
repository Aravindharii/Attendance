'use client'

export default function Card({
    children,
    title,
    subtitle,
    icon,
    action,
    className = '',
    hover = false,
    glass = false,
    ...props
}) {
    return (
        <div
            className={`
        rounded-xl p-6 
        ${glass ? 'glass' : 'bg-white shadow-card'}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
            {...props}
        >
            {(title || icon || action) && (
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                                {icon}
                            </div>
                        )}
                        <div>
                            {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
                            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}

            <div>{children}</div>
        </div>
    )
}
