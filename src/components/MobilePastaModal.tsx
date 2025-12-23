import { pastaPresets, RAVIOLI_MAX_TIME, getPastaPreset } from '../data/pastaPresets'
import './MobilePastaModal.css'

interface MobilePastaModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPasta: (name: string, cookingTime: number) => void
  trayType?: 'regular' | 'large' | 'extraLarge'
}

const MobilePastaModal = ({ isOpen, onClose, onSelectPasta }: MobilePastaModalProps) => {
  if (!isOpen) return null

  const handleSelectPasta = (presetName: string) => {
    const preset = getPastaPreset(presetName)
    if (preset) {
      onSelectPasta(preset.name, preset.cookingTime)
      onClose()
    }
  }

  const regularPastas = pastaPresets.filter(p => !p.category)
  const ravioliPastas = pastaPresets.filter(p => p.category === 'ravioli')

  return (
    <>
      <div className="mobile-modal-overlay" onClick={onClose} />
      <div className="mobile-modal mobile-pasta-modal">
        <div className="mobile-modal-header">
          <h3>Select Pasta Type</h3>
          <button className="mobile-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="mobile-modal-content">
          <div className="mobile-pasta-section">
            <div className="mobile-pasta-section-label">Regular Pasta</div>
            <div className="mobile-pasta-grid">
              {regularPastas.map((preset) => (
                <button
                  key={preset.name}
                  className="mobile-pasta-card"
                  onClick={() => handleSelectPasta(preset.name)}
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
                  onClick={() => handleSelectPasta(preset.name)}
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
        </div>
      </div>
    </>
  )
}

export default MobilePastaModal

