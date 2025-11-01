import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";
import { TRPCReactProvider } from "~/lib/client/trpc/client";

export function Providers({ children }: PropsWithChildren) {
  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </TRPCReactProvider>
  );
}
