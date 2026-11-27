import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { CardHeader } from '../components/CardHeader';
import { SignupBonusSection } from '../components/SignupBonusSection';
import { EarningRatesSection } from '../components/EarningRatesSection';
import { PerksSection } from '../components/PerksSection';
import { addCard, getCardTemplate } from '../db/helpers';
import { useToast } from '../components/ToastContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { CatalogMasterSidebar } from '../components/CatalogMasterPane';

export function CatalogDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isLandscapeDuo = useMediaQuery('(min-width: 780px)');
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const template = templateId ? getCardTemplate(templateId) : undefined;

  if (!template) {
    return (
      <div className="p-md text-center">
        <p>Loading card details...</p>
      </div>
    );
  }

  const handleAddCard = async (customDate?: string | null) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const annualFeeDate = customDate || undefined;
      const cardId = await addCard(template.id, today, undefined, undefined, annualFeeDate);
      showToast(`${template.name} added to your cards!`);
      navigate(`/card/${cardId}`);
    } catch (error) {
      console.error('Error adding card:', error);
      showToast('Failed to add card');
    }
  };

  const handleSelectFromMaster = (cardName: string) => {
    setLiveAnnouncement(`Previewing ${cardName}`);
    requestAnimationFrame(() => {
      detailHeadingRef.current?.focus();
    });
  };

  return (
    <div className="duo-master-detail-shell">
      {isLandscapeDuo && (
        <CatalogMasterSidebar selectedTemplateId={template.id} onSelectTemplate={handleSelectFromMaster} />
      )}
      <div key={`catalog-detail-${template.id}`} className="page animate-in" data-testid="catalog-detail-pane">
        <div className="sr-only" aria-live="polite">{liveAnnouncement}</div>
        <h2 ref={detailHeadingRef} tabIndex={-1} className="sr-only duo-detail-heading">
          {template.name}
        </h2>
        <button
          className="btn btn-secondary mb-md"
          onClick={() => navigate('/catalog')}
        >
          ← Back to Catalog
        </button>

        <CardHeader template={template} />

        <div className="catalog-detail-sticky-cta">
          <button
            className="btn btn-primary btn-block py-lg text-lg"
            data-test-date=""
            onClick={(e) => {
              const date = (e.currentTarget as HTMLButtonElement).getAttribute('data-test-date');
              handleAddCard(date || undefined);
            }}
          >
            Add This Card
          </button>
        </div>

        <SignupBonusSection template={template} />

        <EarningRatesSection earningRates={template.earningRates} />

        <PerksSection template={template} readOnly={true} />

        <div className="mt-xl mb-xl">
          <button
            className="btn btn-primary btn-block py-lg text-lg"
            data-test-date=""
            onClick={(e) => {
              const date = (e.currentTarget as HTMLButtonElement).getAttribute('data-test-date');
              handleAddCard(date || undefined);
            }}
          >
            Add This Card
          </button>
        </div>
      </div>
    </div>
  );
}
