"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={`
      relative inline-flex items-center cursor-pointer rounded-full
      bg-gray-300 transition-colors duration-300 ease-in-out
      focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1
      data-[state=checked]:bg-primary
      disabled:cursor-not-allowed disabled:opacity-50
      px-0.5 py-0.5
      h-4 w-7
      sm:h-5 sm:w-9
      md:h-6 md:w-11
      ${className ?? ""}
    `}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={`
        block rounded-full bg-white shadow-sm
        transition-all duration-300 ease-out
        data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0
        data-[state=checked]:scale-110 data-[state=unchecked]:scale-100
        data-[state=checked]:shadow-md
        h-3 w-3
        sm:h-4 sm:w-4 sm:data-[state=checked]:translate-x-4
        md:h-5 md:w-5 md:data-[state=checked]:translate-x-5
        transform-gpu
      `}
    />
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }