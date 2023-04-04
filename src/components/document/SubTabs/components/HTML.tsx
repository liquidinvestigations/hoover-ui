import { FC } from 'react'

export const HTML: FC<{ html: string }> = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html }} />
