import React from "react";

export const FeatureTrim = (props) => {
    const { children, features, feature } = props;

    return (
        ((features || []).indexOf(feature) > -1) ?
            <React.Fragment>
                {children}
            </React.Fragment> :
            null
    )
};