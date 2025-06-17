import { createContext, useContext } from "react";
export const ControlContext = createContext([[], () => { }]);
export const ControlProvider = ControlContext.Provider;

export function useControlContext() {
    const context = useContext(ControlContext);

    if (context == null) {
        throw new Error(
            "No context provided: useControlContext() can only be used in a descendant of <LayerControl>"
        );
    }

    return context;
}