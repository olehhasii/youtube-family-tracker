const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

export const IconBack = () => (<svg {...svg} width={16} height={16}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>)
export const IconDots = () => (<svg {...svg}><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></svg>)
export const IconInfo = () => (<svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>)
export const IconCode = () => (<svg {...svg}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></svg>)
export const IconKey = () => (<svg {...svg}><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14 9l2 2" /></svg>)
export const IconCross = () => (<svg {...svg} strokeWidth={3}><path d="M18 6 6 18M6 6l12 12" /></svg>)
export const IconCheck = () => (<svg {...svg} strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>)
export const IconPlus = () => (<svg {...svg} width={16} height={16} strokeWidth={2.25}><path d="M12 5v14M5 12h14" /></svg>)
