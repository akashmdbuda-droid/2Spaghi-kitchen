import { useState } from 'react'
import { Tray } from '../App'
import './PastaForm.css'

interface PastaFormProps {
  trays: Tray[]
  onAddPasta: (trayId: string, pasta: { name: string; cookingTime: number; trayType: 'regular' | 'large' | 'extraLarge' }) => void
}

const PastaForm = ({ trays, onAddPasta }: PastaFormProps) => {
  const [selectedTrayId, setSelectedTrayId] = useState<string>('')
  const [pastaName, setPastaName] = useState('')
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState(8)
  const [cookingTimeSeconds, setCookingTimeSeconds] = useState(0)

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

    const selectedTray = trays.find(t => t.id === selectedTrayId)
    if (!selectedTray) return

    onAddPasta(selectedTrayId, {
      name: pastaName.trim(),
      cookingTime: totalSeconds,
      trayType: selectedTray.type
    })

    // Reset form
    setPastaName('')
    setCookingTimeMinutes(8)
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
            <label htmlFor="pasta-name">Pasta Name</label>
            <input
              id="pasta-name"
              type="text"
              value={pastaName}
              onChange={(e) => setPastaName(e.target.value)}
              placeholder="e.g., Spaghetti, Penne, Fettuccine"
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
                  max="59"
                  value={cookingTimeMinutes}
                  onChange={(e) => setCookingTimeMinutes(parseInt(e.target.value) || 0)}
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
                />
                <span className="time-label">sec</span>
              </div>
            </div>
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

