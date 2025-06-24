
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  type?: string;
  helpText?: string;
}

export function FormField({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  type = "text",
  helpText
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm sm:text-base font-medium",
          required && "after:content-['*'] after:ml-1 after:text-red-500"
        )}
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "text-base h-12 sm:h-11 px-4 transition-all duration-200",
          "focus:ring-2 focus:ring-tennis-green-dark focus:border-tennis-green-dark",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500"
        )}
      />
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-xs sm:text-sm text-gray-600">{helpText}</p>
      )}
    </div>
  );
}
