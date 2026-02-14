'use client'

import { Settings } from '@/types/database'
import { useRouter } from 'next/navigation'

interface SettingsManagerProps {
  settings: Settings[]
}

export default function SettingsManager({ settings: initialSettings }: SettingsManagerProps) {
  const router = useRouter()

  const getSetting = (key: string) => {
    const setting = initialSettings.find(s => s.key === key)
    return setting?.value || false
  }

  const updateSetting = async (key: string, value: boolean) => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    })
    router.refresh()
  }

  return (
    <div>
      <h2 className="text-2xl font-heading mb-6">Settings Manager</h2>

      <div className="space-y-4">
        <div className="glass rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-heading mb-1">Proposal Section</h3>
              <p className="text-sm text-gray-400">
                Enable or disable the proposal section on the main site
              </p>
            </div>
            <button
              onClick={() => updateSetting('proposal_unlocked', !getSetting('proposal_unlocked'))}
              className={`px-6 py-2 rounded-lg transition ${
                getSetting('proposal_unlocked')
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {getSetting('proposal_unlocked') ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-heading mb-1">Background Music</h3>
              <p className="text-sm text-gray-400">
                Enable background music on the site (future feature)
              </p>
            </div>
            <button
              onClick={() => updateSetting('background_music_enabled', !getSetting('background_music_enabled'))}
              className={`px-6 py-2 rounded-lg transition ${
                getSetting('background_music_enabled')
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {getSetting('background_music_enabled') ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
