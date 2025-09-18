import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "text-xs font-regular rounded-md p-1"
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  backgroundColour?: string;
  textColour?: string;
}

function Badge({
  className,
  backgroundColour,
  textColour,
  style,
  ...props
}: BadgeProps) {
  const customStyle = {
    backgroundColor: backgroundColour,
    color: textColour,
    ...style,
  };

  return (
    <div
      className={cn(badgeVariants(), className)}
      style={customStyle}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
