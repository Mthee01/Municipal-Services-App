import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSelector() {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span className="w-6 text-center">
                {lang.code === 'en' && '🇬🇧'}
                {lang.code === 'af' && '🇿🇦'}
                {lang.code === 'zu' && '🇿🇦'}
                {lang.code === 'xh' && '🇿🇦'}
              </span>
              <span className="text-sm font-medium">{lang.nativeName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
