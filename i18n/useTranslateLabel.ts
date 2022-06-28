import { useTranslate } from '@specfocus/view-focus.i18n/translations/useTranslate';
import { ReactElement, useCallback } from 'react';
import { useResourceContext } from '../resources';
import { getFieldLabelTranslationArgs, useLabelPrefix } from '../utils';

export const useTranslateLabel = () => {
  const translate = useTranslate();
  const prefix = useLabelPrefix();
  const resourceFromContext = useResourceContext();

  return useCallback(
    ({
      source,
      label,
      resource,
    }: {
      source?: string;
      label?: string | false | ReactElement;
      resource?: string;
    }) => {
      if (label === false || label === '') {
        return null;
      }

      if (label && typeof label !== 'string') {
        return label;
      }

      return translate(
        ...getFieldLabelTranslationArgs({
          label: label as string,
          prefix,
          resource,
          resourceFromContext,
          source,
        })
      );
    },
    [prefix, resourceFromContext, translate]
  );
};
