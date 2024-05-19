import { Link} from 'nextra-theme-docs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FC, PropsWithChildren } from 'react';

export interface DownloadLinkProps {
  href: string;
}

export const DownloadLink: FC<PropsWithChildren<DownloadLinkProps>> = ({href, children}) => {
  
  return <Link href={href} className='nx-font-bold nx-flex nx-flex-row nx-items-center' newWindow={true}>
    <FontAwesomeIcon icon={faDownload} height={'1rem'} className='nx-mr-2' /> {children}
  </Link>;
}
