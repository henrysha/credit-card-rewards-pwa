import { useRef, useState } from 'react';
import {
  createBackup,
  downloadBackup,
  parseBackup,
  restoreBackup,
  type DataBackup,
} from '../db/data-transfer';
import { useToast } from './ToastContext';

export function DataTransferModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [backup, setBackup] = useState<DataBackup | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    const currentBackup = await createBackup();
    downloadBackup(currentBackup, format);
    showToast(`${format.toUpperCase()} backup exported!`);
  };

  const handleFile = async (file?: File) => {
    setBackup(null);
    setError('');
    setFileName(file?.name ?? '');
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('The selected backup is larger than 10 MB.');
      return;
    }
    try {
      setBackup(parseBackup(await file.text(), file.name));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The backup could not be read.');
    }
  };

  const handleImport = async () => {
    if (!backup) return;
    setIsImporting(true);
    setError('');
    try {
      await restoreBackup(backup);
      showToast('Backup imported successfully!');
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The backup could not be imported.');
      setIsImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content data-transfer-modal" role="dialog" aria-modal="true" aria-labelledby="data-transfer-title" onClick={event => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="flex justify-between items-center mb-md">
          <h2 id="data-transfer-title">Export or import data</h2>
          <button className="btn btn-icon" aria-label="Close data transfer" onClick={onClose}>×</button>
        </div>

        <section className="data-transfer-section">
          <h3>Export a backup</h3>
          <p className="text-sm text-muted">JSON is recommended for moving all cards, bonuses, and perk activity to another device. CSV contains the same data in a portable table.</p>
          <div className="data-transfer-actions mt-md">
            <button className="btn btn-primary" onClick={() => handleExport('json')}>Export JSON</button>
            <button className="btn" onClick={() => handleExport('csv')}>Export CSV</button>
          </div>
        </section>

        <section className="data-transfer-section">
          <h3>Import a backup</h3>
          <p className="text-sm text-muted">Choose a JSON or CSV backup created by this app. You can review its record counts before replacing this device’s data.</p>
          <input
            ref={inputRef}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            className="data-transfer-file-input"
            aria-label="Choose backup file"
            onChange={event => handleFile(event.target.files?.[0])}
          />
          <button className="btn mt-md" onClick={() => inputRef.current?.click()}>Choose backup file</button>
          {fileName && <div className="text-sm text-muted mt-sm">{fileName}</div>}
          {error && <div className="data-transfer-error mt-sm" role="alert">{error}</div>}
          {backup && (
            <div className="data-transfer-preview mt-md">
              <div className="font-bold">Ready to import</div>
              <div className="text-sm text-muted">
                {backup.data.cards.length} cards · {backup.data.signupBonuses.length} bonuses · {backup.data.perks.length} perks
              </div>
              <p className="text-sm text-red mt-sm">This will replace all data currently stored on this device.</p>
              <button className="btn btn-danger mt-sm" disabled={isImporting} onClick={handleImport}>
                {isImporting ? 'Importing…' : 'Replace data and import'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
