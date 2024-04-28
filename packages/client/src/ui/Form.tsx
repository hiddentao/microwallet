import { FieldApi } from '../hooks/forms';
import { PropsWithClassName, cn } from '../utils';
import { FC, PropsWithChildren, ReactNode, useCallback, useMemo } from 'react'
import { Loading } from './Loading'

export const FieldError: FC<PropsWithClassName<{ error?: string }>> = ({
  error,
  className,
}) => {
  return error ? (
    <em
      className={cn(
        'block px-1 bg-red-500 text-white font-bold mt-2 rounded-md break-all',
        className,
      )}
    >
      {error}
    </em>
  ) : null;
};

export const FieldSuffix = ({
  field,
  hideValidationIndicator,
}: {
  field: FieldApi;
  hideValidationIndicator?: boolean;
}) => {
  return (
    <>
      {field.isValidating && !hideValidationIndicator ? (
        <Loading className="inline-block ml-2" />
      ) : null}
    </>
  );
};

export interface FieldLabelProps {
  help?: string;
  label?: string;
  required?: boolean;
  hideTooltip?: boolean;
}

export const FieldLabel: FC<PropsWithChildren<FieldLabelProps>> = ({
  children,
  label,
  required,
  help,
  hideTooltip,
}) => {
  const helpStr = useMemo(() => {
    return `${required ? 'REQUIRED' : 'OPTIONAL'}.${help ? ` ${help}` : ''}`;
  }, [help, required]);

  const dummyOnClick = useCallback((e: any) => {
    e.preventDefault();
  }, []);

  return label ? (
    <label
      className={cn(
        'flex flex-row justify-between items-end mb-1 text-slate-300',
      )}
      onClick={dummyOnClick}
    >
      <span className="flex flex-row italic">
        {label}
        {hideTooltip ? null : (
          <>
            {required ? (
              <span className="text-red-500 font-bold ml-1">*</span>
            ) : null}
          </>
        )}
      </span>
      {children}
    </label>
  ) : null;
};

export const FieldCharLimitIndicator = ({
  field,
  charLimit,
}: {
  field: FieldApi;
  charLimit?: number;
}) => {
  return charLimit ? (
    <span className="text-red italic ml-2">
      {field.value.length}/{charLimit}
    </span>
  ) : null;
};

export interface FieldProps extends PropsWithClassName {
  field: FieldApi;
  hideTooltip?: boolean;
  hideError?: boolean;
}

const standardInputStyle =
  'bg-white focus:ring-4 focus:ring-offset-1 focus:ring-blue-500 focus:outline-none text-black border border-gray-300 px-2 py-1 rounded-sm w-full relative placeholder-opacity-50 placeholder-gray-400';

export interface TextFieldProps extends FieldProps {
  type?: string;
  maxChars?: number;
  showCharCount?: boolean;
  placeholder?: string;
  labelRight?: ReactNode;
  hideValidationIndicator?: boolean;
}

export const TextInput = (
  props: TextFieldProps & { extraInputProps?: any },
) => {
  const {
    field,
    type = 'text',
    className,
    maxChars,
    hideError,
    showCharCount,
    placeholder,
    extraInputProps,
    labelRight,
    hideValidationIndicator,
  } = props;

  return (
    <div className={className}>
      <FieldLabel {...props}>
        {labelRight ||
          (showCharCount ? (
            <FieldCharLimitIndicator field={field} charLimit={maxChars} />
          ) : null)}
      </FieldLabel>
      <div className="flex flex-row justify-start items-center">
        <input
          className={standardInputStyle}
          type={type}
          maxLength={maxChars}
          name={field.name}
          value={field.value}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          {...extraInputProps}
        ></input>
        <FieldSuffix
          field={field}
          hideValidationIndicator={hideValidationIndicator}
        />
      </div>
      {hideError ? null : <FieldError {...field} />}
    </div>
  );
};

export const NumberInput = (
  props: TextFieldProps & { min?: number; max?: number; step?: number },
) => {
  const { min, max, step } = props;

  return (
    <TextInput
      {...props}
      extraInputProps={{
        type: 'number',
        min,
        max,
        step,
      }}
    />
  );
};

export const TextArea = (props: TextFieldProps & { rows?: number }) => {
  const {
    field,
    className,
    maxChars,
    showCharCount,
    placeholder,
    rows,
    hideError,
  } = props;

  return (
    <div className={className}>
      <FieldLabel {...props}>
        {showCharCount ? (
          <FieldCharLimitIndicator field={field} charLimit={maxChars} />
        ) : null}
      </FieldLabel>
      <div className="flex flex-row justify-start items-center">
        <textarea
          rows={rows}
          maxLength={maxChars}
          className={standardInputStyle}
          name={field.name}
          value={field.value}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
        />
        <FieldSuffix field={field} />
      </div>
      {hideError ? null : <FieldError {...field} />}
    </div>
  );
};

