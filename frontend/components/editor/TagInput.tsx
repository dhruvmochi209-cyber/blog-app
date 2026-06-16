import { Input } from '@/components/ui/input';

interface TagInputProps {
  keywords: string;
  setKeywords: (val: string) => void;
  error?: string;
  clearError?: () => void;
}

export function TagInput({ keywords, setKeywords, error, clearError }: TagInputProps) {
  const keywordChips = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

  return (
    <div className="space-y-2">
      <Input
        id="input-keywords"
        value={keywords}
        onChange={(e) => {
          setKeywords(e.target.value);
          if (error && clearError) clearError();
        }}
        placeholder="Enter comma-separated SEO keyword tags (e.g. react, design-systems, nextjs)..."
        className="bg-surface-container-lowest border-outline-variant/40 font-body-md h-11 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
      />
      {error && <p className="text-error text-xs font-medium">{error}</p>}

      {keywordChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {keywordChips.map((chip, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 bg-primary/5 text-primary text-xs rounded-full font-label-caps border border-primary/10 flex items-center gap-0.5 font-bold uppercase tracking-wider select-none"
            >
              <span className="text-sm text-primary/70 mr-0.5">#</span>
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
