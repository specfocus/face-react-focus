import { Entity } from '@specfocus/spec-focus/entities/Entity';
import { FieldValues } from '@specfocus/spec-focus/fields';
import { FormProvider, UseFormProps } from '@specfocus/view-focus.forms/forms';
import { FormGroupsProvider } from '@specfocus/view-focus.forms/forms/FormGroupsProvider';
import { ValidateForm } from '@specfocus/view-focus.forms/forms/getSimpleValidationResolver';
import { ReactNode } from 'react';
import { useResourceContext } from '../resources';
import { OptionalRecordContextProvider, useRecordContext } from '../records';
import { LabelPrefixContextProvider } from '../utils';
import { useAugmentedForm } from './useAugmentedForm';

/**
 * Creates a form element, initialized with the current record, calling the saveContext on submit
 *
 * Wrapper around react-hook-form's useForm, FormContextProvider, and <form>.
 * Also sets up a FormGroupContext, and handles submission validation.
 *
 * @example
 *
 * const MyForm = ({ record, defaultValues, validate }) => (
 *    <Form record={record} defaultValues={defaultValues} validate={validate}>
 *        <Stack>
 *            <TextInput source="title" />
 *            <SaveButton />
 *        </Stack>
 *    </Form>
 * );
 *
 * @typedef {Object} Props the props you can use
 * @prop {Object} defaultValues
 * @prop {Function} validate
 * @prop {Function} save
 *
 * @see useForm
 * @see FormGroupContext
 *
 * @link https://react-hook-form.com/api/useformcontext
 */
export const Form = (props: FormProps) => {
  const { children, id, className, noValidate = false } = props;
  const record = useRecordContext(props);
  const resource = useResourceContext(props);
  const { form, formHandleSubmit } = useAugmentedForm(props);

  return (
    <OptionalRecordContextProvider value={record}>
      <LabelPrefixContextProvider prefix={`resources.${resource}.fields`}>
        <FormProvider {...form}>
          <FormGroupsProvider>
            <form
              onSubmit={formHandleSubmit}
              noValidate={noValidate}
              id={id}
              className={className}
            >
              {children}
            </form>
          </FormGroupsProvider>
        </FormProvider>
      </LabelPrefixContextProvider>
    </OptionalRecordContextProvider>
  );
};

export type FormProps = FormOwnProps &
  Omit<UseFormProps, 'onSubmit'> & {
    validate?: ValidateForm;
    noValidate?: boolean;
  };

export interface FormOwnProps {
  children: ReactNode;
  className?: string;
  defaultValues?: any;
  formRootPathname?: string;
  id?: string;
  record?: Partial<Entity>;
  resource?: string;
  onSubmit?: (data: FieldValues) => any | Promise<any>;
  warnWhenUnsavedChanges?: boolean;
}
