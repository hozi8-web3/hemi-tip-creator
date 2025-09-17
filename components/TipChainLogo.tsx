interface TipChainLogoProps {
  size?: number
  showText?: boolean
  showSubtext?: boolean
  className?: string
}

export function TipChainLogo({ 
  size = 40, 
  showText = false, 
  showSubtext = false,
  className = "" 
}: TipChainLogoProps) {
  const scale = size / 40 // Base size is 40px
  
  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 300 300" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF8C00"/>
          </linearGradient>
        </defs>
        {/* Icon: Interlocking T + C */}
        <g transform="translate(150, 130)">
          {/* The C */}
          <path 
            d="M -60,0 A60,60 0 0,1 60,0" 
            fill="none" 
            stroke="url(#orangeGrad)" 
            strokeWidth="20" 
            strokeLinecap="round"
          />
          {/* The T inside or overlapping */}
          <line 
            x1="0" 
            y1="-60" 
            x2="0" 
            y2="30" 
            stroke="url(#orangeGrad)" 
            strokeWidth="20" 
            strokeLinecap="round"
          />
          <line 
            x1="-35" 
            y1="-60" 
            x2="35" 
            y2="-60" 
            stroke="url(#orangeGrad)" 
            strokeWidth="20" 
            strokeLinecap="round"
          />
        </g>
        {showText && (
          <>
            {/* Text: TipChain */}
            <text 
              x="150" 
              y="230" 
              textAnchor="middle" 
              fontSize={32 * scale} 
              fontFamily="Montserrat, sans-serif" 
              fill="#FFA500"
            >
              TipChain
            </text>
            {showSubtext && (
              /* Subtext: on HEMI Network */
              <text 
                x="150" 
                y="255" 
                textAnchor="middle" 
                fontSize={16 * scale} 
                fontFamily="Montserrat, sans-serif" 
                fill="#666"
              >
                on HEMI Network
              </text>
            )}
          </>
        )}
      </svg>
      
      {showText && (
        <div className="ml-2 md:ml-3">
          <span className="text-lg md:text-xl font-bold gradient-text">TipChain</span>
          {showSubtext && (
            <div className="text-xs text-gray-400 hidden md:block">on HEMI Network</div>
          )}
        </div>
      )}
    </div>
  )
}

// Icon-only version for small spaces
export function TipChainIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 300 300" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`orangeGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA500"/>
          <stop offset="100%" stopColor="#FF8C00"/>
        </linearGradient>
      </defs>
      <g transform="translate(150, 150)">
        {/* The C */}
        <path 
          d="M -60,0 A60,60 0 0,1 60,0" 
          fill="none" 
          stroke={`url(#orangeGrad-${size})`}
          strokeWidth="20" 
          strokeLinecap="round"
        />
        {/* The T inside or overlapping */}
        <line 
          x1="0" 
          y1="-60" 
          x2="0" 
          y2="30" 
          stroke={`url(#orangeGrad-${size})`}
          strokeWidth="20" 
          strokeLinecap="round"
        />
        <line 
          x1="-35" 
          y1="-60" 
          x2="35" 
          y2="-60" 
          stroke={`url(#orangeGrad-${size})`}
          strokeWidth="20" 
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}