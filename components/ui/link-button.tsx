'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button'
import { type VariantProps } from 'class-variance-authority'

interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string
}

export function LinkButton({
  className,
  variant,
  size,
  href,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Link>
  )
}
