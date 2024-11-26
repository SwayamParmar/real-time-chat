import React from "react";

const useMediaQuery = (width) => {
    const [targetReached, setTargetReached] = React.useState(false);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);
        setTargetReached(mediaQuery.matches);

        const handleResize = () => {
            setTargetReached(mediaQuery.matches);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [width]);

    return targetReached;
};

export default useMediaQuery;