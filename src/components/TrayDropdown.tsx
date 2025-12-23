import { useState } from 'react'
import './TrayDropdown.css'

interface TrayDropdownProps {
  selectedType: 'regular' | 'large' | 'extraLarge'
  onSelectType: (type: 'regular' | 'large' | 'extraLarge') => void
}

const TrayDropdown = ({ selectedType, onSelectType }: TrayDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

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

  const selectedTray = trayTypes.find(t => t.type === selectedType) || trayTypes[0]

  const handleSelect = (type: 'regular' | 'large' | 'extraLarge') => {
    onSelectType(type)
    setIsOpen(false)
  }

  return (
    <div className="tray-dropdown-container">
      <button
        className="tray-dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderColor: selectedTray.color,
          backgroundColor: `${selectedTray.color}10`
        }}
      >
        <span className="tray-dropdown-icon">{selectedTray.icon}</span>
        <span className="tray-dropdown-label">{selectedTray.label}</span>
        <span className="tray-dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <>
          <div className="tray-dropdown-overlay" onClick={() => setIsOpen(false)} />
          <div className="tray-dropdown-menu">
            {trayTypes.map((tray) => (
              <button
                key={tray.type}
                className={`tray-dropdown-item ${selectedType === tray.type ? 'selected' : ''}`}
                onClick={() => handleSelect(tray.type)}
                style={{
                  borderColor: selectedType === tray.type ? tray.color : '#e5e7eb',
                  backgroundColor: selectedType === tray.type ? `${tray.color}15` : 'white'
                }}
              >
                <span className="tray-dropdown-item-icon">{tray.icon}</span>
                <div className="tray-dropdown-item-info">
                  <div className="tray-dropdown-item-label">{tray.label}</div>
                  <div className="tray-dropdown-item-description">{tray.description}</div>
                </div>
                {selectedType === tray.type && (
                  <span className="tray-dropdown-checkmark">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default TrayDropdown

