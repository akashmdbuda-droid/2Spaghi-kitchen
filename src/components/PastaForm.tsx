import { useState, useEffect } from 'react'
import { Tray } from '../App'
import { pastaPresets, RAVIOLI_MIN_TIME, RAVIOLI_MAX_TIME, getPastaPreset } from '../data/pastaPresets'
import './PastaForm.css'

interface PastaFormProps {
  trays: Tray[]
  onAddPasta: (trayId: string, pasta: { name: string; cookingTime: number; trayType: 'regular' | 'large' | 'extraLarge' }) => void
  autoSelectTrayId?: string // Auto-select this tray when provided
}

const PastaForm = ({ trays, onAddPasta, autoSelectTrayId }: PastaFormProps) => {
  const [selectedTrayId, setSelectedTrayId] = useState<string>('')
  const [pastaName, setPastaName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState(4)
  const [cookingTimeSeconds, setCookingTimeSeconds] = useState(0)

  // Auto-select tray when a new one is added
  useEffect(() => {
    if (autoSelectTrayId && trays.some(t => t.id === autoSelectTrayId)) {
      const tray = trays.find(t => t.id === autoSelectTrayId)
      if (tray) {
        const maxPastaCount = tray.type === 'large' ? 2 : tray.type === 'extraLarge' ? 6 : 1
        if (tray.pastas.length < maxPastaCount) {
          setSelectedTrayId(autoSelectTrayId)
        }
      }
    }
  }, [autoSelectTrayId, trays])

  // Update time when preset is selected
  useEffect(() => {
    if (selectedPreset) {
      const preset = getPastaPreset(selectedPreset)
      if (preset) {
        setPastaName(preset.name)
        const minutes = Math.floor(preset.cookingTime / 60)
        const seconds = preset.cookingTime % 60
        setCookingTimeMinutes(minutes)
        setCookingTimeSeconds(seconds)
      }
    }
  }, [selectedPreset])

  const availableTrays = trays.filter(tray => {
    const maxPastaCount = tray.type === 'large' ? 2 : tray.type === 'extraLarge' ? 6 : 1
    return tray.pastas.length < maxPastaCount
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTrayId || !pastaName.trim()) {
      return
    }

    const totalSeconds = cookingTimeMinutes * 60 + cookingTimeSeconds
    if (totalSeconds <= 0) {
      return
    }

    // Validate ravioli cooking time range
    const isRavioli = pastaName.toLowerCase().includes('ravioli')
    if (isRavioli) {
      if (totalSeconds < RAVIOLI_MIN_TIME) {
        alert(`Ravioli minimum cooking time is ${RAVIOLI_MIN_TIME / 60} minutes. Please adjust.`)
        return
      }
      if (totalSeconds > RAVIOLI_MAX_TIME) {
        alert(`Ravioli maximum cooking time is ${RAVIOLI_MAX_TIME / 60} minutes. Please adjust.`)
        return
      }
    }

    const selectedTray = trays.find(t => t.id === selectedTrayId)
    if (!selectedTray) return

    onAddPasta(selectedTrayId, {
      name: pastaName.trim(),
      cookingTime: totalSeconds,
      trayType: selectedTray.type
    })

    // Reset form but keep tray selected if it still has capacity
    const tray = trays.find(t => t.id === selectedTrayId)
    if (tray) {
      const maxPastaCount = tray.type === 'large' ? 2 : tray.type === 'extraLarge' ? 6 : 1
      if (tray.pastas.length + 1 >= maxPastaCount) {
        // Tray is full, reset selection
        setSelectedTrayId('')
      }
    }
    
    setPastaName('')
    setSelectedPreset('')
    setCookingTimeMinutes(4)
    setCookingTimeSeconds(0)
  }

  const getTrayLabel = (tray: Tray): string => {
    const typeLabels = {
      regular: 'Regular',
      large: 'Large (2x)',
      extraLarge: 'Extra Large (6x)'
    }
    const positions = tray.positions.map(p => p + 1).join(', ')
    return `${typeLabels[tray.type]} - Positions ${positions}`
  }

  return (
    <div className="pasta-form">
      <h3>Add Pasta to Tray</h3>
      
      {availableTrays.length === 0 ? (
        <div className="no-trays-message">
          <p>No available trays. Place a tray in the sink first!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="tray-select">Select Tray</label>
            <select
              id="tray-select"
              value={selectedTrayId}
              onChange={(e) => setSelectedTrayId(e.target.value)}
              required
              className="form-input"
            >
              <option value="">Choose a tray...</option>
              {availableTrays.map(tray => {
                const maxPastaCount = tray.type === 'large' ? 2 : tray.type === 'extraLarge' ? 6 : 1
                return (
                  <option key={tray.id} value={tray.id}>
                    {getTrayLabel(tray)} ({tray.pastas.length}/{maxPastaCount} pastas)
                  </option>
                )
              })}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pasta-preset">Pasta Type (Preset)</label>
            <div className="pasta-preset-selector">
              <div className="pasta-preset-grid">
                {pastaPresets.filter(p => !p.category).map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    className={`pasta-preset-card ${selectedPreset === preset.name ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPreset(preset.name)
                      setPastaName(preset.name)
                      const minutes = Math.floor(preset.cookingTime / 60)
                      const seconds = preset.cookingTime % 60
                      setCookingTimeMinutes(minutes)
                      setCookingTimeSeconds(seconds)
                    }}
                  >
                    <div className="pasta-preset-image">
                      {preset.imageUrl ? (
                        <img 
                          src={preset.imageUrl} 
                          alt={preset.name}
                          onError={(e) => {
                            // Fallback to emoji if image fails
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const emoji = document.createElement('span')
                            emoji.textContent = preset.emoji || '🍝'
                            emoji.className = 'pasta-preset-emoji'
                            target.parentElement?.appendChild(emoji)
                          }}
                        />
                      ) : (
                        <span className="pasta-preset-emoji">{preset.emoji || '🍝'}</span>
                      )}
                    </div>
                    <div className="pasta-preset-info">
                      <div className="pasta-preset-name">
                        {preset.name.charAt(0).toUpperCase() + preset.name.slice(1)}
                      </div>
                      <div className="pasta-preset-time">
                        {Math.floor(preset.cookingTime / 60)}:{(preset.cookingTime % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="pasta-preset-group">
                <div className="pasta-preset-group-label">Ravioli</div>
                <div className="pasta-preset-grid ravioli-grid">
                  {pastaPresets.filter(p => p.category === 'ravioli').map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      className={`pasta-preset-card ravioli-card ${selectedPreset === preset.name ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedPreset(preset.name)
                        setPastaName(preset.name)
                        const minutes = Math.floor(preset.cookingTime / 60)
                        const seconds = preset.cookingTime % 60
                        setCookingTimeMinutes(minutes)
                        setCookingTimeSeconds(seconds)
                      }}
                    >
                      <div className="pasta-preset-image">
                        {preset.imageUrl ? (
                          <img 
                            src={preset.imageUrl} 
                            alt={preset.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const emoji = document.createElement('span')
                              emoji.textContent = preset.emoji || '🥟'
                              emoji.className = 'pasta-preset-emoji'
                              target.parentElement?.appendChild(emoji)
                            }}
                          />
                        ) : (
                          <span className="pasta-preset-emoji">{preset.emoji || '🥟'}</span>
                        )}
                      </div>
                      <div className="pasta-preset-info">
                        <div className="pasta-preset-name">
                          {preset.name.split(' - ')[1]?.charAt(0).toUpperCase() + preset.name.split(' - ')[1]?.slice(1) || preset.name}
                        </div>
                        <div className="pasta-preset-time-range">
                          {Math.floor(preset.cookingTime / 60)}:{(preset.cookingTime % 60).toString().padStart(2, '0')} - {Math.floor(RAVIOLI_MAX_TIME / 60)}:00
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pasta-name">Pasta Name (or Custom)</label>
            <input
              id="pasta-name"
              type="text"
              value={pastaName}
              onChange={(e) => {
                setPastaName(e.target.value)
                // Clear preset if user types custom name
                if (selectedPreset && e.target.value !== getPastaPreset(selectedPreset)?.name) {
                  setSelectedPreset('')
                }
              }}
              placeholder="e.g., Spaghetti, Penne, or select from presets above"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Cooking Time</label>
            <div className="time-inputs">
              <div className="time-input-group">
                <input
                  type="number"
                  min="0"
                  max={pastaName.toLowerCase().includes('ravioli') ? 10 : 59}
                  value={cookingTimeMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    if (pastaName.toLowerCase().includes('ravioli')) {
                      // Ravioli: 4-10 minutes
                      const clamped = Math.max(RAVIOLI_MIN_TIME / 60, Math.min(RAVIOLI_MAX_TIME / 60, val))
                      setCookingTimeMinutes(clamped)
                    } else {
                      setCookingTimeMinutes(val)
                    }
                  }}
                  className="form-input time-input"
                />
                <span className="time-label">min</span>
              </div>
              <div className="time-input-group">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={cookingTimeSeconds}
                  onChange={(e) => setCookingTimeSeconds(parseInt(e.target.value) || 0)}
                  className="form-input time-input"
                  disabled={pastaName.toLowerCase().includes('ravioli') && cookingTimeMinutes >= RAVIOLI_MAX_TIME / 60}
                />
                <span className="time-label">sec</span>
              </div>
            </div>
            {pastaName.toLowerCase().includes('ravioli') && (
              <div className="ravioli-note">
                <small>Ravioli cooking time: {RAVIOLI_MIN_TIME / 60} - {RAVIOLI_MAX_TIME / 60} minutes</small>
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn">
            Start Cooking 🍝
          </button>
        </form>
      )}
    </div>
  )
}

export default PastaForm

