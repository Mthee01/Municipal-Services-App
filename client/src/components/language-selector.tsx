import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languages = [
  { code: "en", name: "English" },
  { code: "af", name: "Afrikaans" },
  { code: "zu", name: "isiZulu" },
  { code: "xh", name: "isiXhosa" },
  { code: "st", name: "Sesotho" },
  { code: "ts", name: "Xitsonga" },
];

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function LanguageSelector({ value, onValueChange }: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
