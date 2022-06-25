import { ReactElement } from 'react';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';
import { useRecordContext } from './useRecordContext';

/**
 * Render prop version of useRecordContext
 *
 * @example
 * const BookShow = () => (
 *    <Show>
 *       <SimpleShowLayout>
 *          <WithRecord render={record => <span>{record.title}</span>} />
 *      </SimpleShowLayout>
 *   </Show>
 * );
 */
export const WithRecord = <RecordType extends Entity>({
  render,
}: WithRecordProps<RecordType>) => {
  const record = useRecordContext<RecordType>();
  return record ? render(record) : null;
};

export interface WithRecordProps<RecordType extends Entity> {
  render: (record: RecordType) => ReactElement;
  label?: string;
}
