import { useState, useEffect } from 'react'
import { fetchRules, addRule, deleteRule } from '../services/api'
import './TradingRules.css'

function TradingRules() {
    const [rules, setRules] = useState([])
    const [loading, setLoading] = useState(true)
    const [newRule, setNewRule] = useState('')
    const [image, setImage] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadRules()
    }, [])

    const loadRules = async () => {
        try {
            const data = await fetchRules()
            setRules(data)
        } catch (error) {
            console.error('Failed to load rules:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newRule.trim()) return

        try {
            setSaving(true)
            await addRule({
                ruleText: newRule,
                image: image
            })
            setNewRule('')
            setImage(null)
            loadRules() // Reload list
        } catch (error) {
            console.error(error)
            alert(error.message || 'Failed to save rule')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this rule?')) {
            try {
                await deleteRule(id)
                loadRules()
            } catch (error) {
                console.error(error)
                alert(error.message || 'Failed to delete')
            }
        }
    }

    if (loading) return <div className="loading">Loading rules...</div>

    return (
        <div className="rules-page">
            <div className="rules-header">
                <h1>Trading Rules 📜</h1>
                <p className="text-muted">Discipline is the bridge between goals and accomplishment.</p>
            </div>

            <div className="rules-container">
                {/* Form Section */}
                <div className="rules-form-card">
                    <h2>Add New Rule</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Rule Description</label>
                            <textarea
                                value={newRule}
                                onChange={(e) => setNewRule(e.target.value)}
                                placeholder="e.g. Never trade against the trend..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Screenshot / Reference Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            {image && (
                                <div className="image-preview-area">
                                    <img src={image} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Add Rule'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="rules-list">
                    {rules.length === 0 ? (
                        <div className="empty-state">
                            <p>No rules added yet. Start by adding your first golden rule!</p>
                        </div>
                    ) : (
                        rules.map((rule, index) => (
                            <div key={rule.id} className="rule-card">
                                <div className="rule-header">
                                    <div className="rule-number">#{rules.length - index}</div>
                                    <button
                                        onClick={() => handleDelete(rule.id)}
                                        className="btn-delete-icon"
                                        title="Delete Rule"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="rule-content">
                                    <p className="rule-text">{rule.ruleText}</p>
                                    {rule.image && (
                                        <div className="rule-image">
                                            <img src={rule.image} alt="Rule Reference" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default TradingRules
