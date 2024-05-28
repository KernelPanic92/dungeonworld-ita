import { FC, PropsWithChildren } from 'react';


export const ClassDetail: FC<PropsWithChildren> = ({children}) => {
  return <div className='flex flex-col lg:flex-row-reverse gap-10 mt-5'>
    {children}
  </div>
};

export const ClassDescription: FC<PropsWithChildren> = ({children}) => {
  return <div className='flex flex-col flex-1'>
    {children}
  </div>
};

export const Showcase: FC<PropsWithChildren> = ({children}) => {
  return <div className="flex flex-col flex-1 lg:flex-none lg:w-64 text-slate-400 text-sm text-center">
    {children}
  </div>;
}