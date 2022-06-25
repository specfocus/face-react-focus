import { useContext } from 'react';
import { Entity }  from '@specfocus/spec-focus/entities/Entity';
import { RecordContext } from './RecordContext';

/**
 * Hook to read the record from a RecordContext.
 *
 * Must be used within a <RecordContext> such as provided by the <EditContextProvider>
 * (e.g. as a descendent of <Edit> or <EditBase>) or within a <ShowContextProvider>
 * (e.g. as a descendent of <Show> or <ShowBase>)
 *
 * @example // basic usage
 *
 * import { useRecordContext } from '@specfocus/view-focus';
 *
 * const TitleField = () => {
 *     const record = useRecordContext();
 *     return <span>{record && record.title}</span>;
 * };
 *
 * @example // allow record override via props
 *
 * import { useRecordContext } from '@specfocus/view-focus';
 *
 * const TitleField = (props) => {
 *     const record = useRecordContext(props);
 *     return <span>{record && record.title}</span>;
 * };
 * render(<TextField record={record} />);
 *
 * @returns {Entity} A record object
 */
export const useRecordContext = <
  RecordType extends Entity | Omit<Entity, 'id'> = Entity
>(
  props?: UseRecordContextParams<RecordType>
): RecordType | undefined => {
  // Can't find a way to specify the RecordType when CreateContext is declared
  // @ts-ignore
  const context = useContext<RecordType>(RecordContext);

  return (props && props.record) || context;
};

export interface UseRecordContextParams<
  RecordType extends Entity | Omit<Entity, 'id'> = Entity
> {
  record?: RecordType;
  [key: string]: any;
}
