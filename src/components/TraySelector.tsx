import './TraySelector.css'

interface TraySelectorProps {
  selectedType: 'regular' | 'large' | 'extraLarge'
  onSelectType: (type: 'regular' | 'large' | 'extraLarge') => void
}

const TraySelector = ({ selectedType, onSelectType }: TraySelectorProps) => {
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

  return (
    <div className="tray-selector">
      <h3>Select Tray Type</h3>
      <div className="tray-options">
        {trayTypes.map((tray) => (
          <button
            key={tray.type}
            className={`tray-option ${selectedType === tray.type ? 'selected' : ''}`}
            onClick={() => onSelectType(tray.type)}
            style={{
              borderColor: selectedType === tray.type ? tray.color : '#e5e7eb',
              backgroundColor: selectedType === tray.type ? `${tray.color}10` : 'white'
            }}
          >
            <span className="tray-icon">{tray.icon}</span>
            <div className="tray-info">
              <div className="tray-label">{tray.label}</div>
              <div className="tray-description">{tray.description}</div>
            </div>
            {selectedType === tray.type && (
              <span className="checkmark">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TraySelector

