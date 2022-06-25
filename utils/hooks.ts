import isEqual from 'lodash/isEqual';
import { useEffect, useRef } from 'react';

// thanks Kent C Dodds for the following helpers

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useDeepCompareEffect(callback, inputs) {
  const cleanupRef = useRef();
  useEffect(() => {
    if (!isEqual(previousInputs, inputs)) {
      cleanupRef.current = callback();
    }
    return cleanupRef.current;
  });
  const previousInputs = usePrevious(inputs);
}

export function useIsMounted() {
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}
