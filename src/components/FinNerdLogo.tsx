import React from 'react';
import { FinHornetLogo } from './FinHornetLogo';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const FinNerdLogo: React.FC<Props> = (props) => {
  return <FinHornetLogo {...props} />;
};

export default FinNerdLogo;
