import { useState, useEffect } from 'react'
import { pastaPresets, RAVIOLI_MAX_TIME, getPastaPreset, PastaPreset } from '../data/pastaPresets'
import './MobilePastaModal.css'

interface MobilePastaModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPasta: (name: string, cookingTime: number) => void
  trayType?: 'regular' | 'large' | 'extraLarge'
}

const MobilePastaModal = ({ isOpen, onClose, onSelectPasta }: MobilePastaModalProps) => {
  if (!isOpen) return null

  const [selectedPreset, setSelectedPreset] = useState<PastaPreset | null>(null)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedPreset(null)
    }
  }, [isOpen])

  const handleSelectPreset = (presetName: string) => {
    const preset = getPastaPreset(presetName)
    if (preset) {
      setSelectedPreset(preset)
      setMinutes(Math.floor(preset.cookingTime / 60))
      setSeconds(preset.cookingTime % 60)
    }
  }

  const handleConfirm = () => {
    if (selectedPreset) {
      const totalSeconds = (minutes * 60) + seconds
      onSelectPasta(selectedPreset.name, totalSeconds)
      onClose()
      setSelectedPreset(null)
    }
  }

  const handleBack = () => {
    setSelectedPreset(null)
  }

  const regularPastas = pastaPresets.filter(p => !p.category)
  const ravioliPastas = pastaPresets.filter(p => p.category === 'ravioli')

  return (
    <>
      <div className="mobile-modal-overlay" onClick={onClose} />
      <div className="mobile-modal mobile-pasta-modal">
        <div className="mobile-modal-header">
          {selectedPreset && (
            <button className="mobile-modal-back" onClick={handleBack}>←</button>
          )}
          <h3>{selectedPreset ? 'Confirm Time' : 'Select Pasta Type'}</h3>
          <button className="mobile-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="mobile-modal-content">
          {selectedPreset ? (
            <div className="time-confirm-view">
              <div className="confirm-pasta-info">
                <div className="confirm-image">
                  {selectedPreset.imageUrl ? (
                    <img
                      src={selectedPreset.imageUrl}
                      alt={selectedPreset.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const emoji = document.createElement('span')
                        emoji.textContent = selectedPreset.emoji || '🍝'
                        emoji.className = 'mobile-pasta-emoji'
                        target.parentElement?.appendChild(emoji)
                      }}
                    />
                  ) : (
                    <span className="mobile-pasta-emoji">{selectedPreset.emoji || '🍝'}</span>
                  )}
                </div>
                <h4>{selectedPreset.name}</h4>
              </div>

              <div className="time-editor">
                <div className="time-input-group">
                  <label>Minutes</label>
                  <div className="number-control">
                    <button onClick={() => setMinutes(m => Math.max(0, m - 1))}>-</button>
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                    <button onClick={() => setMinutes(m => m + 1)}>+</button>
                  </div>
                </div>
                <div className="time-separator">:</div>
                <div className="time-input-group">
                  <label>Seconds</label>
                  <div className="number-control">
                    <button onClick={() => setSeconds(s => Math.max(0, s - 10))}>-</button>
                    <input
                      type="number"
                      value={seconds}
                      onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    />
                    <button onClick={() => setSeconds(s => Math.min(59, s + 10))}>+</button>
                  </div>
                </div>
              </div>

              <button className="confirm-start-btn" onClick={handleConfirm}>
                Start Cooking
              </button>
            </div>
          ) : (
            <>
              <div className="mobile-pasta-section">
                <div className="mobile-pasta-section-label">Regular Pasta</div>
                <div className="mobile-pasta-grid">
                  {regularPastas.map((preset) => (
                    <button
                      key={preset.name}
                      className="mobile-pasta-card"
                      onClick={() => handleSelectPreset(preset.name)}
                    >
                      <div className="mobile-pasta-image">
                        {preset.imageUrl ? (
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const emoji = document.createElement('span')
                              emoji.textContent = preset.emoji || '🍝'
                              emoji.className = 'mobile-pasta-emoji'
                              target.parentElement?.appendChild(emoji)
                            }}
                          />
                        ) : (
                          <span className="mobile-pasta-emoji">{preset.emoji || '🍝'}</span>
                        )}
                      </div>
                      <div className="mobile-pasta-name">
                        {preset.name.charAt(0).toUpperCase() + preset.name.slice(1)}
                      </div>
                      <div className="mobile-pasta-time">
                        {Math.floor(preset.cookingTime / 60)}:{(preset.cookingTime % 60).toString().padStart(2, '0')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mobile-pasta-section">
                <div className="mobile-pasta-section-label">Ravioli</div>
                <div className="mobile-pasta-grid">
                  {ravioliPastas.map((preset) => (
                    <button
                      key={preset.name}
                      className="mobile-pasta-card ravioli-card"
                      onClick={() => handleSelectPreset(preset.name)}
                    >
                      <div className="mobile-pasta-image">
                        {preset.imageUrl ? (
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const emoji = document.createElement('span')
                              emoji.textContent = preset.emoji || '🥟'
                              emoji.className = 'mobile-pasta-emoji'
                              target.parentElement?.appendChild(emoji)
                            }}
                          />
                        ) : (
                          <span className="mobile-pasta-emoji">{preset.emoji || '🥟'}</span>
                        )}
                      </div>
                      <div className="mobile-pasta-name">
                        {preset.name.split(' - ')[1]?.charAt(0).toUpperCase() + preset.name.split(' - ')[1]?.slice(1) || preset.name}
                      </div>
                      <div className="mobile-pasta-time-range">
                        {Math.floor(preset.cookingTime / 60)}:{(preset.cookingTime % 60).toString().padStart(2, '0')} - {Math.floor(RAVIOLI_MAX_TIME / 60)}:00
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default MobilePastaModal

