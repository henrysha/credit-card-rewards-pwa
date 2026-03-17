import { useParams, useNavigate } from 'react-router-dom';
import { CardHeader } from '../components/CardHeader';
import { SignupBonusSection } from '../components/SignupBonusSection';
import { EarningRatesSection } from '../components/EarningRatesSection';
import { PerksSection } from '../components/PerksSection';
import { addCard, getCardTemplate } from '../db/helpers';
import { useToast } from '../components/ToastContext';

export function CatalogDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  return (
    <div className="page animate-in">
      <button 
        className="btn btn-secondary mb-md"
        onClick={() => navigate('/catalog')}
      >
        ← Back to Catalog
      </button>

      <CardHeader template={template} />

      <div className="mt-lg">
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
  );
}
