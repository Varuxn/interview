// hooks/useStepRedirect.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useStepRedirect = (currentStep: number, targetStep: number, path: string) => {
  const router = useRouter();

  useEffect(() => {
    if (currentStep === targetStep) {
      router.push(path);
    }
  }, [currentStep, targetStep, path, router]);
};

export default useStepRedirect;