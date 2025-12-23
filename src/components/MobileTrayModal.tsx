import './MobileTrayModal.css'

interface MobileTrayModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTrayType: (type: 'regular' | 'large' | 'extraLarge') => void
}

const MobileTrayModal = ({ isOpen, onClose, onSelectTrayType }: MobileTrayModalProps) => {
  if (!isOpen) return null

  const trayTypes = [
    {
      type: 'regular' as const,
      label: 'Regular Tray',
      description: '1 position, 1 pasta',
      icon: '🍝',
      color: '#3b82f6'
    },
    {
      type: 'large' as const,
      label: 'Large Tray',
      description: '1 position, 2 pastas',
      icon: '🍜',
      color: '#8b5cf6'
    },
    {
      type: 'extraLarge' as const,
      label: 'Extra Large Tray',
      description: '4 positions, 6 pastas',
      icon: '🍲',
      color: '#ef4444'
    }
  ]

  const handleSelect = (type: 'regular' | 'large' | 'extraLarge') => {
    onSelectTrayType(type)
    onClose()
  }

  return (
    <>
      <div className="mobile-modal-overlay" onClick={onClose} />
      <div className="mobile-modal mobile-tray-modal">
        <div className="mobile-modal-header">
          <h3>Select Tray Type</h3>
          <button className="mobile-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="mobile-modal-content">
          {trayTypes.map((tray) => (
            <button
              key={tray.type}
              className="mobile-tray-option"
              onClick={() => handleSelect(tray.type)}
              style={{
                borderColor: tray.color,
                backgroundColor: `${tray.color}10`
              }}
            >
              <span className="mobile-tray-icon">{tray.icon}</span>
              <div className="mobile-tray-info">
                <div className="mobile-tray-label">{tray.label}</div>
                <div className="mobile-tray-description">{tray.description}</div>
              </div>
              <span className="mobile-tray-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default MobileTrayModal

