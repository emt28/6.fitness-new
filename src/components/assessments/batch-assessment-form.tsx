import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, AlertCircle, Search, FileText, Check } from 'lucide-react';
import { useAthletes } from '@/hooks/use-athletes';
import { useProtocols } from '@/hooks/use-protocols';
import { useTemplates } from '@/hooks/use-templates';
import { useBatchAssessment } from '@/hooks/use-batch-assessment';
import { TestProtocol } from '@/types/protocol';
import { AssessmentTemplate } from '@/types/template';
import { cn } from '@/lib/utils';

const MAX_ATHLETES = 40;

const batchAssessmentSchema = z.object({
  templateId: z.string().optional(),
  protocolId: z.string().min(1, 'Protocol is required'),
  athleteIds: z.array(z.string()).min(1, 'At least one athlete must be selected')
    .max(MAX_ATHLETES, `Maximum ${MAX_ATHLETES} athletes can be selected`),
  values: z.array(z.object({
    athleteId: z.string(),
    value: z.number().min(0, 'Value must be positive'),
    notes: z.string().optional(),
  })),
});

type BatchAssessmentFormData = z.infer<typeof batchAssessmentSchema>;

export function BatchAssessmentForm() {
  const [selectedProtocol, setSelectedProtocol] = useState<TestProtocol | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  const [currentProtocolIndex, setCurrentProtocolIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const { data: athletes, isLoading: athletesLoading } = useAthletes();
  const { data: protocols, isLoading: protocolsLoading } = useProtocols();
  const { data: templates, isLoading: templatesLoading } = useTemplates();
  const batchAssessment = useBatchAssessment();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BatchAssessmentFormData>({
    resolver: zodResolver(batchAssessmentSchema),
    defaultValues: {
      athleteIds: [],
      values: [],
    },
  });

  const selectedAthleteIds = watch('athleteIds');
  const values = watch('values') || [];

  // Track completed tests
  useEffect(() => {
    const completed = new Set<string>();
    values.forEach((value, index) => {
      if (value.value > 0) {
        completed.add(selectedAthleteIds[index]);
      }
    });
    setCompletedTests(completed);
  }, [values, selectedAthleteIds]);

  const filteredAthletes = athletes?.filter(athlete => 
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const athleteOptions = filteredAthletes?.map(athlete => ({
    value: athlete.id,
    label: athlete.name,
  })) || [];

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template && template.protocols.length > 0) {
      setSelectedTemplate(template);
      setCurrentProtocolIndex(0);
      const firstProtocol = template.protocols[0];
      setSelectedProtocol(firstProtocol);
      setValue('templateId', template.id);
      setValue('protocolId', firstProtocol.id);
      setValue('values', selectedAthleteIds.map(athleteId => ({
        athleteId,
        value: 0,
        notes: '',
      })));
      setCompletedTests(new Set());
    }
  };

  const handleProtocolChange = (protocolId: string) => {
    const protocol = protocols?.find(p => p.id === protocolId);
    setSelectedProtocol(protocol || null);
    setSelectedTemplate(null);
    setValue('protocolId', protocolId);
    setValue('values', selectedAthleteIds.map(athleteId => ({
      athleteId,
      value: 0,
      notes: '',
    })));
    setCompletedTests(new Set());
  };

  const handleAthleteSelection = (athleteIds: string[]) => {
    if (athleteIds.length <= MAX_ATHLETES) {
      setValue('athleteIds', athleteIds);
      setValue('values', athleteIds.map(athleteId => ({
        athleteId,
        value: 0,
        notes: '',
      })));
      setCompletedTests(new Set());
    }
  };

  const onSubmit = async (data: BatchAssessmentFormData) => {
    try {
      await batchAssessment.mutateAsync(data);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);

      if (selectedTemplate) {
        if (currentProtocolIndex < selectedTemplate.protocols.length - 1) {
          const nextProtocol = selectedTemplate.protocols[currentProtocolIndex + 1];
          setCurrentProtocolIndex(prev => prev + 1);
          setSelectedProtocol(nextProtocol);
          setValue('protocolId', nextProtocol.id);
          setValue('values', selectedAthleteIds.map(athleteId => ({
            athleteId,
            value: 0,
            notes: '',
          })));
          setCompletedTests(new Set());
        } else {
          reset();
          setSelectedProtocol(null);
          setSelectedTemplate(null);
          setCurrentProtocolIndex(0);
          setCompletedTests(new Set());
        }
      } else {
        reset();
        setSelectedProtocol(null);
        setCompletedTests(new Set());
      }
    } catch (error) {
      console.error('Failed to save batch assessments:', error);
    }
  };

  if (athletesLoading || protocolsLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const remainingTests = selectedTemplate ? 
    selectedTemplate.protocols.length - currentProtocolIndex : 
    1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Search Athletes
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Athletes (up to {MAX_ATHLETES})
            </label>
            <div className="relative">
              <Select
                options={athleteOptions}
                value={selectedAthleteIds}
                onChange={handleAthleteSelection}
                isMulti
                maxItems={MAX_ATHLETES}
                placeholder="Select athletes..."
              />
              <div className="mt-1 text-sm">
                <span className={selectedAthleteIds.length === MAX_ATHLETES ? 'text-red-600' : 'text-gray-500'}>
                  {selectedAthleteIds.length}/{MAX_ATHLETES} athletes selected
                </span>
              </div>
            </div>
            {errors.athleteIds && (
              <p className="mt-1 text-sm text-red-600">{errors.athleteIds.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Assessment Template (Optional)
            </label>
            <Select
              options={templates?.map(t => ({ value: t.id, label: t.name })) || []}
              value={selectedTemplate?.id || ''}
              onChange={handleTemplateSelect}
              placeholder="Choose a template..."
            />
          </div>

          {selectedTemplate ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Using template: {selectedTemplate.name}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Test {currentProtocolIndex + 1} of {selectedTemplate.protocols.length}:
                    <span className="font-medium"> {selectedProtocol?.name}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Test Protocol
              </label>
              <Select
                options={protocols?.map(p => ({ value: p.id, label: p.name })) || []}
                value={selectedProtocol?.id || ''}
                onChange={handleProtocolChange}
                placeholder="Choose a protocol..."
              />
              {errors.protocolId && (
                <p className="mt-1 text-sm text-red-600">{errors.protocolId.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedProtocol && selectedAthleteIds.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Batch Assessment Values</h3>
              <div className="text-sm text-gray-500">
                {completedTests.size} of {selectedAthleteIds.length} tests completed
              </div>
            </div>

            <div className="space-y-2">
              {selectedAthleteIds.map((athleteId, index) => {
                const athlete = athletes?.find(a => a.id === athleteId);
                const isCompleted = completedTests.has(athleteId);
                
                return (
                  <div 
                    key={athleteId} 
                    className={cn(
                      "flex items-center space-x-4 p-3 rounded-md transition-colors",
                      isCompleted ? "bg-green-50" : "bg-gray-50"
                    )}
                  >
                    <div className="w-8 text-sm font-medium text-gray-500">
                      {index + 1}.
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{athlete?.name}</span>
                        {isCompleted && <Check className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="text-sm text-gray-500">
                        {remainingTests} test{remainingTests !== 1 ? 's' : ''} remaining
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`values.${index}.value` as const, { valueAsNumber: true })}
                        placeholder={`Value (${selectedProtocol.unit})`}
                        className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm"
                      />
                      <input
                        type="text"
                        {...register(`values.${index}.notes` as const)}
                        placeholder="Notes"
                        className="w-48 rounded-md border border-gray-300 px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {showSaveSuccess && (
            <span className="text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Tests saved successfully
            </span>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : selectedTemplate ? (
            `Save & Continue (Test ${currentProtocolIndex + 1}/${selectedTemplate.protocols.length})`
          ) : (
            'Save Assessments'
          )}
        </Button>
      </div>
    </form>
  );
}