import React, {useLayoutEffect, useRef} from "react";

const ErudaContainer = (): JSX.Element => {
    const container = useRef();
    useLayoutEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        eruda.init({
            container: container.current,
            tool: ['console', 'elements', 'network'],
        });
    }, []);
    return <div ref={container.current} />;
};

export default React.memo(ErudaContainer);