import { QueryClient } from "@tanstack/react-query";



export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry:      1,       // reintenta 1 vez si falla
        staleTime:  0,       // cada página decide su staleTime
        refetchOnWindowFocus: false,  // no refetch al volver a la pestaña
      },
    },
  })

